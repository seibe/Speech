package speech.renderer;

import electron.Electron;
import electron.ElectronBrowserWindow;
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

enum Request {
	CREATE(option:Dynamic);
	BEGIN;
	PAUSE;
	END;
	OPEN(slideUrl:String, option:Dynamic);
	CHANGE(slideUrl:String);
}

class Index 
{
	private var WS_URL(default, null):String = "ws://localhost:8081/ws/presenjs";
	private var _ws:WebSocket;
	private var _isConnect:Bool;
	private var _isCreate:Bool;
	private var _isBegin:Bool;
	private var _prevUrl:String;
	private var _console:Element;
	
	private var _reqCount:Int;
	
	private var _myself:ElectronBrowserWindow;
	private var _webviewContainer:Element;
	private var _webview:WebViewElement;
	
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
		_isBegin = _isCreate = _isConnect = false;
		_prevUrl = "";
		_reqCount = 0;
		
		// 1. WebSocketサーバーに接続する
		_ws = new WebSocket(WS_URL);
		_ws.addEventListener("open", onConnect);
		_ws.addEventListener("close", onDisconnect);
		_ws.addEventListener("message", onReceive);
		_ws.addEventListener("error", onError);
		
		// 2. Dom要素を取得する
		_webview = cast Browser.document.getElementById("preview");
		_webviewContainer = Browser.document.getElementById("preview-container");
		
		Browser.window.addEventListener("resize", onResize);
		onResize();
		
		/*
		_console = Browser.document.getElementById("info-console");
		var btnOpen:ButtonElement = cast Browser.document.getElementById("btn-open");
		var btnBegin:ButtonElement = cast Browser.document.getElementById("btn-begin");
		var btnEnd:ButtonElement = cast Browser.document.getElementById("btn-end");
		
		// 3. イベントを登録する
		btnOpen.addEventListener("click", function(e:Dynamic):Void {
			_webview.src = "file://" + Node.__dirname + "/blank.html";
		});
		btnBegin.addEventListener("click", function(e:Dynamic):Void {
			var reg:EReg = ~/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/;
			var url:String = _webview.getUrl();
			
			if (reg.match(url)) {
				// URLがローカルでないならばスライドが指定されたと看做す
				btnBegin.disabled = true;
				btnEnd.disabled = false;
				
				send(Request.BEGIN);
				send(Request.OPEN(url, { } ));
				
				_isBegin = true;
				_prevUrl = url;
			}
		});
		btnEnd.addEventListener("click", function(e:Dynamic):Void {
			btnEnd.disabled = true;
			send(Request.END);
		});
		
		//_prevUrl = _webview.getUrl();
		_webview.addEventListener("keydown", function(e:Dynamic):Void {
			trace("on key down");
			if (!_isBegin) return;
			Timer.delay( function():Void {
				// 前回とURLが異なっていればページ移動したと看做す
				var url:String = _webview.getUrl();
				if (_prevUrl != url) {
					_console.innerHTML += "<br/>" + url;
					send(Request.CHANGE(url));
					_prevUrl = url;
				}
			}, 250);
		});*/
		
		// デバッグ用イベント
		//_webview.addEventListener(WebViewEventType.DID_FINISH_LOAD, function():Void { trace("did_finish_load", _webview.getUrl()); } );
		//Timer.delay(function():Void { _webview.openDevTools(); }, 1000);
		//_webview.addEventListener("keydown", function(e):Void{ Timer.delay(capture, 250); });
		//_webview.addEventListener("hashchange", function(e):Void { trace("onPopState!!!"); } );
	}
	
	private function onResize():Void
	{
		_webview.style.height = Std.string(_webviewContainer.offsetHeight) + "px";
	}
	
	private function send(req:Request):Int
	{
		var obj:Dynamic = {};
		
		switch(req) {
			case Request.CREATE(option):
				obj.type = "create";
				obj.data = { "option": option };
				
			case Request.BEGIN:
				obj.type = "begin";
				
			case Request.PAUSE:
				obj.type = "pause";
				
			case Request.END:
				obj.type = "end";
				
			case Request.OPEN(slideUrl, option):
				obj.type = "open";
				obj.data = {
					"slideUrl": slideUrl,
					"option": option
				};
				
			case Request.CHANGE(slideUrl):
				obj.type = "change";
				obj.data = { "slideUrl": slideUrl };
				
			default:
				throw "argument error";
				return -1;
		}
		
		obj.timestamp = Date.now().getTime();
		obj.requestId = _reqCount++;
		_ws.send( Json.stringify(obj) );
		
		return _reqCount;
	}

	private function capture():Void
	{
		/*
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
		*/
	}
	
	private function onConnect(e:Dynamic):Void
	{
		trace("connect");
		_isConnect = true;
		
		// 部屋を作成する
		if (!_isCreate) {
			send(Request.CREATE( {
				title: "test room",
				aspect: "4:3"
			}));
		}
	}
	
	private function onDisconnect(e:Dynamic):Void
	{
		_isConnect = false;
	}
	
	private function onReceive(e:Dynamic):Void
	{
		var resp:Dynamic = Json.parse(e.data);
		
		switch (resp.type)
		{
			case "onCreate":
				_console.innerHTML += "<br/>room url: " + resp.data;
				_isCreate = true;
				
			case "onBegin":
				_isBegin = true;
				
			case "onPause":
				//
				
			case "onEnd":
				//
				
			case "onEnter":
				//
				
			case "onLeave":
				//
				
			case "onError":
				trace("resp error", resp.data);
		}
	}
	
	private function onError(e:Dynamic):Void
	{
		trace("error", e);
	}
	
}