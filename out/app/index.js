(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
};
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
var haxe_Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe_Timer.__name__ = true;
haxe_Timer.delay = function(f,time_ms) {
	var t = new haxe_Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
};
haxe_Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
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
var presenjs_app_Request = { __ename__ : true, __constructs__ : ["CREATE","BEGIN","PAUSE","END","OPEN","CHANGE"] };
presenjs_app_Request.CREATE = function(option) { var $x = ["CREATE",0,option]; $x.__enum__ = presenjs_app_Request; $x.toString = $estr; return $x; };
presenjs_app_Request.BEGIN = ["BEGIN",1];
presenjs_app_Request.BEGIN.toString = $estr;
presenjs_app_Request.BEGIN.__enum__ = presenjs_app_Request;
presenjs_app_Request.PAUSE = ["PAUSE",2];
presenjs_app_Request.PAUSE.toString = $estr;
presenjs_app_Request.PAUSE.__enum__ = presenjs_app_Request;
presenjs_app_Request.END = ["END",3];
presenjs_app_Request.END.toString = $estr;
presenjs_app_Request.END.__enum__ = presenjs_app_Request;
presenjs_app_Request.OPEN = function(slideUrl,option) { var $x = ["OPEN",4,slideUrl,option]; $x.__enum__ = presenjs_app_Request; $x.toString = $estr; return $x; };
presenjs_app_Request.CHANGE = function(slideUrl) { var $x = ["CHANGE",5,slideUrl]; $x.__enum__ = presenjs_app_Request; $x.toString = $estr; return $x; };
var presenjs_app_Index = function() {
	this.WS_URL = "ws://localhost:8081/ws/presenjs";
	window.onload = $bind(this,this.init);
};
presenjs_app_Index.__name__ = true;
presenjs_app_Index.main = function() {
	new presenjs_app_Index();
};
presenjs_app_Index.prototype = {
	init: function() {
		var _g = this;
		this._isBegin = this._isCreate = this._isConnect = false;
		this._prevUrl = "";
		this._reqCount = 0;
		this._ws = new WebSocket(this.WS_URL);
		this._ws.addEventListener("open",$bind(this,this.onConnect));
		this._ws.addEventListener("close",$bind(this,this.onDisconnect));
		this._ws.addEventListener("message",$bind(this,this.onReceive));
		this._ws.addEventListener("error",$bind(this,this.onError));
		this._webview = window.document.getElementById("preview");
		this._console = window.document.getElementById("info-console");
		var btnOpen = window.document.getElementById("btn-open");
		var btnBegin = window.document.getElementById("btn-begin");
		var btnEnd = window.document.getElementById("btn-end");
		btnOpen.addEventListener("click",function(e) {
			_g._webview.src = "file://" + __dirname + "/blank.html";
		});
		btnBegin.addEventListener("click",function(e1) {
			var reg = new EReg("http(s)?://([\\w-]+\\.)+[\\w-]+(/[\\w-./?%&=]*)?","");
			var url = _g._webview.getUrl();
			if(reg.match(url)) {
				btnBegin.disabled = true;
				btnEnd.disabled = false;
				_g.send(presenjs_app_Request.BEGIN);
				_g.send(presenjs_app_Request.OPEN(url,{ }));
				_g._isBegin = true;
				_g._prevUrl = url;
			}
		});
		btnEnd.addEventListener("click",function(e2) {
			btnEnd.disabled = true;
			_g.send(presenjs_app_Request.END);
		});
		this._webview.addEventListener("keydown",function(e3) {
			if(!_g._isBegin) return;
			haxe_Timer.delay(function() {
				var url1 = _g._webview.getUrl();
				if(_g._prevUrl != url1) {
					_g._console.innerHTML += "<br/>" + url1;
					_g.send(presenjs_app_Request.CHANGE(url1));
					_g._prevUrl = url1;
				}
			},250);
		});
		this._webview.addEventListener("did-finish-load",function() {
			haxe_Log.trace("did_finish_load",{ fileName : "Index.hx", lineNumber : 107, className : "presenjs.app.Index", methodName : "init", customParams : [_g._webview.getUrl()]});
		});
		haxe_Timer.delay(function() {
			_g._webview.openDevTools();
		},1000);
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
		haxe_Log.trace("connect",{ fileName : "Index.hx", lineNumber : 173, className : "presenjs.app.Index", methodName : "onConnect"});
		this._isConnect = true;
		if(!this._isCreate) this.send(presenjs_app_Request.CREATE({ title : "test room", aspect : "4:3"}));
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
			haxe_Log.trace("resp error",{ fileName : "Index.hx", lineNumber : 216, className : "presenjs.app.Index", methodName : "onReceive", customParams : [resp.data]});
			break;
		}
	}
	,onError: function(e) {
		haxe_Log.trace("error",{ fileName : "Index.hx", lineNumber : 222, className : "presenjs.app.Index", methodName : "onError", customParams : [e]});
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
presenjs_app_Index.main();
})(typeof console != "undefined" ? console : {log:function(){}});
