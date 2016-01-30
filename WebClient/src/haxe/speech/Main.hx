package speech;

import haxe.Json;
import haxe.Timer;
import js.Browser;
import js.Error;
import js.html.AnimationEvent;
import js.html.ButtonElement;
import js.html.Element;
import js.html.IFrameElement;
import js.html.InputElement;
import js.html.MediaStreamTrack;
import js.html.rtc.IceCandidate;
import js.html.rtc.SessionDescription;
import js.html.SelectElement;
import js.html.TransitionEvent;
import js.html.VideoElement;
import js.html.WebSocket;
import kurentoUtils.WebRtcPeer;
import speech.abstracts.common.CommentData;
import speech.abstracts.common.CommentType;
import speech.abstracts.common.MessageType.ClientMessageType;
import speech.abstracts.common.MessageType.ServerMessageType;
import speech.manager.DomManager;

enum State {
	SETUP;
	WATCH_BEFORE;
	WATCH;
}

enum Request {
	ICE_CANDIDATE(candidate:IceCandidate);
	JOIN_VIEWER;
	LEAVE_VIEWER;
	CONNECT_STREAM(sdpOffer:SessionDescription);
	DISCONNECT_STREAM;
	COMMENT(text:String, type:CommentType, pageUrl:String);
}

class Main
{
	private var WS_URL(default, null):String = "wss://seibe.jp:8081/speech";
	private var _ws:WebSocket;
	private var _webRtcPeer:WebRtcPeer;
	private var _dom:DomManager;
	private var _timer:Timer;
	
	private var _state:State;
	
	private var _name:String;
	private var _title:String;
	private var _username:String;
	private var _prevComment:String;
	private var _numQuestion:Int;
	
	static function main() 
	{
		new Main();
	}
	
	public function new()
	{
		Browser.window.onload = function():Void {
			_ws = null;
			_webRtcPeer = null;
			_state = null;
			_timer = null;
			_numQuestion = 0;
			_title = null;
			_username = null;
			_dom = new DomManager();
			
			setState(State.SETUP);
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
				// イベントリスナー削除
				_dom.getButton("submit", "setup").removeEventListener("click", onClickButtonStart);
				
				// 各フォーム値の取得
				_username = _dom.getInput("viewer", "setup").value;
				
				// エラー通知の削除
				_dom.getOutput("error", "setup").innerText = "";
				
			case State.WATCH_BEFORE:
				// ロードダイアログを閉じる
				try {
					_dom.getDialog("loading").close();
				} catch (e:Error) {
					trace(e);
				}
				
			case State.WATCH:
				// 視聴を終える
				if (_webRtcPeer != null) {
					send(Request.DISCONNECT_STREAM);
					_webRtcPeer.dispose();
					_webRtcPeer = null;
				}
				if (_ws != null) {
					send(Request.LEAVE_VIEWER);
					_ws.close();
					_ws = null;
				}
				
				// イベントリスナー削除
				_dom.get("comment-send-normal", "live").removeEventListener("click", sendComment);
				_dom.get("comment-send-question", "live").removeEventListener("click", sendComment);
				_dom.get("action-comment", "live").removeEventListener("click", onClickCommentTypeNormal);
				_dom.get("action-question", "live").removeEventListener("click", onClickCommentTypeQuestion);
				_dom.get("action-setting", "live").removeEventListener("click", onClickSetting);
				_dom.getInput("comment", "live").removeEventListener("keypress", onKeyPressComment);
				
			case null:
				//起動時の特別な処理
		}
		
		// シーンの開始処理
		switch (nextState)
		{
			case State.SETUP:
				// シーンの初期化
				_dom.changeScene("setup");
				
				// イベントリスナー登録
				_dom.getButton("submit").addEventListener("click", onClickButtonStart);
				
			case State.WATCH_BEFORE:
				// ロードダイアログの表示
				try {
					_dom.getDialog("loading").showModal();
				} catch (e:Error) {
					trace(e);
				}
				
				// WebSocketサーバーに接続する
				_ws = new WebSocket(WS_URL);
				_ws.addEventListener("open", onWsConnect);
				_ws.addEventListener("close", onWsClose);
				_ws.addEventListener("message", onWsMessage);
				_ws.addEventListener("error", onWsError);
				
				// コメント・質問ビュー初期化
				_numQuestion = 0;
				_dom.get("comment-list", "live").innerHTML = "";
				_dom.get("question-list", "live").innerHTML = "";
				_dom.get("num-question", "live").innerText = "0";
				_dom.get("num-audience", "live").innerText = "0";
				
			case State.WATCH:
				// シーンの初期化
				_dom.changeScene("live");
				
				// イベントリスナー登録
				_dom.get("comment-send-normal").addEventListener("click", sendComment);
				_dom.get("comment-send-question").addEventListener("click", sendComment);
				_dom.get("action-comment").addEventListener("click", onClickCommentTypeNormal);
				_dom.get("action-question").addEventListener("click", onClickCommentTypeQuestion);
				_dom.get("action-setting").addEventListener("click", onClickSetting);
				_dom.getInput("comment").addEventListener("keypress", onKeyPressComment);
				
		}
		
		_state = nextState;
	}
	
