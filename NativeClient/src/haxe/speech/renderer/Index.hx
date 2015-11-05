package speech.renderer;

import electron.WebViewElement;
import electron.MediaStreamTrack;
import haxe.Json;
import haxe.Timer;
import js.Browser;
import js.html.Element;
import js.html.WebSocket;
import speech.manager.DomManager;
import speech.manager.MediaManager;

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
	private var _reqCount:Int;
	
	private var _slideview:WebViewElement;
	
	private var _dom:DomManager;
	private var _media:MediaManager;
	
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
		_slideview = null;
		
		// 1. Dom要素を取得する
		_dom = new DomManager();
		_media = new MediaManager();
		
		// 2. レイアウト
		initSetup();
		
		// 3. WebSocketサーバーに接続する
		_ws = new WebSocket(WS_URL);
		_ws.addEventListener("open", onConnect);
		_ws.addEventListener("close", onDisconnect);
		_ws.addEventListener("message", onReceive);
		_ws.addEventListener("error", onError);
		
		/*
		btnEnd.addEventListener("click", function(e:Dynamic):Void {
			btnEnd.disabled = true;
			send(Request.END);
		});
		
		// デバッグ用イベント
		_webview.addEventListener(WebViewEventType.DID_FINISH_LOAD, function():Void { trace("did_finish_load", _webview.getUrl()); } );
		Timer.delay(function():Void { _webview.openDevTools(); }, 1000);
		_webview.addEventListener("keydown", function(e):Void{ Timer.delay(capture, 250); });
		_webview.addEventListener("hashchange", function(e):Void { trace("onPopState!!!"); } );
		*/
	}
	
	private function initSetup():Void
	{
		_dom.changeScene("setup");
		
		// ソースセレクタ
		var videoList = new Array<MediaStreamTrack>();
		var audioList = new Array<MediaStreamTrack>();
		_media.getTrackList(function(data:Array<MediaStreamTrack>):Void {
			for (track in data) {
				switch (track.kind) {
					case "video": videoList.push(track);
					case "audio": audioList.push(track);
					default: trace(track);
				}
			}
			_dom.setMediaSource("video", videoList);
			_dom.setMediaSource("audio", audioList);
		});
		
		// クリアボタン
		_dom.getButton("cancel").addEventListener("click", function():Void {
			_dom.getInput("slide-url").value = "";
			_dom.getInput("title").value = "";
		});
		
		// スタートボタン
		_dom.getButton("submit").addEventListener("click", function():Void {
			var slideUrl = _dom.getInput("slide-url").value;
			var title = _dom.getInput("title").value;
			var urlCheck:EReg = ~/https?:\/\/.+/;
			if (slideUrl.length > 0 && title.length > 0) {
				if (!urlCheck.match(slideUrl)) {
					_dom.getInput("slide-url").focus();
					return;
				}
				initLive();
			}
		});
	}
	
	private function initLive():Void
	{
		_dom.changeScene("live");
		
		// タイトルテキスト
		var title = _dom.getInput("title", "setup").value;
		_dom.get("title").innerText = title;
		
		// スライドビュー
		var slideUrl = _dom.getInput("slide-url", "setup").value;
		_slideview = _dom.initSlideView(slideUrl);
		_prevUrl = slideUrl;
		
		Browser.window.addEventListener("resize", onResize);
		onResize();
		_slideview.addEventListener("keydown", changeSlide);
		_slideview.addEventListener("wheel", changeSlide);
		_slideview.addEventListener("mouseup", changeSlide);
		
		// カメラとマイク
		var selectVideo = _dom.getSelect("video", "setup");
		var selectAudio = _dom.getSelect("audio", "setup");
		_media.getUserMedia(selectVideo.value, selectAudio.value, function(lms):Void {
			var src = untyped Browser.window.URL.createObjectURL(lms);
			_dom.addVideo("webcam", src);
		}, function(err):Void {
			trace("error getusermedia");
		});
		
		// ブロードキャスト開始
		send(Request.BEGIN);
		send(Request.OPEN(slideUrl, {}));
	}
	
	private function changeSlide():Void
	{
		if (!_isBegin) return;
		Timer.delay( function():Void {
			// 前回とURLが異なっていればページ移動したと看做す
			var url:String = _slideview.getUrl();
			if (_prevUrl != url) {
				send(Request.CHANGE(url));
				_prevUrl = url;
			}
		}, 250);
	}
	
	private function onResize():Void
	{
		var playerHeight = _dom.get("player-main").offsetHeight;
		_slideview.style.height = Std.string(playerHeight) + "px";
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
				_dom.getInput("url", "live").value = resp.data;
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
