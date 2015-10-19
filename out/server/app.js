(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { };
HxOverrides.__name__ = true;
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
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
});
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
			if (e instanceof js__$Boot_HaxeError) e = e.val;
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
var js_node_Crypto = require("crypto");
var js_node_Fs = require("fs");
var presenjs_server_Response = { __ename__ : true, __constructs__ : ["ON_CREATE","ON_ENTER","ON_LEAVE","ON_BEGIN","ON_PAUSE","ON_END","ON_OPEN","ON_CHANGE","ON_COMMENT","ON_ERROR"] };
presenjs_server_Response.ON_CREATE = function(roomUrl) { var $x = ["ON_CREATE",0,roomUrl]; $x.__enum__ = presenjs_server_Response; $x.toString = $estr; return $x; };
presenjs_server_Response.ON_ENTER = function(userId,totalNum) { var $x = ["ON_ENTER",1,userId,totalNum]; $x.__enum__ = presenjs_server_Response; $x.toString = $estr; return $x; };
presenjs_server_Response.ON_LEAVE = function(userId) { var $x = ["ON_LEAVE",2,userId]; $x.__enum__ = presenjs_server_Response; $x.toString = $estr; return $x; };
presenjs_server_Response.ON_BEGIN = ["ON_BEGIN",3];
presenjs_server_Response.ON_BEGIN.toString = $estr;
presenjs_server_Response.ON_BEGIN.__enum__ = presenjs_server_Response;
presenjs_server_Response.ON_PAUSE = ["ON_PAUSE",4];
presenjs_server_Response.ON_PAUSE.toString = $estr;
presenjs_server_Response.ON_PAUSE.__enum__ = presenjs_server_Response;
presenjs_server_Response.ON_END = ["ON_END",5];
presenjs_server_Response.ON_END.toString = $estr;
presenjs_server_Response.ON_END.__enum__ = presenjs_server_Response;
presenjs_server_Response.ON_OPEN = function(slideUrl) { var $x = ["ON_OPEN",6,slideUrl]; $x.__enum__ = presenjs_server_Response; $x.toString = $estr; return $x; };
presenjs_server_Response.ON_CHANGE = function(slideUrl) { var $x = ["ON_CHANGE",7,slideUrl]; $x.__enum__ = presenjs_server_Response; $x.toString = $estr; return $x; };
presenjs_server_Response.ON_COMMENT = function(name,text) { var $x = ["ON_COMMENT",8,name,text]; $x.__enum__ = presenjs_server_Response; $x.toString = $estr; return $x; };
presenjs_server_Response.ON_ERROR = function(error) { var $x = ["ON_ERROR",9,error]; $x.__enum__ = presenjs_server_Response; $x.toString = $estr; return $x; };
var presenjs_server_Main = function() {
	this._room = [];
	this._server = new ws_WsServer({ port : 8081, path : "/ws/presenjs"});
	this._server.on("connection",$bind(this,this.onOpen));
};
presenjs_server_Main.__name__ = true;
presenjs_server_Main.main = function() {
	new presenjs_server_Main();
};
presenjs_server_Main.prototype = {
	onOpen: function(client) {
		var _g1 = this;
		client.on("message",function(data,flags) {
			var d = JSON.parse(data);
			console.log(d.type);
			var _g = d.type;
			switch(_g) {
			case "create":
				var hash = js_node_Crypto.createHash("sha1");
				hash.update(Std.string(new Date().getTime()) + Std.string(Math.random()));
				var name = hash.digest("hex");
				js_node_Fs.writeFile(__dirname + "/file/" + name + ".txt",Std.string(d.timestamp) + ",create\r\n",function(e) {
					if(e != null) console.log(e);
				});
				var room = { title : d.data.option.title, filename : name, presenter : client, audience : [], slideUrl : null};
				_g1._room.push(room);
				_g1.send(room,presenjs_server_Response.ON_CREATE(name),d.requestId);
				break;
			case "begin":
				var _g2 = 0;
				var _g3 = _g1._room;
				while(_g2 < _g3.length) {
					var r = _g3[_g2];
					++_g2;
					if(r.presenter == client) {
						_g1.write(r,d.timestamp,"begin");
						_g1.send(r,presenjs_server_Response.ON_BEGIN,d.requestId);
						break;
					}
				}
				break;
			case "pause":
				break;
			case "end":
				var _g21 = 0;
				var _g31 = _g1._room;
				while(_g21 < _g31.length) {
					var r1 = _g31[_g21];
					++_g21;
					if(r1.presenter == client) {
						_g1.write(r1,d.timestamp,"end");
						_g1.send(r1,presenjs_server_Response.ON_END,d.requestId);
						client.close();
						break;
					}
				}
				break;
			case "open":
				var _g22 = 0;
				var _g32 = _g1._room;
				while(_g22 < _g32.length) {
					var r2 = _g32[_g22];
					++_g22;
					if(r2.presenter == client) {
						_g1.write(r2,d.timestamp,"open," + Std.string(d.data.slideUrl));
						_g1.send(r2,presenjs_server_Response.ON_OPEN(d.data.slideUrl),d.requestId);
						r2.slideUrl = d.data.slideUrl;
						break;
					}
				}
				break;
			case "change":
				var _g23 = 0;
				var _g33 = _g1._room;
				while(_g23 < _g33.length) {
					var r3 = _g33[_g23];
					++_g23;
					if(r3.presenter == client) {
						_g1.write(r3,d.timestamp,"change," + Std.string(d.data.slideUrl));
						_g1.send(r3,presenjs_server_Response.ON_CHANGE(d.data.slideUrl),d.requestId);
						break;
					}
				}
				break;
			case "enter":
				var _g24 = 0;
				var _g34 = _g1._room;
				while(_g24 < _g34.length) {
					var r4 = _g34[_g24];
					++_g24;
					if(r4.filename == d.data.roomId) {
						r4.audience.push(client);
						client.send(JSON.stringify({ type : "onEnter", data : { title : r4.title, slideUrl : r4.slideUrl}}));
						return;
					}
				}
				client.send(JSON.stringify({ type : "onError", data : "指定された部屋は存在しないか、中継が終了しています"}));
				client.close();
				break;
			case "comment":
				var _g25 = 0;
				var _g35 = _g1._room;
				while(_g25 < _g35.length) {
					var r5 = _g35[_g25];
					++_g25;
					if(r5.filename == d.data.roomId) {
						_g1.write(r5,d.timestamp,JSON.stringify({ name : d.data.name, text : d.data.text, url : d.data.slideUrl}));
						_g1.send(r5,presenjs_server_Response.ON_COMMENT(d.data.name,d.data.text),d.requestId);
						return;
					}
				}
				client.send(JSON.stringify({ type : "onError", data : "指定された部屋は存在しないか、中継が終了しています"}));
				client.close();
				break;
			default:
				console.log("request error: " + Std.string(d.type));
			}
		});
		client.on("close",function(code,msg) {
			var _g4 = 0;
			var _g26 = _g1._room;
			while(_g4 < _g26.length) {
				var r6 = _g26[_g4];
				++_g4;
				if(r6.presenter == client) {
					console.log("close presenter");
					HxOverrides.remove(_g1._room,r6);
					break;
				}
				var _g36 = 0;
				var _g41 = r6.audience;
				while(_g36 < _g41.length) {
					var a = _g41[_g36];
					++_g36;
					if(a == client) {
						console.log("close audience");
						HxOverrides.remove(r6.audience,client);
						break;
					}
				}
			}
		});
		client.on("error",function(error) {
			throw new js__$Boot_HaxeError(error);
		});
	}
	,send: function(room,resp,requestId) {
		if(requestId == null) requestId = -1;
		var obj = { };
		switch(resp[1]) {
		case 0:
			var roomUrl = resp[2];
			obj.type = "onCreate";
			obj.data = roomUrl;
			break;
		case 3:
			obj.type = "onBegin";
			break;
		case 4:
			obj.type = "onPause";
			break;
		case 5:
			obj.type = "onEnd";
			break;
		case 1:
			obj.type = "onEnter";
			break;
		case 6:
			var slideUrl = resp[2];
			obj.type = "onOpen";
			obj.data = { slideUrl : slideUrl};
			break;
		case 7:
			var slideUrl1 = resp[2];
			obj.type = "onChange";
			obj.data = { slideUrl : slideUrl1};
			break;
		case 8:
			var text = resp[3];
			var name = resp[2];
			obj.type = "onComment";
			obj.data = { name : name, text : text};
			break;
		default:
			console.log("request error: " + resp[0]);
		}
		obj.timestamp = new Date().getTime();
		obj.reqestId = requestId;
		var data = JSON.stringify(obj);
		room.presenter.send(data);
		var _g = 0;
		var _g1 = room.audience;
		while(_g < _g1.length) {
			var a = _g1[_g];
			++_g;
			a.send(data);
		}
	}
	,write: function(room,timestamp,data) {
		js_node_Fs.appendFile(__dirname + "/file/" + room.filename + ".txt",timestamp + "," + data + "\r\n",function(e) {
			if(e != null) console.log(e);
		});
	}
};
var ws_WsServer = require("ws").Server;
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
presenjs_server_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
