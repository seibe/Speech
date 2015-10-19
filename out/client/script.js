(function (console) { "use strict";
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
var presenjs_client_Main = function() {
	this.WS_URL = "ws://localhost:8081/ws/presenjs";
	window.onload = $bind(this,this.init);
};
presenjs_client_Main.__name__ = true;
presenjs_client_Main.main = function() {
	new presenjs_client_Main();
};
presenjs_client_Main.prototype = {
	init: function() {
		var _g = this;
		this._isConnect = false;
		this._prevText = "";
		this._title = window.document.getElementById("title");
		this._frame = window.document.getElementById("slide-frame");
		this._board = window.document.getElementById("comment-list");
		this._inputName = window.document.getElementById("comment-form-name");
		this._inputText = window.document.getElementById("comment-form-text");
		this._inputSubmit = window.document.getElementById("comment-form-submit");
		this._roomId = window.location.hash;
		if(this._roomId.length < 2) {
			this._board.innerHTML = "<li class='system'>有効な部屋番号ではありません</li>" + this._board.innerHTML;
			return;
		}
		this._roomId = HxOverrides.substr(this._roomId,1,null);
		this._frame.src = "wait.jpg";
		this._ws = new WebSocket(this.WS_URL);
		this._ws.addEventListener("open",$bind(this,this.onConnect));
		this._ws.addEventListener("close",$bind(this,this.onDisconnect));
		this._ws.addEventListener("message",$bind(this,this.onMessage));
		var doComment = function() {
			if(!_g._isConnect) return;
			var name = _g._inputName.value;
			var text = _g._inputText.value;
			if(name.length > 0) name = name; else name = "anonymous";
			if(text == _g._prevText) return;
			_g._ws.send(JSON.stringify({ type : "comment", data : { roomId : _g._roomId, name : name, text : text, slideUrl : _g._frame.src}, requestId : 0, timestamp : new Date().getTime()}));
			_g._prevText = text;
			_g._inputText.value = "";
		};
		this._inputText.addEventListener("keypress",function(e) {
			if(e.keyCode == 13) doComment();
		});
		this._inputSubmit.addEventListener("click",doComment);
	}
	,onConnect: function(e) {
		console.log("open websocket");
		this._ws.send(JSON.stringify({ type : "enter", data : { roomId : this._roomId}, requestId : 0, timestamp : new Date().getTime()}));
	}
	,onDisconnect: function(e) {
		console.log("close websocket");
		this._isConnect = false;
	}
	,onMessage: function(e) {
		var m = JSON.parse(e.data);
		var _g = m.type;
		switch(_g) {
		case "onEnter":
			this._isConnect = true;
			this._title.innerText = m.data.title;
			this._board.innerHTML = "<li class='system'>入室しました</li>" + this._board.innerHTML;
			if(m.data.slideUrl && m.data.slideUrl.length > 0) this._frame.src = m.data.slideUrl;
			break;
		case "onLeave":
			this._isConnect = false;
			this._frame.src = "wait.jpg";
			break;
		case "onBegin":
			this._board.innerHTML = "<li class='system'>発表が始まりました</li>" + this._board.innerHTML;
			break;
		case "onPause":
			this._board.innerHTML = "<li class='system'>発表が中断しました</li>" + this._board.innerHTML;
			break;
		case "onEnd":
			this._board.innerHTML = "<li class='system'>発表が終了しました</li>" + this._board.innerHTML;
			this._ws.close();
			break;
		case "onOpen":
			this._board.innerHTML = "<li class='system'><a href='" + Std.string(m.data.slideUrl) + "'>スライド資料</a>が開かれました</li>" + this._board.innerHTML;
			this._frame.src = m.data.slideUrl;
			break;
		case "onChange":
			this._board.innerHTML = "<li class='system'><a href='" + Std.string(m.data.slideUrl) + "'>ページ</a>が変わりました</li>" + this._board.innerHTML;
			this._frame.src = m.data.slideUrl;
			break;
		case "onComment":
			this._board.innerHTML = "<li>" + Std.string(m.data.text) + "<br/><small>(" + Std.string(m.data.name) + ")</small></li>" + this._board.innerHTML;
			break;
		case "onError":
			this._board.innerHTML = "<li class='system'>エラー: " + Std.string(m.data) + "</li>" + this._board.innerHTML;
			break;
		default:
			console.log("unknown message");
		}
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
presenjs_client_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
