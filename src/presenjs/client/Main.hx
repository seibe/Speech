package presenjs.client;

import haxe.Json;
import js.Browser;
import js.html.ButtonElement;
import js.html.Element;
import js.html.IFrameElement;
import js.html.InputElement;
import js.html.UListElement;
import js.html.WebSocket;

class Main
{
	private var WS_URL(default, null):String = "ws://localhost:8081/ws/presenjs";
	private var _ws:WebSocket;
	private var _isConnect:Bool;
	private var _frame:IFrameElement;
	private var _title:Element;
	private var _board:UListElement;
	private var _inputName:InputElement;
	private var _inputText:InputElement;
	private var _inputSubmit:ButtonElement;
	private var _prevText:String;
	private var _roomId:String;
	
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
		_frame.src = "wait.jpg";
		
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
	}
	
	private function onConnect(e:Dynamic):Void
	{
		trace("open websocket");
		
		_ws.send(Json.stringify( {
			type: "enter",
			data: { roomId: _roomId },
			requestId: 0,
			timestamp: Date.now().getTime()
		} ));
	}
	
	private function onDisconnect(e:Dynamic):Void
	{
		trace("close websocket");
		_isConnect = false;
	}
	
	private function onMessage(e:Dynamic):Void
	{
		var m:Dynamic = Json.parse(e.data);
		
		switch (m.type)
		{
			case "onEnter":
				_isConnect = true;
				_title.innerText = m.data.title;
				_board.innerHTML = "<li class='system'>入室しました</li>" + _board.innerHTML;
				if (m.data.slideUrl && m.data.slideUrl.length > 0) _frame.src = m.data.slideUrl;
				
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
				
			case "onChange":
				_board.innerHTML = "<li class='system'><a href='" + m.data.slideUrl + "'>ページ</a>が変わりました</li>" + _board.innerHTML;
				_frame.src = m.data.slideUrl;
				
			case "onComment":
				_board.innerHTML = "<li>" + m.data.text + "<br/><small>(" + m.data.name + ")</small></li>" + _board.innerHTML;
				
			case "onError":
				_board.innerHTML = "<li class='system'>エラー: " + m.data + "</li>" + _board.innerHTML;
				
			default:
				trace("unknown message");
		}
	}
}
