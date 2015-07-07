package presenjs.app;

import electron.Electron;
import electron.ElectronNativeImage;
import electron.WebViewElement;
import haxe.Json;
import haxe.Timer;
import js.Browser;
import js.html.ButtonElement;
import js.html.Element;
import js.html.InputElement;
import js.html.WebSocket;
import js.Node;

class Index 
{
	private var WS_URL(default, null):String = "ws://localhost:8081/ws/presenjs";
	private var _ws:WebSocket;
	private var _isConnect:Bool;
	private var _prevCapstr:String;
	
	static function main() 
	{
		new Index();
	}
	
	public function new()
	{
		Browser.window.onload = init;
	}
	
	private function init():Void
	{
		_isConnect = false;
		_prevCapstr = "";
		
		_ws = new WebSocket(WS_URL);
		_ws.addEventListener("open", onConnect);
		_ws.addEventListener("close", onDisconnect);
		//_ws.onmessage = null;
		//_ws.onerror = null;
		
		var webview:WebViewElement = cast Browser.document.getElementById("preview");
		webview.addEventListener(WebViewEventType.DID_FINISH_LOAD, capture);
		webview.addEventListener("keydown", function(e):Void{ Timer.delay(capture, 250); });
	}

	private function capture():Void
	{
		var win = Electron.remote.getCurrentWindow();
		win.capturePage(function(img:ElectronNativeImage):Void {
			var capstr = img.toDataUrl();
			if (_prevCapstr != capstr) {
				_prevCapstr = capstr;
				//Node.fs.writeFile("screenshot.png", img.toPng(), null);
				if (_isConnect) {
					_ws.send( Json.stringify( { type: "updateScreen", data: capstr } ) );
				}
			}
		});
	}
	
	private function onConnect(e:Dynamic):Void
	{
		_isConnect = true;
		_ws.send(Json.stringify( { type: "presenter" } ));
		
		_prevCapstr = "";
		capture();
	}
	
	private function onDisconnect(e:Dynamic):Void
	{
		_isConnect = false;
	}
	
}