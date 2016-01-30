package speech.renderer;

import electron.WebViewElement;
import electron.MediaStreamTrack;
import haxe.Json;
import haxe.Timer;
import js.Browser;
import js.html.AnimationEvent;
import js.html.Element;
import js.html.LocalMediaStream;
import js.html.MouseEvent;
import js.html.rtc.IceCandidate;
import js.html.rtc.SessionDescription;
import js.html.WebSocket;
import kurentoUtils.WebRtcPeer;
import speech.abstracts.common.CommentData;
import speech.abstracts.common.CommentType;
import speech.abstracts.common.MessageType.ClientMessageType;
import speech.abstracts.common.MessageType.ServerMessageType;
import speech.abstracts.common.StreamTarget;
import speech.manager.DomManager;
import speech.manager.MediaManager;
import speech.renderer.Index.State;

enum State {
	SETUP;
	LIVE_BEFORE;
	LIVE;
	LIVE_AFTER;
}

enum Request {
	JOIN_PRESENTER(option:Dynamic);
	LEAVE_PRESENTER;
	UPDATE_SLIDE(slideUrl:String);
	START_STREAM(offer:SessionDescription, target:StreamTarget);
	STOP_STREAM;
	START_POINTER;
	UPDATE_POINTER(x:Float, y:Float);
	STOP_POINTER;
	MAKE_LOG;
	
	ICE_CANDIDATE(ice:IceCandidate);
}

class Index 
{
	private var WS_URL(default, null):String = "wss://seibe.jp:8081/speech";
	private var _ws:WebSocket;
	private var _state:State;
	private var _timer:Timer;
	
	private var _beginTime:Float;
	private var _prevUrl:String;
	private var _reqCount:Int;
	private var _numQuestion:Int;
	private var _title:String;
	private var _username:String;
	private var _slideUrl:String;
	private var _videoSourceId:String;
	private var _presentationShortId:String;
	
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
			_timer = null;
			_beginTime = -1;
			_prevUrl = "";
			_numQuestion = 0;
			_title = null;
			_username = null;
			_slideUrl = null;
			_videoSourceId = null;
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
		
