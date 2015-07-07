(function (console) { "use strict";
var HxOverrides = function() { };
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
var haxe_Json = function() { };
haxe_Json.stringify = function(obj,replacer,insertion) {
	return JSON.stringify(obj,replacer,insertion);
};
haxe_Json.parse = function(jsonString) {
	return JSON.parse(jsonString);
};
var presenjs_server_Main = function() {
	this._screen = null;
	this._presenterSocket = null;
	this._audienceSockets = [];
	this._server = new ws_WsServer({ port : 8081, path : "/ws/presenjs"});
	this._server.on("connection",$bind(this,this.onOpen));
};
presenjs_server_Main.main = function() {
	new presenjs_server_Main();
};
presenjs_server_Main.prototype = {
	onOpen: function(client) {
		var _g1 = this;
		console.log("open");
		client.on("message",function(data,flags) {
			var d = haxe_Json.parse(data);
			var _g = d.type;
			switch(_g) {
			case "presenter":
				console.log("join: presenter");
				_g1._presenterSocket = client;
				break;
			case "audience":
				console.log("join: audience");
				_g1._audienceSockets.push(client);
				if(_g1._screen != null) client.send(haxe_Json.stringify({ type : "updateScreen", data : _g1._screen},null,null));
				break;
			case "updateScreen":
				if(client == _g1._presenterSocket) {
					console.log("update screen");
					_g1._screen = d.data;
					var _g2 = 0;
					var _g3 = _g1._audienceSockets;
					while(_g2 < _g3.length) {
						var s = _g3[_g2];
						++_g2;
						s.send(data);
					}
				}
				break;
			default:
				console.log("unknown message");
			}
		});
		client.on("close",function(code,msg) {
			if(_g1._presenterSocket == client) {
				console.log("close presenter");
				_g1._presenterSocket = null;
				_g1._screen = null;
			} else if(HxOverrides.remove(_g1._audienceSockets,client)) console.log("close audience"); else console.log("close ?");
		});
		client.on("error",function(error) {
			console.log("error");
		});
	}
};
var ws_WsServer = require("ws").Server;
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
presenjs_server_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
