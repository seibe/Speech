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
import speech.renderer.Index.State;

enum State {
	SETUP;
	LIVE_STARTING;
	LIVE;
}

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
	private var MS_URL(default, null):String = "ws://localhost:8088/kurento";
	private var _ws:WebSocket;
	private var _state:State;
	
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
		Browser.window.onload = function():Void {
			_state = null;
			_prevUrl = "";
			_reqCount = 0;
			_slideview = null;
			
			_dom = new DomManager();
			_media = new MediaManager();
			
			setState(State.SETUP);
			
			// デバッグ用イベント
			// _webview.addEventListener(WebViewEventType.DID_FINISH_LOAD, function():Void { trace("did_finish_load", _webview.getUrl()); } );
			// Timer.delay(function():Void { _webview.openDevTools(); }, 1000);
		}
		Browser.window.onunload = function():Void {
			if (_ws != null) _ws.close();
		}
	}
	
	private function setState(nextState:State):Void
	{
		if (_state == nextState) return;
		var temp = new Map<String, String>();
		
		// シーンの終了処理
		switch (_state)
		{
			case State.SETUP:
				// フォーム各値の取得
				temp["title"] = _dom.getInput("title", "setup").value;
				temp["selectedVideo"] = _dom.getSelect("video", "setup").value;
				temp["selectedAudio"] = _dom.getSelect("audio", "setup").value;
				temp["slideUrl"] = _dom.getInput("slide-url", "setup").value;
				
				// イベントリスナー解除
				_dom.getButton("submit").addEventListener("click", onClickButtonStart);
				
			case State.LIVE_STARTING:
				//
				_dom.getDialog("loading").close();
				
			case State.LIVE:
				// プレイヤーのクリア
				_dom.get("player-main", "live").innerHTML = "";
				
				// 配信の終了
				send(Request.END);
				_ws.close();
				_ws = null;
				
				// イベントリスナー解除
				Browser.window.removeEventListener("resize", onResize);
				_slideview.removeEventListener("keydown", onChangeSlide);
				_slideview.removeEventListener("wheel", onChangeSlide);
				_slideview.removeEventListener("mouseup", onChangeSlide);
				
			case null:
				//
		}
		
		// シーンの開始処理
		switch (nextState)
		{
			case State.SETUP:
				// DOM表示切替
				_dom.changeScene("setup");
				
				// メディアソースの取得と反映
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
				
				// イベントリスナー登録
				_dom.getButton("submit").addEventListener("click", onClickButtonStart);
				
			case State.LIVE_STARTING:
				// DOM表示切替
				_dom.getDialog("loading").showModal();
				
				// WebSocketサーバーに接続する
				_ws = new WebSocket(WS_URL);
				_ws.addEventListener("open", onConnect);
				_ws.addEventListener("close", onDisconnect);
				_ws.addEventListener("message", onReceive);
				_ws.addEventListener("error", onError);
				
				// スライドビュー初期化
				_slideview = _dom.initPlayer(temp["slideUrl"]);
				_prevUrl = temp["slideUrl"];
				
				// リッチメディアの反映
				_media.getUserMedia(temp["selectedVideo"], temp["selectedAudio"], function(lms):Void {
					var src = untyped Browser.window.URL.createObjectURL(lms);
					_dom.addVideo("webcam", src);
				}, function(err):Void {
					trace("error getusermedia");
				});
				
			case State.LIVE:
				// DOM表示切替
				_dom.changeScene("live");
				
				// イベントリスナー登録
				Browser.window.addEventListener("resize", onResize);
				onResize();
				_slideview.addEventListener("keydown", onChangeSlide);
				_slideview.addEventListener("wheel", onChangeSlide);
				_slideview.addEventListener("mouseup", onChangeSlide);
				_dom.getButton("finish").addEventListener("click", onClickButtonFinish);
				
				//send(Request.BEGIN);
				send(Request.OPEN(_slideview.getUrl(), {}));
		}
		
		_state = nextState;
	}
	
	private function onChangeSlide():Void
	{
		if (_state != State.LIVE) return;
		
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
		var playerHeight = _dom.get("player-main", "live").offsetHeight;
		_slideview.style.height = Std.string(playerHeight) + "px";
	}
	
	private function onClickButtonStart():Void
	{
		var slideUrl = _dom.getInput("slide-url").value;
		var title = _dom.getInput("title").value;
		var urlChecker:EReg = ~/https?:\/\/.+/;
		if (slideUrl.length == 0 || title.length == 0 || !urlChecker.match(slideUrl)) {
			_dom.getInput("slide-url").focus();
		} else {
			setState(State.LIVE_STARTING);
		}
	}
	
	private function onClickButtonFinish():Void
	{
		setState(State.SETUP);
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
		// 部屋を作成する
		send(Request.CREATE( {
			title: "test room",
			aspect: "4:3"
		} ));
	}
	
	private function onDisconnect(e:Dynamic):Void
	{
		setState(State.SETUP);
	}
	
	private function onReceive(e:Dynamic):Void
	{
		var resp:Dynamic = Json.parse(e.data);
		
		switch (resp.type)
		{
			case "onCreate":
				_dom.getInput("url", "live").value = resp.data;
				setState(State.LIVE);
				
			case "onBegin":
				trace("onBegin");
				
			case "onPause":
				trace("onPause");
				
			case "onEnd":
				trace("onEnd");
				
			case "onEnter":
				trace("onEnter");
				
			case "onLeave":
				trace("onLeave");
				
			case "onError":
				trace("resp error", resp.data);
		}
	}
	
	private function onError(e:Dynamic):Void
	{
		trace("error", e);
		setState(State.SETUP);
	}
}