		// シーンの終了処理
		switch (_state)
		{
			case State.SETUP:
				// フォーム各値の取得
				_title = _dom.getInput("title", "setup").value;
				_username = _dom.getInput("presenter", "setup").value;
				_slideUrl = _dom.getInput("slide-url", "setup").value;
				_videoSourceId = _dom.getSelect("video", "setup").value;
				
				// イベントリスナー解除
				_dom.getButton("submit").removeEventListener("click", onClickButtonStart);
				
			case State.LIVE_BEFORE:
				//
				_dom.getDialog("loading").close();
				
			case State.LIVE:
				// 配信の終了
				stopPointerCapture();
				if (_webRtcPeer != null) {
					send(Request.STOP_STREAM);
					_webRtcPeer.dispose();
					_webRtcPeer = null;
				}
				send(Request.LEAVE_PRESENTER);
				if (_timer != null) _timer.stop();
				_timer = null;
				
				// イベントリスナー解除
				Browser.window.removeEventListener("resize", onResize);
				Browser.window.removeEventListener("keydown", onKeyDown);
				_slideview.removeEventListener("keydown", onChangeSlide);
				_slideview.removeEventListener("wheel", onChangeSlide);
				_slideview.removeEventListener("mouseup", onChangeSlide);
				_slideview.removeEventListener("focus", onFocusSlide);
				_slideview.removeEventListener("blur", onBlurSlide);
				
				if (nextState == State.SETUP) {
					_ws.close();
					_ws = null;
				}
				
			case State.LIVE_AFTER:
				//
				if (_ws != null) {
					_ws.close();
					_ws = null;
				}
				
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
				});
				
				// イベントリスナー登録
				_dom.getButton("submit").addEventListener("click", onClickButtonStart);
				
			case State.LIVE_BEFORE:
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
				
				// コメント・質問ビュー初期化
				_numQuestion = 0;
				_dom.get("comment-list", "live").innerHTML = "";
				_dom.get("question-list", "live").innerHTML = "";
				_dom.get("num-question", "live").innerText = "0";
				
				// 参加人数初期化
				_dom.get("num-audience", "live").innerText = "0";
				
			case State.LIVE:
				// 開始時間初期化
				_beginTime = Date.now().getTime();
				if (_timer != null) _timer.stop();
				_timer = new Timer(1000);
				_timer.run = onUpdate;
				
				// DOM表示切替
				_dom.changeScene("live");
				_slideview.focus();
				
				// イベントリスナー登録
				Browser.window.addEventListener("resize", onResize);
				onResize();
				_slideview.addEventListener("keydown", onChangeSlide);
				_slideview.addEventListener("wheel", onChangeSlide);
				_slideview.addEventListener("mouseup", onChangeSlide);
				_slideview.addEventListener("focus", onFocusSlide);
				_slideview.addEventListener("blur", onBlurSlide);
				_dom.getButton("finish").addEventListener("click", onClickButtonFinish);
				
			case State.LIVE_AFTER:
				//
		}
		
		_state = nextState;
	}
	
	private function onChangeSlide(e:Dynamic):Void
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
	
	private function onFocusSlide():Void
	{
		Browser.window.removeEventListener("keydown", onKeyDown);
	}
	
	private function onBlurSlide():Void
	{
		Browser.window.addEventListener("keydown", onKeyDown);
	}
	
	private function onResize():Void
	{
		var playerHeight = Browser.window.innerHeight - 272;
		_slideview.style.height = Std.string(playerHeight) + "px";
	}
	
	private function onKeyDown():Void
	{
		_slideview.focus();
	}
	
	private function onUpdate():Void
	{
		var elapsedTime = DateTools.parse(Date.now().getTime() - _beginTime);
		var min = elapsedTime.hours * 60 + elapsedTime.minutes;
		var sec = elapsedTime.seconds;
		_dom.get("elapsed-time", "live").innerText = (min < 10 ? '0$min' : '$min') + ":" + (sec < 10 ? '0$sec' : '$sec');
	}
	
	private function onClickButtonStart():Void
	{
		var slideUrl = _dom.getInput("slide-url").value;
		var title = _dom.getInput("title").value;
		var urlChecker:EReg = ~/https?:\/\/.+/;
		if (slideUrl.length == 0 || title.length == 0 || !urlChecker.match(slideUrl)) {
			_dom.getInput("slide-url").focus();
		} else {
			setState(State.LIVE_BEFORE);
		}
	}
	
	private function onClickButtonFinish():Void
	{
		send(Request.MAKE_LOG);
		//setState(State.SETUP);
	}
	
	private function onClickButtonPointer():Void
	{
		var btn = _dom.getButton("action-pointer", "live");
		
		if (btn.dataset.active != null) {
			// ポインタ配信を終える
			stopPointerCapture();
		} else {
			// ポインタ配信を始める
			btn.innerText = "ポインタ終了";
			_slideview.classList.add("readonly");
			send(Request.START_POINTER);
			Browser.window.addEventListener("mousemove", onMovePointer);
		}
	}
	
	private function onMovePointer(e:MouseEvent):Void
	{
		// 絶対座標
		var ax = e.clientX - _slideview.clientLeft;
		var ay = e.clientY - _slideview.clientTop;
		if (ax < 0 || ay < 0) return;
		
		// 相対座標
		var rx = ax / _slideview.clientWidth;
		var ry = ay / _slideview.clientHeight;
		if (rx > 1 || ry > 1) return;
		
		send(Request.UPDATE_POINTER(rx, ry));
	}
	
	private function send(req:Request):Int
	{
		var obj:Dynamic = {};
		
		switch(req) {
			case Request.JOIN_PRESENTER(option):
				obj.type = ClientMessageType.JOIN_PRESENTER;
				obj.data = option;
				
			case Request.LEAVE_PRESENTER:
				obj.type = ClientMessageType.LEAVE_PRESENTER;
				
			case Request.UPDATE_SLIDE(slideUrl):
				obj.type = ClientMessageType.UPDATE_SLIDE;
				obj.data = slideUrl;
				
			case Request.START_STREAM(offerSdp, streamTarget):
				obj.type = ClientMessageType.START_STREAM;
				obj.data = { offer: offerSdp, target: streamTarget };
				
			case Request.STOP_STREAM:
				obj.type = ClientMessageType.STOP_STREAM;
				
			case Request.START_POINTER:
				obj.type = ClientMessageType.START_POINTER;
				
			case Request.UPDATE_POINTER(x, y):
				obj.type = ClientMessageType.UPDATE_POINTER;
				obj.data = { x: x, y: y };
				
			case Request.STOP_POINTER:
				obj.type = ClientMessageType.STOP_POINTER;
				
			case Request.MAKE_LOG:
				obj.type = ClientMessageType.REQUEST_LOG;
				
			case Request.ICE_CANDIDATE(candidate):
				obj.type = ClientMessageType.ICE_CANDIDATE;
				obj.data = candidate;
		}
		
		obj.timestamp = Date.now().getTime();
		obj.requestId = _reqCount++;
		trace("send", obj.type);
		_ws.send( Json.stringify(obj) );
		
		return _reqCount;
	}
	
	private function stopPointerCapture():Void
	{
		var btn = _dom.getButton("action-pointer", "live");
		if (btn.dataset.active != null) {
			btn.innerText = "レーザーポインタ";
			_slideview.classList.remove("readonly");
			Browser.window.removeEventListener("mousemove", onMovePointer);
			btn.dataset.active = null;
			send(Request.STOP_POINTER);
		}
	}
	
	private function addComment(text:String, name:String):Void
	{
		_dom.get("comment-list", "live").insertAdjacentHTML("afterbegin", '<li class="discuss-comment new"><img class="discuss-comment-image" src="img/avatar.png"><div class="discuss-comment-body"><strong>$name</strong><p>$text</p></div></li>');
		_dom.query(".discuss-comment.new").addEventListener("animationend", function(e:AnimationEvent):Void {
			trace("animation end");
			if (e.animationName == "comment-move-in") {
				var elem:Element = cast e.target;
				elem.classList.remove("new");
			}
		});
	}
	
	private function addQuestion(text:String, name:String):Void
	{
		_dom.get("question-list", "live").insertAdjacentHTML("beforeend", '<li class="discuss-comment"><img class="discuss-comment-image" src="img/avatar.png"><div class="discuss-comment-body"><strong>$name</strong><p>$text</p></div></li>');
		
		_numQuestion++;
		_dom.get("num-question", "live").innerText = Std.string(_numQuestion);
	}
	
	private function addStamp(src:String, alt:String):Void
	{
		for (i in 0...3) {
			Timer.delay(function():Void {
				var left = i * 5 + 40 + Math.floor(Math.random() * 28);
				_dom.get("atmos", "live").insertAdjacentHTML("afterbegin", '<img class="live-atmos-stamp" alt="${alt}" src="${src}" style="left: ${left}%" />');
				var stamp = Browser.document.getElementsByClassName("live-atmos-stamp").item(0);
				Timer.delay(function():Void { stamp.remove(); }, 4000);
			}, 500 * i);
		}
	}
	
	private function onWsConnect(e:Dynamic):Void
	{
		// 部屋を作成する
		send(Request.JOIN_PRESENTER( {
			title: _title,
			slideUrl: _slideUrl,
			name: _username
		} ));
		
		// 映像配信の初期化
		if (_videoSourceId != null && _videoSourceId.length > 0) {
			// WebCamの登録
			var videoElem = cast _dom.get("video", "live");
			
			_media.getUserVideo(_videoSourceId, function(lms):Void {
				//
				_webRtcPeer = WebRtcPeer.WebRtcPeerSendonly({
					localVideo: videoElem,
					videoStream: lms,
					onicecandidate: onIcecandidate
				}, function (err:Dynamic):Void {
					if (err != null) setState(State.SETUP);
					_webRtcPeer.generateOffer(onOffer);
				});
			}, function(err):Void {
				trace("error getUserVideo");
			});
		}
	}
	
	private function onWsClose(e:Dynamic):Void
	{
		setState(State.SETUP);
	}
	
	private function onWsMessage(e:Dynamic):Void
	{
		var resp:Dynamic = Json.parse(e.data);
		var type:ServerMessageType = resp.type;
		var d:Dynamic = resp.data;
		
		switch (type)
		{
			case ServerMessageType.ACCEPT_STREAM:
				// 映像配信の承認
				var sdpAnswer:SessionDescription = d;
				_webRtcPeer.processAnswer(sdpAnswer);
				
			case ServerMessageType.UPDATE_AUDIENCE:
				// 聴衆リストの更新
				var numAudience:Int = d;
				_dom.get("num-audience", "live").innerText = '$numAudience';
				
			case ServerMessageType.ICE_CANDIDATE:
				// 経路情報の登録
				_webRtcPeer.addIceCandidate(d);
				
			case ServerMessageType.COMMENT:
				// 各種コメントの受信
				var comment:CommentData = d;
				var name = comment.name != null ? StringTools.htmlEscape(comment.name) : "nanashi";
				var text = StringTools.htmlEscape(comment.text);
				switch (comment.type) {
					case CommentType.NORMAL:
						// 通常コメント
						addComment(text, name);
						
					case CommentType.QUESTION:
						// 質問コメント
						addComment(text, name);
						addQuestion(text, name);
						
					case CommentType.STAMP_CLAP:
						// 拍手スタンプ
						addComment(text, name);
						addStamp("img/icon_clap.png", "拍手");
						
					case CommentType.STAMP_HATENA:
						// ？スタンプ
						addComment(text, name);
						addStamp("img/icon_hatena.png", "?");
						
					case CommentType.STAMP_PLUS:
						// +1スタンプ
						addComment(text, name);
						addStamp("img/icon_plus.png", "+1");
						
					case CommentType.STAMP_WARAI:
						// 笑スタンプ
						addComment(text, name);
						addStamp("img/icon_www.png", "笑い");
				}
				
			case ServerMessageType.ERROR:
				trace("server error", d);
				
			case ServerMessageType.FINISH:
				// プレゼンテーションの正常終了
				setState(State.SETUP);
				
			case ServerMessageType.WILL_STOP_STREAM:
				// 映像配信の終了予告
				
			case ServerMessageType.STOP_STREAM:
				// 映像配信の終了
				if (_webRtcPeer != null) {
					_webRtcPeer.dispose();
					_webRtcPeer = null;
				}
				
			case ServerMessageType.ACCEPT_PRESENTER:
				// プレゼンテーションの承認
				_presentationShortId = d;
				setState(State.LIVE);
				
			case ServerMessageType.CREATE_LOG:
				// ログ作成完了
				trace("log URL", d);
				setState(State.LIVE_AFTER);
				
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
		send(Request.START_STREAM(offerSdp, StreamTarget.WEBCAM));
	}
	
	private function onIcecandidate(candidate:IceCandidate):Void
	{
		send(Request.ICE_CANDIDATE(candidate));
	}
	
}
