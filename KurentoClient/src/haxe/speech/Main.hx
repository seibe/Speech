package speech;

import haxe.Json;
import js.Error;
import js.node.Fs;
import js.node.Https;
import js.Promise;
import kurento.core.MediaPipeline;
import kurento.kurentoClient.KurentoClient;
import speech.core.Room;
import speech.core.Session;
import ws.WsServer;

class Main 
{
	
	private static inline var MS_URI:String = "ws://localhost:8888/kurento";
	private static inline var MV_DIR:String = "file:///var/www/example.com/record";
	private static inline var TLS_KEY:String = "/etc/letsencrypt/live/example.com/privkey.pem";
	private static inline var TLS_CERT:String = "/etc/letsencrypt/live/example.com/cert.pem";
	
	private var _server:WsServer;
	private var _roomList:Array<Room>;
	private var _sessionList:Array<Session>;

	static function main() 
	{
		new Main();
	}
	
	public function new()
	{
		// 初期化
		_roomList = new Array<Room>();
		_sessionList = new Array<Session>();
		
		// HTTPS立ち上げ
		var server = untyped Https.createServer( {
			key: Fs.readFileSync(TLS_KEY),
			cert: Fs.readFileSync(TLS_CERT)
		}, function(req, res):Void {
			// ダミーリクエスト処理
			res.writeHead(200);
			res.end("All glory to WebSockets!\n");
		}).listen(8081);
		
		// サーバー立ち上げ
		_server = new WsServer({ server: cast server, path: "/speech" });
		_server.on("connection", function (ws:WsSocket):Void {
			//
			var session = new Session(ws);
			_sessionList.push(session);
			trace("Connection received with sessionId", session.id);
			
			//
			ws.on("message", function(data:Dynamic, flags:WsSocketFlags):Void { onWsMessage(session, data, flags); } );
			ws.on("close", function():Void { onWsClose(session); } );
			ws.on("error", function(error:Dynamic):Void { onWsError(session, error); } );
		});
	}

	/* ------------------------------------- */
	
	private function onWsMessage(session:Session, data:Dynamic, flags:WsSocketFlags):Void
	{
		var mes = Json.parse(data);
		var d:Dynamic = mes.data;
		
		trace("onWsMessage", mes.type);
		switch (mes.type)
		{
			case "joinPresenter":
				// 放送者が部屋を作り、配信を始める
				var room = new Room(d.title, d.description, session, d.slideUrl);
				_roomList.push(room);
				
				session.ws.send(Json.stringify( {
					type: "accept",
					data: room.id
				} ));
				
			case "leavePresenter":
				// 放送者が配信を終え、部屋を閉じる
				_roomList.remove(session.room);
				session.destroy();
				
			case "updateSlide":
				// 放送者がスライドを切り替える
				session.room.broadcast(Response.UPDATE_SLIDE(d));
				
			case "startStream":
				// 放送者が映像配信を始める
				session.startStream(MS_URI, MV_DIR, d);
				
			case "stopStream":
				// 放送者が映像配信を終える
				session.stopStream();
				
			case "appendMedia":
				// 放送者がメディアを追加する
				
			case "removeMedia":
				// 放送者がメディアを削除する
				
			case "joinViewer":
				// 視聴者が部屋に入る
				if (d != null && d.roomId != null) {
					for (room in _roomList) {
						if (room.id == d.roomId) {
							// 部屋があった
							onJoinViewer(session, room, d);
							return;
						}
					}
				}
					
				// そんな部屋は無い
				if (_roomList.length == 0) {
					// 一つも部屋がない
					session.ws.send(Json.stringify( {
						type: "onError",
						data: "指定された部屋は存在しないか、中継が終了しています"
					} ));
					session.destroy();
				} else {
					// 適当に突っ込む
					onJoinViewer(session, _roomList[0], d);
				}
				
			case "requestStream":
				// 視聴者が映像配信を要求する
				if (d != null) session.connectStream(d);
				
			case "leaveViewer":
				// 視聴者が部屋を去る
				session.destroy();
				
			case "comment":
				// コメントする
				session.room.broadcast(Response.COMMENT(d.name, d.text, d.slideUrl));
				
			case "iceCandidate":
				// 経路情報を交換する
				session.addIceCandidate(d);
				
			default:
				trace("ws throw", mes.type);
		}
	}
	
	private function onWsClose(session:Session):Void
	{
		trace("close ws id: " + session.id);
		if (session.isPresenter()) {
			_roomList.remove(session.room);
			session.room.destroy();
		}
		session.destroy();
		_sessionList.remove(session);
	}
	
	private function onWsError(session:Session, error:Dynamic):Void
	{
		trace("ws error", error);
	}
	
	/* ------------------------------------- */
	
	private function onJoinViewer(viewer:Session, room:Room, ?data:Dynamic):Void
	{
		room.viewerList.push(viewer);
		viewer.room = room;
		viewer.ws.send(Json.stringify( {
			type: "accept",
			data: {
				title: room.title,
				description: room.description,
				slideUrl: room.slideUrl
			},
			timestamp: Date.now().getTime()
		} ));
		
		if (room.presenter.endpoint != null) {
			if (data != null && data.sdpOffer != null) {
				// 配信映像を受信できるならする
				viewer.connectStream(data.sdpOffer);
			} else {
				// 映像配信していることを通知する
				viewer.ws.send(Json.stringify( {
					type: "canStartStream",
					timestamp: Date.now().getTime()
				}));
			}
		}
		
	}
	
}
