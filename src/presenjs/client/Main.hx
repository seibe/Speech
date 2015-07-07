package presenjs.client;

import haxe.Json;
import js.Browser;
import js.html.ImageElement;
import js.html.WebSocket;

class Main
{
	private var WS_URL(default, null):String = "ws://localhost:8081/ws/presenjs";
	private var _ws:WebSocket;
	private var _isConnect:Bool;
	private var _img:ImageElement;
	
	static function main() 
	{
		new Main();
	}
	
	public function new()
	{
		Browser.window.onload = init;
	}
	
	private function init():Void
	{
		_isConnect = false;
		_img = cast Browser.document.getElementById("view");
		_img.src = "wait.jpg";
		
		_ws = new WebSocket(WS_URL);
		_ws.addEventListener("open", onConnect);
		_ws.addEventListener("close", onDisconnect);
		_ws.addEventListener("message", onMessage);
		//_ws.onerror = null;
	}
	
	private function onConnect(e:Dynamic):Void
	{
		trace("open websocket");
		_isConnect = true;
		_ws.send(Json.stringify( { type: "audience" } ));
	}
	
	private function onDisconnect(e:Dynamic):Void
	{
		trace("close websocket");
		_isConnect = false;
		_img.src = "wait.jpg";
	}
	
	private function onMessage(e:Dynamic):Void
	{
		var m: { type:String, data:String } = Json.parse(e.data);
		
		switch (m.type)
		{
			case "updateScreen":
				trace("updateScreen");
				_img.src = m.data;
				
			default:
				trace("unknown message");
		}
	}
}