	private function send(req:Request):Void
	{
		var obj:Dynamic = { };
		
		switch (req)
		{
			case Request.ICE_CANDIDATE(candidate):
				// 経路情報の送信
				obj.type = ClientMessageType.ICE_CANDIDATE;
				obj.data = candidate;
				
			case Request.JOIN_VIEWER:
				// 視聴者としてプレゼンに参加する
				obj.type = ClientMessageType.JOIN_VIEWER;
				obj.data = null;
				
			case Request.LEAVE_VIEWER:
				// プレゼンから離脱する
				obj.type = ClientMessageType.LEAVE_PRESENTER;
				obj.data = null;
				
			case Request.CONNECT_STREAM(offer):
				// 視聴者として映像の受信を要求する
				obj.type = ClientMessageType.CONNECT_STREAM;
				obj.data = offer;
				
			case Request.DISCONNECT_STREAM:
				// 映像の受信を終了する
				obj.type = ClientMessageType.DISCONNECT_STREAM;
				obj.data = null;
				
			case Request.COMMENT(text, type, pageUrl):
				// コメントする
				obj.type = ClientMessageType.COMMENT;
				obj.data = {
					type: type,
					text: text,
					pageUrl: pageUrl,
					name: _username,
					point: null
				};
		}
		
		obj.timestamp = Date.now().getTime();
		_ws.send(Json.stringify(obj));
	}
	
	private function connectStream():Void
	{
		if (_webRtcPeer != null) {
			_webRtcPeer.dispose();
			_webRtcPeer = null;
		}
		
		// 映像受信の準備
		_webRtcPeer = WebRtcPeer.WebRtcPeerRecvonly({
			remoteVideo: _dom.getVideo(),
			onicecandidate: onIcecandidate
		}, function (err1:Dynamic):Void {
			if (err1 != null) {
				trace("webrtcpeer error", err1);
				_webRtcPeer = null;
			}
			_webRtcPeer.generateOffer(function (err2:Dynamic, offerSdp:SessionDescription):Void {
				if (err2 != null) {
					trace("webrtcpeer error", err2);
					_webRtcPeer = null;
				}
				// 映像配信に接続する
				send(Request.CONNECT_STREAM(offerSdp));
			});
		});
	}
	
	private function sendComment():Void
	{
		var text:String = _dom.getInput("comment", "live").value;
		var type:CommentType = CommentType.NORMAL;
		var url:String = _dom.getSlide().src;
		
		if (text.length == 0 || text == _prevComment) return;
		
		// 質問判定
		if (_dom.getInput("comment-type-question", "live").checked) {
			type = CommentType.QUESTION;
			_dom.getInput("comment-type-normal", "live").checked = true;
		}
		
		// スタンプ判定
		var regPlus:EReg = ~/(^\++1?$)|(^plus$)/i;
		var regClap:EReg = ~/(^clap$)|(^拍手$)|(^88+$)/i;
		var regHatena:EReg = ~/(^\?$)|(^hatena$)|(^はてな$)/i;
		var regWarai:EReg = ~/(^w+$)|(^warai$)|(^笑い?$)/i;
		if (regPlus.match(text)) type = CommentType.STAMP_PLUS;
		else if (regClap.match(text)) type = CommentType.STAMP_CLAP;
		else if (regHatena.match(text)) type = CommentType.STAMP_HATENA;
		else if (regWarai.match(text)) type = CommentType.STAMP_WARAI;
		
		send(Request.COMMENT(text, type, url));
		
		_prevComment = text;
		_dom.getInput("comment", "live").value = "";
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
		trace("open ws");
		
		send(Request.JOIN_VIEWER);
	}
	
