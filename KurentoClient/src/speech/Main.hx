package speech;

import haxe.Json;
import js.Error;
import js.Promise;
import kurento.core.MediaPipeline;
import kurento.kurentoClient.KurentoClient;
import speech.core.Room;
import speech.core.Session;
import ws.WsServer;

class Main 
{
	private var WS_URI(default, never):Dynamic = { port: 8081, path: '/speech' };
	private static inline var MS_URI:String = "ws://153.126.210.105:8888/kurento";
	private static inline var MV_DIR:String = "file:///var/www";
	
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
		
		// サーバー立ち上げ
		_server = new WsServer(WS_URI);
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
		trace("room id", room.id);
		trace("room slide url", room.slideUrl);
		trace("room presenter id", room.presenter.id);
		trace("room video", room.presenter.endpoint != null);
		
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
	
	/*
	private function send(room:Room, resp:Response, ?requestId = -1)
	{
		var obj:Dynamic = {};
		
		switch (resp)
		{
			case Response.ON_CREATE(roomUrl):
				obj.type = "onCreate";
				obj.data = roomUrl;
				
			case Response.ON_BEGIN:
				obj.type = "onBegin";
				
			case Response.ON_PAUSE:
				obj.type = "onPause";
				
			case Response.ON_END:
				obj.type = "onEnd";
				
			case Response.ON_ENTER:
				obj.type = "onEnter";
				
			case Response.ON_OPEN(slideUrl):
				obj.type = "onOpen";
				obj.data = { slideUrl: slideUrl };
				
			case Response.ON_CHANGE(slideUrl):
				obj.type = "onChange";
				obj.data = { slideUrl: slideUrl };
				
			case Response.ON_COMMENT(name, text):
				obj.type = "onComment";
				obj.data = { name: name, text: text };
				
			default:
				trace("request error: " + resp.getName());
		}
		
		obj.timestamp = Date.now().getTime();
		obj.reqestId = requestId;
		
		var data:String = Json.stringify(obj);
		room.presenter.ws.send(data);
		for (viewer in room.viewerMap) viewer.ws.send(data);
	}*/
	
	/*
	private function onWsMessage(client:SessionData, data:Dynamic, flags:WsSocketFlags):Void
	{
		var d:Dynamic = Json.parse(data);
		
		trace(d.type);
		
		switch (d.type)
		{
			case "create":
				var name:String = getUniqueKey();
				Fs.writeFile(Node.__dirname + "/file/" + name + ".txt",
					d.timestamp + ",create\r\n",
					function(e:Error):Void { if (e != null) trace(e); }
				);
				var room:Room = {
					title: d.data.option.title,
					filename: name,
					presenter: client,
					viewerMap: new Map<String, SessionData>(),
					slideUrl: null
				};
				_room.push(room);
				broadcast(room, Response.ON_CREATE(name), d.requestId);
				
			case "begin":
				for (r in _room) {
					if (r.presenter == client) {
						write(r, d.timestamp, "begin");
						broadcast(r, Response.ON_BEGIN, d.requestId);
						break;
					}
				}
				
			case "pause":
				//
				
			case "end":
				for (r in _room) {
					if (r.presenter == client) {
						write(r, d.timestamp, "end");
						broadcast(r, Response.ON_END, d.requestId);
						r.presenter.ws.close();
						for (v in r.viewerMap) v.ws.close();
						//closeRoom(r);
						_room.remove(r);
						break;
					}
				}
				
			case "open":
				for (r in _room) {
					if (r.presenter == client) {
						write(r, d.timestamp, "open," + d.data.slideUrl);
						broadcast(r, Response.ON_OPEN(d.data.slideUrl), d.requestId);
						r.slideUrl = d.data.slideUrl;
						break;
					}
				}
				
			case "change":
				for (r in _room) {
					if (r.presenter == client) {
						write(r, d.timestamp, "change," + d.data.slideUrl);
						broadcast(r, Response.ON_CHANGE(d.data.slideUrl), d.requestId);
						break;
					}
				}
				
			case "enter":
				for (r in _room) {
					if (r.filename == d.data.roomId) {
						// 部屋が適合した
						r.viewerMap[client.id] = client;
						client.ws.send(Json.stringify( {
							type: "onEnter",
							data: { title: r.title, slideUrl: r.slideUrl }
						} ));
						return;
					}
				}
					
				// そんな部屋は無い
				client.ws.send(Json.stringify( {
					type: "onError",
					data: "指定された部屋は存在しないか、中継が終了しています"
				} ));
				client.ws.close();
				
			case "comment":
				for (r in _room) {
					if (r.filename == d.data.roomId) {
						// 部屋が適合した
						write(r, d.timestamp, Json.stringify({name: d.data.name, text: d.data.text, url: d.data.slideUrl}));
						broadcast(r, Response.ON_COMMENT(d.data.name, d.data.text), d.requestId);
						return;
					}
				}
					
				// そんな部屋は無い
				client.ws.send(Json.stringify( {
					type: "onError",
					data: "指定された部屋は存在しないか、中継が終了しています"
				} ));
				client.ws.close();
				
			case "offerPresenter":
				var promise = startPresenter(client, d.data);
				promise.then(function(sdpAnswer:String):Void {
					ws.send(Json.stringify({
						id: "presenterResponse",
						response: "accepted",
						sdpAnswer: sdpAnswer
					}));
				}).catchError(function(error:Error):Void {
					ws.send(Json.stringify({
						id: "presenterResponse",
						response: "rejected",
						message: error
					}));
				});
				
			case "offerViewer":
				var promise = startViewer(client, d.data);
				promise.then(function(sdpAnswer:String):Void {
					ws.send(Json.stringify({
						id: "viewerResponse",
						response: "accepted",
						sdpAnswer: sdpAnswer
					}));
				}).catchError(function(error:Error):Void {
					ws.send(Json.stringify({
						id: "viewerResponse",
						response: "rejected",
						message: error
					}));
				});
				
			case "onIceCandidate":
				onIceCandidate(client.id, d.data);
				
			default:
				trace("request error: " + d.type);
			
			/*
			case "presenter":
				trace("join: presenter");
				_presenterSocket = client;
				
			case "audience":
				trace("join: audience");
				_audienceSockets.push(client);
				if (_screen != null) client.send(Json.stringify( { type:"updateScreen", data: _screen } ));
				
			case "updateScreen": 
				if (client == _presenterSocket) {
					trace("update screen");
					_screen = d.data;
					for (s in _audienceSockets) s.send(data);
				}
				
			default:
				trace("unknown message");
			
		}
	}*/
	
}
