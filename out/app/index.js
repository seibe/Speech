(function (console) { "use strict";
var electron_Electron = function() { };
var haxe_Json = function() { };
haxe_Json.stringify = function(obj,replacer,insertion) {
	return JSON.stringify(obj,replacer,insertion);
};
var haxe_Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
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
var presenjs_app_Index = function() {
	this.WS_URL = "ws://localhost:8081/ws/presenjs";
	window.onload = $bind(this,this.init);
};
presenjs_app_Index.main = function() {
	new presenjs_app_Index();
};
presenjs_app_Index.prototype = {
	init: function() {
		var _g = this;
		this._isConnect = false;
		this._prevCapstr = "";
		this._ws = new WebSocket(this.WS_URL);
		this._ws.addEventListener("open",$bind(this,this.onConnect));
		this._ws.addEventListener("close",$bind(this,this.onDisconnect));
		var webview = window.document.getElementById("preview");
		webview.addEventListener("did-finish-load",$bind(this,this.capture));
		webview.addEventListener("keydown",function(e) {
			haxe_Timer.delay($bind(_g,_g.capture),250);
		});
	}
	,capture: function() {
		var _g = this;
		var win = electron_Electron.require("remote").getCurrentWindow();
		win.capturePage(function(img) {
			var capstr = img.toDataUrl();
			if(_g._prevCapstr != capstr) {
				_g._prevCapstr = capstr;
				if(_g._isConnect) _g._ws.send(haxe_Json.stringify({ type : "updateScreen", data : capstr},null,null));
			}
		});
	}
	,onConnect: function(e) {
		this._isConnect = true;
		this._ws.send(haxe_Json.stringify({ type : "presenter"},null,null));
		this._prevCapstr = "";
		this.capture();
	}
	,onDisconnect: function(e) {
		this._isConnect = false;
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
electron_Electron.require = require;
presenjs_app_Index.main();
})(typeof console != "undefined" ? console : {log:function(){}});
