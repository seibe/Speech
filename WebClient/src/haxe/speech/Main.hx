package speech;

import haxe.Json;
import haxe.Timer;
import js.Browser;
import js.html.ButtonElement;
import js.html.Element;
import js.html.IFrameElement;
import js.html.InputElement;
import js.html.MediaStreamTrack;
import js.html.rtc.IceCandidate;
import js.html.rtc.SessionDescription;
import js.html.SelectElement;
import js.html.VideoElement;
import js.html.WebSocket;
import kurentoUtils.WebRtcPeer;

enum State {
	STOP;
	WATCH_STARTING;
	WATCH(title:String, desc:String, url:String);
	WATCH_WITH_VIDEO_STARTING;
	WATCH_WITH_VIDEO(answer:SessionDescription);
	DELIVER_SETUP;
	DELIVER_STARTING(slideUrl:String, title:String, description:String);
	DELIVER;
	DELIVER_WITH_VIDEO_STARTING(slideUrl:String, videoId:String, title:String, description:String);
	DELIVER_WITH_VIDEO(answer:SessionDescription);
}

enum Request {
	JOIN_VIEWER;
	REQUEST_STREAM(sdpOffer:SessionDescription);
	JOIN_PRESENTER(params:Dynamic);
	BEGIN_STREAM_PRESENTER(sdpOffer:SessionDescription);
	UPDATE_PAGE(slideUrl:String);
	COMMENT(name:String, text:String);
	ICE_CANDIDATE(candidate:IceCandidate);
}

class Main
{
	private var WS_URL(default, null):String = "wss://localhost:8081/speech";
	private var _ws:WebSocket;
	private var _webRtcPeer:WebRtcPeer;
	
	private var _state:State;
	private var _prevUrl:String;
	private var _prevComment:String;
	
	private var _slide:IFrameElement;
	private var _video:VideoElement;
	private var _defaultPane:Element;
	private var _createPane:Element;
	private var _infoPane:Element;
	private var _discussPane:Element;
	private var _labelTitle:Element;
	private var _labelDesc:Element;
	private var _commentList:Element;
	
	private var _inputComment:InputElement;
	private var _inputSlideUrl:InputElement;
	private var _inputTitle:InputElement;
	private var _inputDescription:InputElement;
	private var _selectCamera:SelectElement;
	private var _outputError:Element;
	
