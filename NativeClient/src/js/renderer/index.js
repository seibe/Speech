(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var haxe_Log = function() { };
haxe_Log.__name__ = true;
haxe_Log.trace = function(v,infos) {
	js_Boot.__trace(v,infos);
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
};
js_Boot.__trace = function(v,i) {
	var msg;
	if(i != null) msg = i.fileName + ":" + i.lineNumber + ": "; else msg = "";
	msg += js_Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0;
		var _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js_Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js_Boot.__unhtml(msg) + "<br/>"; else if(typeof console != "undefined" && console.log != null) console.log(msg);
};
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
var speech_renderer_Request = { __ename__ : true, __constructs__ : ["CREATE","BEGIN","PAUSE","END","OPEN","CHANGE"] };
speech_renderer_Request.CREATE = function(option) { var $x = ["CREATE",0,option]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
speech_renderer_Request.BEGIN = ["BEGIN",1];
speech_renderer_Request.BEGIN.toString = $estr;
speech_renderer_Request.BEGIN.__enum__ = speech_renderer_Request;
speech_renderer_Request.PAUSE = ["PAUSE",2];
speech_renderer_Request.PAUSE.toString = $estr;
speech_renderer_Request.PAUSE.__enum__ = speech_renderer_Request;
speech_renderer_Request.END = ["END",3];
speech_renderer_Request.END.toString = $estr;
speech_renderer_Request.END.__enum__ = speech_renderer_Request;
speech_renderer_Request.OPEN = function(slideUrl,option) { var $x = ["OPEN",4,slideUrl,option]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
speech_renderer_Request.CHANGE = function(slideUrl) { var $x = ["CHANGE",5,slideUrl]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
var speech_renderer_Index = function() {
	this.WS_URL = "ws://localhost:8081/ws/presenjs";
	window.onload = $bind(this,this.init);
};
speech_renderer_Index.__name__ = true;
speech_renderer_Index.main = function() {
	new speech_renderer_Index();
};
speech_renderer_Index.prototype = {
	init: function() {
		this._isBegin = this._isCreate = this._isConnect = false;
		this._prevUrl = "";
		this._reqCount = 0;
		this._ws = new WebSocket(this.WS_URL);
		this._ws.addEventListener("open",$bind(this,this.onConnect));
		this._ws.addEventListener("close",$bind(this,this.onDisconnect));
		this._ws.addEventListener("message",$bind(this,this.onReceive));
		this._ws.addEventListener("error",$bind(this,this.onError));
		this._webview = window.document.getElementById("player-main-webview");
		this._webviewContainer = window.document.getElementById("player-main");
		window.addEventListener("resize",$bind(this,this.onResize));
		this.onResize();
	}
	,onResize: function() {
		this._webview.style.height = Std.string(this._webviewContainer.offsetHeight) + "px";
	}
	,send: function(req) {
		var obj = { };
		switch(req[1]) {
		case 0:
			var option = req[2];
			obj.type = "create";
			obj.data = { 'option' : option};
			break;
		case 1:
			obj.type = "begin";
			break;
		case 2:
			obj.type = "pause";
			break;
		case 3:
			obj.type = "end";
			break;
		case 4:
			var option1 = req[3];
			var slideUrl = req[2];
			obj.type = "open";
			obj.data = { 'slideUrl' : slideUrl, 'option' : option1};
			break;
		case 5:
			var slideUrl1 = req[2];
			obj.type = "change";
			obj.data = { 'slideUrl' : slideUrl1};
			break;
		}
		obj.timestamp = new Date().getTime();
		obj.requestId = this._reqCount++;
		this._ws.send(JSON.stringify(obj));
		return this._reqCount;
	}
	,onConnect: function(e) {
		haxe_Log.trace("connect",{ fileName : "Index.hx", lineNumber : 189, className : "speech.renderer.Index", methodName : "onConnect"});
		this._isConnect = true;
		if(!this._isCreate) this.send(speech_renderer_Request.CREATE({ title : "test room", aspect : "4:3"}));
	}
	,onDisconnect: function(e) {
		this._isConnect = false;
	}
	,onReceive: function(e) {
		var resp = JSON.parse(e.data);
		var _g = resp.type;
		switch(_g) {
		case "onCreate":
			this._console.innerHTML += "<br/>room url: " + Std.string(resp.data);
			this._isCreate = true;
			break;
		case "onBegin":
			this._isBegin = true;
			break;
		case "onPause":
			break;
		case "onEnd":
			break;
		case "onEnter":
			break;
		case "onLeave":
			break;
		case "onError":
			haxe_Log.trace("resp error",{ fileName : "Index.hx", lineNumber : 232, className : "speech.renderer.Index", methodName : "onReceive", customParams : [resp.data]});
			break;
		}
	}
	,onError: function(e) {
		haxe_Log.trace("error",{ fileName : "Index.hx", lineNumber : 238, className : "speech.renderer.Index", methodName : "onError", customParams : [e]});
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
speech_renderer_Index.main();
})(typeof console != "undefined" ? console : {log:function(){}});