	private function onWsClose(e:Dynamic):Void
	{
		trace("close ws");
		
		setState(State.SETUP);
	}
	
	private function onWsMessage(e:Dynamic):Void
	{
		var mes:Dynamic = Json.parse(e.data);
		var d:Dynamic = mes.data;
		trace(mes.type);
		
		switch (mes.type)
		{
			case ServerMessageType.ACCEPT_STREAM:
				// メディアサーバーへの接続完了
				_webRtcPeer.processAnswer(d, function(e) {
					trace(e);
				});
				
			case ServerMessageType.UPDATE_AUDIENCE:
				// 参加人数の更新
				_dom.get("num-audience", "live").innerText = d;
				
			case ServerMessageType.ICE_CANDIDATE:
				// 経路情報の追加
				_webRtcPeer.addIceCandidate(d);
				
			case ServerMessageType.COMMENT:
				// 各種コメントの受信
				var comment:CommentData = d;
				var name = comment.name != null ? StringTools.htmlEscape(comment.name) : "nanashi";
				var text = StringTools.htmlEscape(comment.text);
				trace(comment.type);
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
				// エラー
				trace("error message", d);
				_dom.getOutput("error", "setup").innerText = StringTools.htmlEscape(d);
				
			case ServerMessageType.FINISH:
				// プレゼンテーションの正常終了
				
			case ServerMessageType.WILL_STOP_STREAM:
				// 映像配信の終了予告
				
			case ServerMessageType.STOP_STREAM:
				// 映像配信の終了
				
			case ServerMessageType.ACCEPT_AUDIENCE:
				// プレゼンテーションへの参加承認
				_dom.get("title", "live").innerText = d.title;
				_dom.getSlide().src = d.slideUrl;
				setState(State.WATCH);
				
			case ServerMessageType.CAN_CONNECT_STREAM:
				// 映像配信がある
				connectStream();
				
			case ServerMessageType.UPDATE_SLIDE:
				// スライド資料のURL更新通知
				_dom.getSlide().src = d;
				
			case ServerMessageType.START_POINTER:
				// ToDo
				
			case ServerMessageType.UPDATE_POINTER:
				// ToDo
				
			case ServerMessageType.STOP_POINTER:
				// ToDo
				
			default:
				trace("unknown message", mes);
		}
	}
	
	private function onWsError(e:Dynamic):Void
	{
		trace("ws error", e);
	}
	
	private function onClickButtonStart():Void
	{
		_name = _dom.getInput("viewer", "setup").value;
		
		if (_name.length == 0) {
			// 入力が不足しているので再入力を促す
			_dom.getInput("viewer", "setup").focus();
			_dom.getOutput("error", "setup").innerText = "名前を入力してください";
		} else {
			// シーンを遷移する
			setState(State.WATCH_BEFORE);
		}
	}
	
	private function onClickCommentTypeNormal():Void
	{
		_dom.getInput("comment-type-normal", "live").checked = true;
		_dom.getInput("comment", "live").focus();
	}
	
	private function onClickCommentTypeQuestion():Void
	{
		_dom.getInput("comment-type-question", "live").checked = true;
		_dom.getInput("comment", "live").focus();
	}
	
	private function onClickSetting():Void
	{
		//
	}
	
	private function onKeyPressComment(e:Dynamic):Void
	{
		// コメント入力中にエンターキーで送信する
		if (e.keyCode == 13) sendComment();
	}
	
	private function onIcecandidate(candidate:IceCandidate):Void
	{
		send(Request.ICE_CANDIDATE(candidate));
	}
	
}
