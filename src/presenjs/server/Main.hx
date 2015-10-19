package presenjs.server;

import haxe.Json;
import js.Error;
import js.Node;
import js.node.Crypto;
import js.node.crypto.Hash;
import js.node.Fs;
import presenjs.server.Main.Room;
import ws.WsServer;

typedef Room = {
	title:String,
	filename:String,
	presenter:WsSocket,
	audience:Array<WsSocket>,
	slideUrl:String
}

enum Response {
	ON_CREATE(roomUrl:String);
	ON_ENTER(userId:String, totalNum:Int);
	ON_LEAVE(userId:String);
	ON_BEGIN;
	ON_PAUSE;
	ON_END;
	ON_OPEN(slideUrl:String);
	ON_CHANGE(slideUrl:String);
	ON_COMMENT(name:String, text:String);
	ON_ERROR(error:Dynamic);
}

class Main 
{
	private var _server:WsServer;
	private var _room:Array<Room>;
	//private var _presenterSocket:WsSocket;
	//private var _audienceSockets:Array<WsSocket>;
	//private var _screen:String;

	static function main() 
	{
		new Main();
	}
	
	public function new()
	{
		// 初期化
		_room = new Array<Room>();
		
		// サーバー立ち上げ
		_server = new WsServer( { port: 8081, path: '/ws/presenjs' } );
		_server.on("connection", onOpen);
	}

	/* ------------------------------------- */

	private function onOpen(client:WsSocket):Void
	{
		//trace("open");
		
		// イベント登録
		client.on(WsSocketEventType.MESSAGE, function (data:Dynamic, flags:WsSocketFlags):Void {
			var d:Dynamic = Json.parse(data);
			
			trace(d.type);
			
			switch (d.type)
			{
				case "create":
					var hash:Hash = Crypto.createHash("sha1");
					hash.update( Std.string(Date.now().getTime()) + Std.string(Math.random()) );
					var name:String = hash.digest("hex");
					Fs.writeFile(Node.__dirname + "/file/" + name + ".txt", d.timestamp + ",create\r\n", function(e:Error):Void { if (e != null) trace(e); } );
					var room:Room = {
						title: d.data.option.title,
						filename: name,
						presenter: client,
						audience: new Array<WsSocket>(),
						slideUrl: null
					};
					_room.push(room);
					send(room, Response.ON_CREATE(name), d.requestId);
					
				case "begin":
					for (r in _room) {
						if (r.presenter == client) {
							write(r, d.timestamp, "begin");
							send(r, Response.ON_BEGIN, d.requestId);
							break;
						}
					}
					
				case "pause":
					//
					
				case "end":
					for (r in _room) {
						if (r.presenter == client) {
							write(r, d.timestamp, "end");
							send(r, Response.ON_END, d.requestId);
							client.close();
							//_room.remove(r);
							break;
						}
					}
					
				case "open":
					for (r in _room) {
						if (r.presenter == client) {
							write(r, d.timestamp, "open," + d.data.slideUrl);
							send(r, Response.ON_OPEN(d.data.slideUrl), d.requestId);
							r.slideUrl = d.data.slideUrl;
							break;
						}
					}
					
				case "change":
					for (r in _room) {
						if (r.presenter == client) {
							write(r, d.timestamp, "change," + d.data.slideUrl);
							send(r, Response.ON_CHANGE(d.data.slideUrl), d.requestId);
							break;
						}
					}
					
				case "enter":
					for (r in _room) {
						if (r.filename == d.data.roomId) {
							// 部屋が適合した
							r.audience.push(client);
							client.send(Json.stringify( {
								type: "onEnter",
								data: { title: r.title, slideUrl: r.slideUrl }
							} ));
							return;
						}
					}
						
					// そんな部屋は無い
					client.send(Json.stringify( {
						type: "onError",
						data: "指定された部屋は存在しないか、中継が終了しています"
					} ));
					client.close();
					
				case "comment":
					for (r in _room) {
						if (r.filename == d.data.roomId) {
							// 部屋が適合した
							write(r, d.timestamp, Json.stringify({name: d.data.name, text: d.data.text, url: d.data.slideUrl}));
							send(r, Response.ON_COMMENT(d.data.name, d.data.text), d.requestId);
							return;
						}
					}
						
					// そんな部屋は無い
					client.send(Json.stringify( {
						type: "onError",
						data: "指定された部屋は存在しないか、中継が終了しています"
					} ));
					client.close();
					
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
				*/
			}
		});
		client.on(WsSocketEventType.CLOSE, function (code:Dynamic, msg:Dynamic):Void {
			
			for (r in _room) {
				if (r.presenter == client) {
					// プレゼンターが突然の終了
					trace("close presenter");
					_room.remove(r);
					break;
				}
				for (a in r.audience) {
					if (a == client) {
						// 視聴者が離脱
						trace("close audience");
						r.audience.remove(client);
						break;
					}
				}
			}
			
			/*
			if (_presenterSocket == client) {
				trace("close presenter");
				_presenterSocket = null;
				_screen = null;
			}
			else if (_audienceSockets.remove(client)) trace("close audience");
			else trace("close ?");
			*/
		});
		client.on(WsSocketEventType.ERROR, function (error:Dynamic):Void {
			//onError(client, error);
			throw error;
		});
	}
	
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
		room.presenter.send(data);
		for (a in room.audience) a.send(data);
	}
	
	private function write(room:Room, timestamp:String, data:String):Void
	{
		Fs.appendFile(
			Node.__dirname + "/file/" + room.filename + ".txt",
			timestamp + "," + data + "\r\n",
			function(e:Error):Void { if (e != null) trace(e); }
		);
	}
	
}