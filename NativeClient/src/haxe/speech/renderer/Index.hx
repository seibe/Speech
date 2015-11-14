package speech.renderer;

import electron.WebViewElement;
import electron.MediaStreamTrack;
import haxe.Json;
import haxe.Timer;
import js.Browser;
import js.html.Element;
import js.html.LocalMediaStream;
import js.html.rtc.IceCandidate;
import js.html.rtc.SessionDescription;
import js.html.WebSocket;
import kurentoUtils.WebRtcPeer;
import speech.manager.DomManager;
import speech.manager.MediaManager;
import speech.renderer.Index.State;

enum State {
	SETUP;
	LIVE_STARTING;
	LIVE;
}

enum Request {
	JOIN_PRESENTER(option:Dynamic);
	LEAVE_PRESENTER;
	UPDATE_SLIDE(slideUrl:String);
	
	START_STREAM(offer:SessionDescription);
	STOP_STREAM();
	ICE_CANDIDATE(ice:IceCandidate);
}

class Index 
{
	private var WS_URL(default, null):String = "ws://localhost:8081/speech";
	private var _ws:WebSocket;
	private var _state:State;
	
	private var _prevUrl:String;
	private var _reqCount:Int;
	private var _title:String;
	private var _slideUrl:String;
	
	private var _slideview:WebViewElement;
	private var _webRtcPeer:WebRtcPeer;
	
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
			_title = null;
			_slideUrl = null;
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
				_title = _dom.getInput("title", "setup").value;
				_slideUrl = _dom.getInput("slide-url", "setup").value;
				temp["selectedVideo"] = _dom.getSelect("video", "setup").value;
				temp["selectedAudio"] = _dom.getSelect("audio", "setup").value;
				
				// イベントリスナー解除
				_dom.getButton("submit").addEventListener("click", onClickButtonStart);
				
			case State.LIVE_STARTING:
				//
				_dom.getDialog("loading").close();
				
			case State.LIVE:
				// プレイヤーのクリア
				_dom.get("player-main", "live").innerHTML = "";
				
				// 配信の終了
				if (_webRtcPeer != null) {
					send(Request.STOP_STREAM);
					_webRtcPeer.dispose();
					_webRtcPeer = null;
				}
				send(Request.LEAVE_PRESENTER);
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
				_ws.addEventListener("open", onWsConnect);
				_ws.addEventListener("close", onWsClose);
				_ws.addEventListener("message", onWsMessage);
				_ws.addEventListener("error", onWsError);
				
				// スライドビュー初期化
				_slideview = _dom.initPlayer(_slideUrl);
				_prevUrl = _slideUrl;
				
				// 映像配信の初期化
				if (temp["selectedVideo"] != null && temp["selectedVideo"].length > 0) {
					// WebCamの登録
					trace("webcam: " + temp["selectedVideo"]);
					var videoElem = _dom.addVideo("webcam");
					_media.getUserVideo(temp["selectedVideo"], function(lms):Void {
						//
						trace("get!");
						_webRtcPeer = WebRtcPeer.WebRtcPeerSendonly({
							localVideo: videoElem,
							videoStream: lms,
							onicecandidate: onIcecandidate
						}, function (err:Dynamic):Void {
							if (err != null) setState(State.SETUP);
							_webRtcPeer.generateOffer(onOffer);
						});
					}, function(err):Void {
						trace("error getuservideo");
					});
					
				}
				
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
				send(Request.UPDATE_SLIDE(url));
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
			case Request.JOIN_PRESENTER(option):
				obj.type = "joinPresenter";
				obj.data = option;
				
			case Request.LEAVE_PRESENTER:
				obj.type = "leavePresenter";
				
			case Request.UPDATE_SLIDE(slideUrl):
				obj.type = "updateSlide";
				obj.data = slideUrl;
				
			case Request.START_STREAM(offerSdp):
				obj.type = "startStream";
				obj.data = offerSdp;
				
			case Request.STOP_STREAM:
				obj.type = "stopStream";
				
			case Request.ICE_CANDIDATE(candidate):
				obj.type = "iceCandidate";
				obj.data = candidate;
		}
		
		obj.timestamp = Date.now().getTime();
		obj.requestId = _reqCount++;
		_ws.send( Json.stringify(obj) );
		
		return _reqCount;
	}
	
	private function onWsConnect(e:Dynamic):Void
	{
		// 部屋を作成する
		send(Request.JOIN_PRESENTER( {
			title: _title,
			slideUrl: _slideUrl
		} ));
	}
	
	private function onWsClose(e:Dynamic):Void
	{
		setState(State.SETUP);
	}
	
	private function onWsMessage(e:Dynamic):Void
	{
		var resp:Dynamic = Json.parse(e.data);
		
		switch (resp.type)
		{
			case "accept":
				_dom.getInput("url", "live").value = resp.data;
				setState(State.LIVE);
				
			case 'acceptStream':
				_webRtcPeer.processAnswer(resp.data);
				
			case "onStopStream":
				_webRtcPeer.dispose();
				_webRtcPeer = null;
				
			case 'iceCandidate': //iceCandidate
				_webRtcPeer.addIceCandidate(resp.data);
				
			default:
				trace("unknown ws", resp);
		}
	}
	
	private function onWsError(error:Dynamic):Void
	{
		trace("error", error);
		setState(State.SETUP);
	}
	
	private function onOffer(error:Dynamic, offerSdp:SessionDescription):Void
	{
		send(Request.START_STREAM(offerSdp));
	}
	
	private function onIcecandidate(candidate:IceCandidate):Void
	{
		send(Request.ICE_CANDIDATE(candidate));
	}
	
}
