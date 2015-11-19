package speech;

import haxe.Json;
import js.Browser;
import js.html.Element;
import js.html.IFrameElement;
import js.html.rtc.IceCandidate;
import js.html.rtc.SessionDescription;
import js.html.VideoElement;
import js.html.WebSocket;
import kurentoUtils.WebRtcPeer;

enum State {
	STOP;
	WATCH_STARTING;
	WATCH(title:String, desc:String, url:String);
	WATCH_WITH_VIDEO_STARTING;
	WATCH_WITH_VIDEO(answer:SessionDescription);
}

enum Request {
	JOIN_VIEWER;
	REQUEST_STREAM(sdpOffer:SessionDescription);
	ICE_CANDIDATE(candidate:IceCandidate);
}

class Main
{
	private var WS_URL(default, null):String = "ws://localhost:8081/speech";
	private var _ws:WebSocket;
	private var _webRtcPeer:WebRtcPeer;
	
	private var _state:State;
	
	private var _slide:IFrameElement;
	private var _video:VideoElement;
	private var _title:Element;
	private var _description:Element;
	
	/*
	private var _isConnect:Bool;
	private var _title:Element;
	private var _board:UListElement;
	private var _inputName:InputElement;
	private var _inputText:InputElement;
	private var _inputSubmit:ButtonElement;
	private var _prevText:String;
	private var _roomId:String;
	*/
	
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
		
		/*
		// 1. 変数初期化
		_isConnect = false;
		_prevText = "";
		_title = Browser.document.getElementById("title");
		_frame = cast Browser.document.getElementById("slide-frame");
		_board = cast Browser.document.getElementById("comment-list");
		_inputName = cast Browser.document.getElementById("comment-form-name");
		_inputText = cast Browser.document.getElementById("comment-form-text");
		_inputSubmit = cast Browser.document.getElementById("comment-form-submit");
		
		// 2. 部屋番号を確認
		_roomId = Browser.location.hash;
		if (_roomId.length < 2) {
			// 番号が無い
			_board.innerHTML = "<li class='system'>有効な部屋番号ではありません</li>" + _board.innerHTML;
			return;
		}
		_roomId = _roomId.substr(1);
		_frame.src = "img/wait.jpg";
		
		// 3. WebSocketサーバーに接続する
		_ws = new WebSocket(WS_URL);
		_ws.addEventListener("open", onConnect);
		_ws.addEventListener("close", onDisconnect);
		_ws.addEventListener("message", onMessage);
		//_ws.onerror = null;
		
		// 4. INPUT投稿周りのイベント
		var doComment = function():Void {
			if (!_isConnect) return;
			var name:String = _inputName.value;
			var text:String = _inputText.value;
			name = name.length > 0 ? name : "anonymous";
			if (text == _prevText) return;
			
			_ws.send(Json.stringify( {
				type: "comment",
				data: {
					roomId: _roomId,
					name: name,
					text: text,
					slideUrl: _frame.src
				},
				requestId: 0,
				timestamp: Date.now().getTime()
			} ));
			_prevText = text;
			_inputText.value = "";
		}
		_inputText.addEventListener("keypress", function(e:Dynamic):Void {
			if (e.keyCode == 13) doComment();
		});
		_inputSubmit.addEventListener("click", doComment);
		*/
	}
	
	private function initDomElements():Void
	{
		_slide = cast Browser.document.getElementById("slide");
		_video = cast Browser.document.getElementById("video");
		
		_title = Browser.document.getElementById("slide-title");
		_description = Browser.document.getElementById("slide-desc");
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
				
			case State.WATCH_STARTING:
				// State.WATCH_STARTINGの終了処理
				
			case State.WATCH(title, desc, url):
				// State.WATCHの終了処理
				
			case State.WATCH_WITH_VIDEO_STARTING:
				// State.WATCH_WITH_VIDEO_STARTINGの終了処理
				
			case State.WATCH_WITH_VIDEO(answer):
				// State.WATCH_WITH_VIDEOの終了処理
				_video.classList.remove("show");
				
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
				_slide.classList.remove("show");
				
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
				trace(title, desc, url);
				_title.innerText = StringTools.htmlEscape(title);
				_slide.src = StringTools.htmlEscape(url);
				_description.innerText = StringTools.htmlEscape(desc);
				_slide.classList.add("show");
				
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
		}
		
		_state = nextState;
	}
	
	private function send(req:Request):Void
	{
		var obj:Dynamic = { };
		
		switch (req)
		{
			case Request.JOIN_VIEWER:
				// プレゼンに参加する
				obj.type = "joinViewer";
				obj.data = { };
				
			case Request.REQUEST_STREAM(offer):
				// 映像の受信を要求する
				obj.type = "requestStream";
				obj.data = offer;
				
			case Request.ICE_CANDIDATE(candidate):
				//
				obj.type = "iceCandidate";
				obj.data = candidate;
		}
		
		obj.timestamp = Date.now().getTime();
		_ws.send(Json.stringify(obj));
	}
	
	private function onWsConnect(e:Dynamic):Void
	{
		trace("open ws");
		
		send(Request.JOIN_VIEWER);
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
				// _board.innerHTML = "<li class='system'><a href='" + m.data + "'>ページ</a>が変わりました</li>" + _board.innerHTML;
				// _frame.src = m.data;
				
			case "onComment":
				// _board.innerHTML = "<li>" + StringTools.htmlEscape(m.data.text) + "<br/><small>(" + StringTools.htmlEscape(m.data.name) + ")</small></li>" + _board.innerHTML;
				
			case "canStartStream":
				setState(State.WATCH_WITH_VIDEO_STARTING);
				
			case "onStopStream":
				//setState(State.WATCH);
				
			case "accept":
				setState(State.WATCH(d.title, d.description, d.slideUrl));
				// _isConnect = true;
				// _title.innerText = m.data.title;
				// _board.innerHTML = "<li class='system'>入室しました</li>" + _board.innerHTML;
				// if (m.data.slideUrl && m.data.slideUrl.length > 0) _frame.src = m.data.slideUrl;
				
			case "startStream":
				setState(State.WATCH_WITH_VIDEO(d));
				
			/*
			case "onLeave":
				_isConnect = false;
				_frame.src = "wait.jpg";
				
			case "onBegin":
				_board.innerHTML = "<li class='system'>発表が始まりました</li>" + _board.innerHTML;
				
			case "onPause":
				_board.innerHTML = "<li class='system'>発表が中断しました</li>" + _board.innerHTML;
				
			case "onEnd":
				_board.innerHTML = "<li class='system'>発表が終了しました</li>" + _board.innerHTML;
				_ws.close();
				
			case "onOpen":
				_board.innerHTML = "<li class='system'><a href='" + m.data.slideUrl + "'>スライド資料</a>が開かれました</li>" + _board.innerHTML;
				_frame.src = m.data.slideUrl;
				
			case "onError":
				_board.innerHTML = "<li class='system'>エラー: " + StringTools.htmlEscape(m.data) + "</li>" + _board.innerHTML;
			*/
				
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
