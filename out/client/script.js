(function (console) { "use strict";
var presenjs_client_Main = function() {
	this.WS_URL = "ws://localhost:8081/ws/presenjs";
	window.onload = $bind(this,this.init);
};
presenjs_client_Main.main = function() {
	new presenjs_client_Main();
};
presenjs_client_Main.prototype = {
	init: function() {
		this._isConnect = false;
		this._img = window.document.getElementById("view");
		this._img.src = "wait.jpg";
		this._ws = new WebSocket(this.WS_URL);
		this._ws.addEventListener("open",$bind(this,this.onConnect));
		this._ws.addEventListener("close",$bind(this,this.onDisconnect));
		this._ws.addEventListener("message",$bind(this,this.onMessage));
	}
	,onConnect: function(e) {
		console.log("open websocket");
		this._isConnect = true;
		this._ws.send(JSON.stringify({ type : "audience"}));
	}
	,onDisconnect: function(e) {
		console.log("close websocket");
		this._isConnect = false;
		this._img.src = "wait.jpg";
	}
	,onMessage: function(e) {
		var m = JSON.parse(e.data);
		var _g = m.type;
		switch(_g) {
		case "updateScreen":
			console.log("updateScreen");
			this._img.src = m.data;
			break;
		default:
			console.log("unknown message");
		}
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
presenjs_client_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