	private var _btnSubmitComment:ButtonElement;
	private var _btnRetryJoinViewer:ButtonElement;
	private var _btnSetupBegin:ButtonElement;
	private var _btnSetupSubmit:ButtonElement;
	private var _btnLeavePresenter:ButtonElement;
	
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
		initDomElements();
		setState(State.WATCH_STARTING);
	}
	
	private function initDomElements():Void
	{
		_slide = cast Browser.document.getElementById("slide");
		_video = cast Browser.document.getElementById("video");
		
		_labelTitle = Browser.document.getElementById("label-title");
		_labelDesc = Browser.document.getElementById("label-description");
		_commentList = Browser.document.getElementById("comment-list");
		
		_defaultPane = Browser.document.getElementById("pane-default");
		_createPane = Browser.document.getElementById("pane-create");
		_infoPane = Browser.document.getElementById("pane-info");
		_discussPane = Browser.document.getElementById("pane-discuss");
		
		_inputComment = cast Browser.document.getElementById("input-comment");
		_inputComment.addEventListener("keypress", function(e:Dynamic):Void {
			if (e.keyCode == 13) doComment();
		});
		_inputSlideUrl = cast Browser.document.getElementById("input-slide-url");
		_inputTitle = cast Browser.document.getElementById("input-title");
		_inputDescription = cast Browser.document.getElementById("input-description");
		_selectCamera = cast Browser.document.getElementById("select-camera");
		_outputError = Browser.document.getElementById("output-setup-error");
		
		_btnSubmitComment = cast Browser.document.getElementById("button-submit-comment");
		_btnSubmitComment.addEventListener("click", doComment);
		_btnRetryJoinViewer = cast Browser.document.getElementById("button-retry-join-viewer");
		_btnRetryJoinViewer.addEventListener("click", function():Void {
			setState(State.WATCH_STARTING);
		});
		/*
		_btnSetupBegin = cast Browser.document.getElementById("button-begin-setup");
		_btnSetupBegin.addEventListener("click", function():Void {
			setState(State.DELIVER_SETUP);
		});
		_btnSetupSubmit = cast Browser.document.getElementById("button-complete-setup");
		_btnSetupSubmit.addEventListener("click", function():Void {
			var urlChecker:EReg = ~/https?:\/\/.+/;
			var slideUrl = _inputSlideUrl.value;
			if (slideUrl.length == 0 || !urlChecker.match(slideUrl)) {
				_outputError.innerText = "正しいスライドURLを入力してください";
				_inputSlideUrl.focus();
				return;
			}
			
			var title = _inputTitle.value;
			if (title.length == 0) {
				_outputError.innerText = "プレゼンテーションタイトルを入力してください";
				_inputTitle.focus();
				return;
			}
			
			var desc = _inputDescription.value;
			if (desc.length == 0) desc = "No description";
			
			_outputError.innerText = "";
			_labelTitle.innerText = StringTools.htmlEscape(title);
			_slide.src = StringTools.htmlEscape(slideUrl);
			_labelDesc.innerText = StringTools.htmlEscape(desc);
			
			var videoId = _selectCamera.value;
			if (videoId.length == 0 || videoId == "none") {
				setState(State.DELIVER_STARTING(slideUrl, title, desc));
			} else {
				setState(State.DELIVER_WITH_VIDEO_STARTING(slideUrl, videoId, title, desc));
			}
		});
		_btnLeavePresenter = cast Browser.document.getElementById("button-leave-presenter");
		_btnLeavePresenter.addEventListener("click", function():Void {
			setState(State.STOP);
		});*/
	}
	
	private function setState(nextState:State):Void
	{
		if (_state == nextState) return;
		trace("state", nextState);
		
		// シーンの終了処理
		switch (_state)
		{
			case State.STOP:
				// State.STOPの終了処理
				_defaultPane.classList.remove("show");
				
			case State.WATCH_STARTING:
				// State.WATCH_STARTINGの終了処理
				_defaultPane.classList.remove("show");
				
			case State.WATCH(title, desc, url):
				// State.WATCHの終了処理
				_infoPane.classList.remove("show");
				_discussPane.classList.remove("show");
				
			case State.WATCH_WITH_VIDEO_STARTING:
				// State.WATCH_WITH_VIDEO_STARTINGの終了処理
				
			case State.WATCH_WITH_VIDEO(answer):
				// State.WATCH_WITH_VIDEOの終了処理
				_infoPane.classList.remove("show");
				_discussPane.classList.remove("show");
				_video.classList.remove("show");
				
			case State.DELIVER_SETUP:
				// State.DELIVER_SETUPの終了処理
				_createPane.classList.remove("show");
				
			case State.DELIVER_STARTING(slideUrl, title, desc):
				// State.DELIVER_STARTINGの終了処理
				
			case State.DELIVER:
				// State.DELIVERの終了処理
				_infoPane.classList.remove("show");
				_discussPane.classList.remove("show");
				_slide.contentWindow.removeEventListener("keydown", checkPage);
				_slide.contentWindow.removeEventListener("wheel", checkPage);
				_slide.contentWindow.removeEventListener("mouseup", checkPage);
				
			case State.DELIVER_WITH_VIDEO_STARTING(slideUrl, videoId, title, desc):
				// State.DELIVER_WITH_VIDEO_STARTINGの終了処理
				
			case State.DELIVER_WITH_VIDEO(answer):
				// State.DELIVER_WITH_VIDEOの終了処理
				_infoPane.classList.remove("show");
				_discussPane.classList.remove("show");
				_slide.contentWindow.removeEventListener("keydown", checkPage);
				_slide.contentWindow.removeEventListener("wheel", checkPage);
				_slide.contentWindow.removeEventListener("mouseup", checkPage);
				
			case null:
				// 起動時の特別な処理
		}
		
		// シーンの開始処理
		switch (nextState)
		{
			case State.STOP:
				// State.STOPの開始処理
				// WebSocketサーバーから切断する
				if (_ws != null) _ws.close();
				_ws = null;
				// スライドを非表示にする
				_slide.classList.remove("show");
				_defaultPane.classList.add("show");
				_prevUrl = null;
				_prevComment = null;
				
			case State.WATCH_STARTING:
				// State.WATCH_STARTINGの開始処理
				// WebSocketサーバーに接続する
				_ws = new WebSocket(WS_URL);
				_ws.addEventListener("open", onWsConnect);
				_ws.addEventListener("close", onWsClose);
				_ws.addEventListener("message", onWsMessage);
				_ws.addEventListener("error", onWsError);
				
			case State.WATCH(title, desc, url):
				// State.WATCHの開始処理
				// スライドを表示する
				_labelTitle.innerText = StringTools.htmlEscape(title);
				_slide.src = StringTools.htmlEscape(url);
				_labelDesc.innerText = StringTools.htmlEscape(desc);
				_slide.classList.add("show");
				_infoPane.classList.add("show");
				_discussPane.classList.add("show");
				
			case State.WATCH_WITH_VIDEO_STARTING:
				// State.WATCH_WITH_VIDEO_STARTINGの開始処理
				// 接続要求を送る
				_webRtcPeer = WebRtcPeer.WebRtcPeerRecvonly({
					remoteVideo: _video,
					onicecandidate: onIcecandidate
				}, function (err:Dynamic):Void {
					if (err != null) setState(State.STOP);
					_webRtcPeer.generateOffer(function (error:Dynamic, offerSdp:SessionDescription):Void {
						if (error != null) setState(State.STOP);
						send(Request.REQUEST_STREAM(offerSdp));
					});
				});
				
			case State.WATCH_WITH_VIDEO(answer):
				// State.WATCH_WITH_VIDEOの開始処理
				_webRtcPeer.processAnswer(answer);
				_video.classList.add("show");
				_infoPane.classList.add("show");
				_discussPane.classList.add("show");
				
			case State.DELIVER_SETUP:
				// State.DELIVER_SETUPの開始処理
				untyped MediaStreamTrack.getSources(function(trackList:Array<MediaStreamTrack>):Void {
					_selectCamera.innerHTML = '<option value="none">なし</option>';
					for (track in trackList) {
						if (track.kind == "video") {
							_selectCamera.insertAdjacentHTML("beforeend", '<option value="'+track.id+'">'+track.label+'</option>');
						}
					}
				});
				_createPane.classList.add("show");
				
			case State.DELIVER_STARTING(slideUrl, title, desc):
				// State.DELIVER_STARTINGの開始処理
				_prevUrl = slideUrl;
				// WebSocketサーバーに接続する
				_ws = new WebSocket(WS_URL);
				_ws.addEventListener("open", onWsConnect);
				_ws.addEventListener("close", onWsClose);
				_ws.addEventListener("message", onWsMessage);
				_ws.addEventListener("error", onWsError);
				
			case State.DELIVER:
				// State.DELIVERの開始処理
				_infoPane.classList.add("show");
				_discussPane.classList.add("show");
				_slide.classList.add("show");
				_slide.contentWindow.addEventListener("keydown", checkPage);
				_slide.contentWindow.addEventListener("wheel", checkPage);
				_slide.contentWindow.addEventListener("mouseup", checkPage);
				
			case State.DELIVER_WITH_VIDEO_STARTING(slideUrl, videoId, title, desc):
				// State.DELIVER_WITH_VIDEO_STARTINGの開始処理
				_prevUrl = slideUrl;
				// WebSocketサーバーに接続する
				_ws = new WebSocket(WS_URL);
				_ws.addEventListener("open", onWsConnect);
				_ws.addEventListener("close", onWsClose);
				_ws.addEventListener("message", onWsMessage);
				_ws.addEventListener("error", onWsError);
				
			case State.DELIVER_WITH_VIDEO(answer):
				// State.DELIVER_WITH_VIDEOの開始処理
				_infoPane.classList.add("show");
				_discussPane.classList.add("show");
				_slide.classList.add("show");
				_video.classList.add("show");
				_webRtcPeer.processAnswer(answer);
				_slide.contentWindow.addEventListener("keydown", checkPage);
				_slide.contentWindow.addEventListener("wheel", checkPage);
				_slide.contentWindow.addEventListener("mouseup", checkPage);
		}
		
		_state = nextState;
	}
	
	private function send(req:Request):Void
	{
		var obj:Dynamic = { };
		
		switch (req)
		{
			case Request.JOIN_VIEWER:
				// 視聴者としてプレゼンに参加する
				obj.type = "joinViewer";
				obj.data = { };
				
			case Request.REQUEST_STREAM(offer):
				// 視聴者として映像の受信を要求する
				obj.type = "requestStream";
				obj.data = offer;
				
			case Request.JOIN_PRESENTER(params):
				// 放送者としてプレゼンを開始する
				obj.type = "joinPresenter";
				obj.data = params;
				
			case Request.BEGIN_STREAM_PRESENTER(offerSdp):
				// 放送者としてsdpOfferを送る
				obj.type = "startStream";
				obj.data = offerSdp;
				
			case Request.UPDATE_PAGE(slideUrl):
				// 放送者としてページの変更を通知する
				obj.type = "updateSlide";
				obj.data = slideUrl;
				
			case Request.COMMENT(name, text):
				// コメントする
				obj.type = "comment";
				obj.data = { name: name, text: text };
				
			case Request.ICE_CANDIDATE(candidate):
				//
				obj.type = "iceCandidate";
				obj.data = candidate;
		}
		
		obj.timestamp = Date.now().getTime();
		_ws.send(Json.stringify(obj));
	}
	
	private function checkPage():Void
	{
		trace(_slide.contentWindow.location.href);
		if (!_state.match(State.DELIVER) && !_state.match(State.WATCH_WITH_VIDEO)) return;
		
		Timer.delay( function():Void {
			// 前回とURLが異なっていればページ移動したと看做す
			var url:String = _slide.contentWindow.location.href;
			if (_prevUrl != url) {
				send(Request.UPDATE_PAGE(url));
				_prevUrl = url;
			}
		}, 250);
	}
	
	private function doComment():Void
	{
		var name:String = "匿名視聴者";
		var text:String = _inputComment.value;
		
		if (text.length == 0 || text == _prevComment) return;
		
		send(Request.COMMENT(name, text));
		
		_prevComment = text;
		_inputComment.value = "";
	}
	
	private function onWsConnect(e:Dynamic):Void
	{
		trace("open ws");
		
		switch (_state) {
			case State.WATCH_STARTING:
				send(Request.JOIN_VIEWER);
				
			case State.DELIVER_STARTING(slideUrl, title, description):
				send(Request.JOIN_PRESENTER({
					title: title,
					description: description,
					slideUrl: slideUrl
				}));
				
			case State.DELIVER_WITH_VIDEO_STARTING(slideUrl, videoId, title, description):
				send(Request.JOIN_PRESENTER({
					title: title,
					description: description,
					slideUrl: slideUrl
				}));
				untyped navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
				untyped navigator.getUserMedia( {
					video: { optional: [ { sourceId: videoId } ] },
					audio: true
				}, function (lms):Void {
					_webRtcPeer = WebRtcPeer.WebRtcPeerSendonly({
						localVideo: _video,
						videoStream: lms,
						onicecandidate: onIcecandidate
					}, function (err:Dynamic):Void {
						if (err != null) setState(State.STOP);
						_webRtcPeer.generateOffer(function(err2, offer):Void {
							send(Request.BEGIN_STREAM_PRESENTER(offer));
						});
					});
				}, function (err3):Void {
					trace(err3);
				});
				
			default:
				trace("throw@onWsConnect", _state);
		}
	}
	
	private function onWsClose(e:Dynamic):Void
	{
		trace("close ws");
		
		setState(State.STOP);
	}
	
	private function onWsMessage(e:Dynamic):Void
	{
		var mes:Dynamic = Json.parse(e.data);
		var d:Dynamic = mes.data;
		trace(mes.type);
		
		switch (mes.type)
		{
			case "onUpdateSlide":
				_slide.src = d;
				
			case "onComment":
				var name = StringTools.htmlEscape(d.name);
				var text = StringTools.htmlEscape(d.text);
				_commentList.insertAdjacentHTML("afterbegin", '<li class="discuss-comment new"><img class="discuss-comment-image" src="img/avatar.jpg" width="32" height="32"><div class="discuss-comment-body"><strong>' + name+'</strong><p>' + text + '</p></div></li>');
				
			case "canStartStream":
				setState(State.WATCH_WITH_VIDEO_STARTING);
				
			case "onStopStream":
				setState(State.STOP);
				
			case "accept":
				switch (_state) {
					case State.WATCH_STARTING:
						setState(State.WATCH(d.title, d.description, d.slideUrl));
						
					case State.DELIVER_STARTING:
						setState(State.DELIVER);
						
					case State.DELIVER_WITH_VIDEO_STARTING:
						// ※acceptStreamが来るまで何もしない
						
					default:
						trace("state error", mes);
				}
				
			case "acceptStream":
				setState(State.DELIVER_WITH_VIDEO(d));
				
			case "startStream":
				setState(State.WATCH_WITH_VIDEO(d));
				
			case "iceCandidate":
				_webRtcPeer.addIceCandidate(d);
				
			default:
				trace("unknown message", mes);
		}
	}
	
	private function onWsError(e:Dynamic):Void
	{
		//
	}
	
	private function onIcecandidate(candidate:IceCandidate):Void
	{
		send(Request.ICE_CANDIDATE(candidate));
	}
	
}
