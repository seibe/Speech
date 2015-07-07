(function (console) { "use strict";
var jp_seibe_presenjs_Client = function() {
	this.WS_URL = "ws://localhost:8080/ws/presenjs";
	window.onload = $bind(this,this.init);
};
jp_seibe_presenjs_Client.main = function() {
	new jp_seibe_presenjs_Client();
};
jp_seibe_presenjs_Client.prototype = {
	init: function(e) {
		this._ws = new WebSocket(this.WS_URL);
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
jp_seibe_presenjs_Client.main();
})(typeof console != "undefined" ? console : {log:function(){}});
