package presenjs.server;
import haxe.Json;
import js.Node;
import ws.WsServer;

class Main 
{
	private var _server:WsServer;
	private var _presenterSocket:WsSocket;
	private var _audienceSockets:Array<WsSocket>;
	private var _screen:String;

	static function main() 
	{
		new Main();
	}
	
	public function new()
	{
		// 初期化
		_screen = null;
		_presenterSocket = null;
		_audienceSockets = new Array<WsSocket>();
		
		// サーバー立ち上げ
		_server = new WsServer( { port: 8081, path: '/ws/presenjs' } );
		_server.on(WsServerEventType.CONNECTION, onOpen);
	}

	/* ------------------------------------- */

	private function onOpen(client:WsSocket):Void
	{
		trace("open");
		
		// イベント登録
		client.on(WsSocketEventType.MESSAGE, function (data:Dynamic, flags:WsSocketFlags):Void {
			var d: { type:String, data:String } = Json.parse(data);
			switch (d.type)
			{
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
		});
		client.on(WsSocketEventType.CLOSE, function (code:Dynamic, msg:Dynamic):Void {
			//onClose(client, code, msg);
			
			if (_presenterSocket == client) {
				trace("close presenter");
				_presenterSocket = null;
				_screen = null;
			}
			else if (_audienceSockets.remove(client)) trace("close audience");
			else trace("close ?");
		});
		client.on(WsSocketEventType.ERROR, function (error:Dynamic):Void {
			//onError(client, error);
			trace("error");
		});
	}
	
}