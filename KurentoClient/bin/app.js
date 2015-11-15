(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
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
var js_node_Crypto = require("crypto");
var js_node_Fs = require("fs");
var js_node_Path = require("path");
var js_node_tls_SecureContext = function() { };
js_node_tls_SecureContext.__name__ = true;
var kurento = require("kurento-client");
var speech_Main = function() {
	this.WS_URI = { port : 8081, path : "/speech"};
	var _g = this;
	this._roomList = [];
	this._sessionList = [];
	this._server = new ws_WsServer(this.WS_URI);
	this._server.on("connection",function(ws) {
		var session = new speech_core_Session(ws);
		_g._sessionList.push(session);
		haxe_Log.trace("Connection received with sessionId",{ fileName : "Main.hx", lineNumber : 39, className : "speech.Main", methodName : "new", customParams : [session.id]});
		ws.on("message",function(data,flags) {
			_g.onWsMessage(session,data,flags);
		});
		ws.on("close",function() {
			_g.onWsClose(session);
		});
		ws.on("error",function(error) {
			_g.onWsError(session,error);
		});
	});
};
speech_Main.__name__ = true;
speech_Main.main = function() {
	new speech_Main();
};
speech_Main.prototype = {
	onWsMessage: function(session,data,flags) {
		var mes = JSON.parse(data);
		var d = mes.data;
		var _g = mes.type;
		switch(_g) {
		case "joinPresenter":
			var room = new speech_core_Room(d.title,session,d.slideUrl);
			this._roomList.push(room);
			session.ws.send(JSON.stringify({ type : "accept", data : room.id}));
			break;
		case "leavePresenter":
			session.destroy();
			HxOverrides.remove(this._roomList,session.room);
			break;
		case "updateSlide":
			session.room.broadcast(speech_core_Response.UPDATE_SLIDE(d));
			break;
		case "startStream":
			session.startStream("ws://localhost:8888/kurento","file:///tmp",d);
			break;
		case "stopStream":
			session.stopStream();
			break;
		case "appendMedia":
			break;
		case "removeMedia":
			break;
		case "joinViewer":
			var _g1 = 0;
			var _g2 = this._roomList;
			while(_g1 < _g2.length) {
				var room1 = _g2[_g1];
				++_g1;
				if(room1.id == d.roomId) {
					room1.viewerList.push(session);
					session.room = room1;
					session.ws.send(JSON.stringify({ type : "accept", data : { title : room1.title, slideUrl : room1.slideUrl}}));
					if(d.sdpOffer != null && room1.presenter.endpoint != null) session.connectStream(d.sdpOffer);
					return;
				}
			}
			session.ws.send(JSON.stringify({ type : "onError", data : "指定された部屋は存在しないか、中継が終了しています"}));
			session.destroy();
			break;
		case "leaveViewer":
			session.destroy();
			break;
		case "comment":
			session.room.broadcast(speech_core_Response.COMMENT(d.name,d.text,d.slideUrl));
			break;
		case "iceCandidate":
			session.addIceCandidate(d);
			break;
		default:
			haxe_Log.trace("ws throw",{ fileName : "Main.hx", lineNumber : 128, className : "speech.Main", methodName : "onWsMessage", customParams : [mes.type]});
		}
	}
	,onWsClose: function(session) {
		haxe_Log.trace("close ws id: " + session.id,{ fileName : "Main.hx", lineNumber : 134, className : "speech.Main", methodName : "onWsClose"});
		session.destroy();
		HxOverrides.remove(this._sessionList,session);
	}
	,onWsError: function(session,error) {
		haxe_Log.trace("ws error",{ fileName : "Main.hx", lineNumber : 141, className : "speech.Main", methodName : "onWsError", customParams : [error]});
	}
};
var speech_core_Response = { __ename__ : true, __constructs__ : ["ENTER","LEAVE","END","UPDATE_SLIDE","COMMENT","CAN_START_STREAM","STOP_STREAM","ERROR"] };
speech_core_Response.ENTER = function(userId,totalNum) { var $x = ["ENTER",0,userId,totalNum]; $x.__enum__ = speech_core_Response; $x.toString = $estr; return $x; };
speech_core_Response.LEAVE = function(userId) { var $x = ["LEAVE",1,userId]; $x.__enum__ = speech_core_Response; $x.toString = $estr; return $x; };
speech_core_Response.END = ["END",2];
speech_core_Response.END.toString = $estr;
speech_core_Response.END.__enum__ = speech_core_Response;
speech_core_Response.UPDATE_SLIDE = function(slideUrl) { var $x = ["UPDATE_SLIDE",3,slideUrl]; $x.__enum__ = speech_core_Response; $x.toString = $estr; return $x; };
speech_core_Response.COMMENT = function(name,text,slideUrl) { var $x = ["COMMENT",4,name,text,slideUrl]; $x.__enum__ = speech_core_Response; $x.toString = $estr; return $x; };
speech_core_Response.CAN_START_STREAM = ["CAN_START_STREAM",5];
speech_core_Response.CAN_START_STREAM.toString = $estr;
speech_core_Response.CAN_START_STREAM.__enum__ = speech_core_Response;
speech_core_Response.STOP_STREAM = ["STOP_STREAM",6];
speech_core_Response.STOP_STREAM.toString = $estr;
speech_core_Response.STOP_STREAM.__enum__ = speech_core_Response;
speech_core_Response.ERROR = function(error) { var $x = ["ERROR",7,error]; $x.__enum__ = speech_core_Response; $x.toString = $estr; return $x; };
var speech_core_Room = function(title,presenter,slideUrl) {
	this.title = title;
	this.presenter = presenter;
	this.slideUrl = slideUrl;
	this.id = speech_core_Room.getUniqueKey();
	this.viewerList = [];
	presenter.room = this;
	var timestamp = Std.string(new Date().getTime());
	js_node_Fs.writeFile(__dirname + "/file/" + this.id + ".txt",timestamp + ",create,\r\n",$bind(this,this.onSave));
};
speech_core_Room.__name__ = true;
speech_core_Room.getUniqueKey = function() {
	var hash = js_node_Crypto.createHash("sha1");
	hash.update(Std.string(new Date().getTime()) + Std.string(Math.random()));
	return hash.digest("hex");
};
speech_core_Room.prototype = {
	broadcast: function(resp) {
		var obj = { };
		switch(resp[1]) {
		case 3:
			var slideUrl = resp[2];
			obj.type = "onUpdateSlide";
			obj.data = slideUrl;
			this.save("change",slideUrl);
			break;
		case 4:
			var url = resp[4];
			var text = resp[3];
			var name = resp[2];
			obj.type = "onComment";
			obj.data = { name : name, text : text, slideUrl : url};
			this.save("comment",JSON.stringify(obj.data));
			break;
		case 5:
			obj.type = "canStartStream";
			this.save("startStream",this.presenter.recordPath);
			break;
		case 6:
			obj.type = "onStopStream";
			this.save("stopStream");
			break;
		default:
			haxe_Log.trace("broadcast error",{ fileName : "Room.hx", lineNumber : 78, className : "speech.core.Room", methodName : "broadcast", customParams : [resp]});
		}
		obj.timestamp = new Date().getTime();
		var data = JSON.stringify(obj);
		this.presenter.ws.send(data);
		var _g = 0;
		var _g1 = this.viewerList;
		while(_g < _g1.length) {
			var viewer = _g1[_g];
			++_g;
			viewer.ws.send(data);
		}
	}
	,destroy: function() {
		if(this.id == null) return;
		this.save("close");
		this.id = null;
		if(this.presenter != null) this.presenter.destroy();
		this.presenter = null;
		if(this.viewerList != null) {
			var _g = 0;
			var _g1 = this.viewerList;
			while(_g < _g1.length) {
				var viewer = _g1[_g];
				++_g;
				viewer.destroy();
			}
		}
		this.viewerList = null;
		this.title = null;
		this.presenter = null;
		this.slideUrl = null;
	}
	,save: function(cmd,notes) {
		if(notes == null) notes = "";
		var path = __dirname + "/file/" + this.id + ".txt";
		var timestamp = Std.string(new Date().getTime());
		var data = timestamp + "," + cmd + "," + notes;
		js_node_Fs.appendFile(path,timestamp + "," + data + "\r\n",$bind(this,this.onSave));
	}
	,onSave: function(err) {
		if(err != null) haxe_Log.trace("save error",{ fileName : "Room.hx", lineNumber : 118, className : "speech.core.Room", methodName : "onSave", customParams : [err]});
	}
};
var speech_core_Session = function(socket) {
	this.id = speech_core_Session.getNextId();
	this.ws = socket;
	this.room = null;
	this.endpoint = null;
	this.pipeline = null;
	this.recorder = null;
	this.recordPath = null;
	this.clearCandidatesQueue();
};
speech_core_Session.__name__ = true;
speech_core_Session.getNextId = function() {
	speech_core_Session._idCounter++;
	return Std.string(speech_core_Session._idCounter);
};
speech_core_Session.prototype = {
	isPresenter: function() {
		return this.room.presenter != null && this.room.presenter == this;
	}
	,startStream: function(kurentoUrl,recordDir,sdpOffer) {
		var _g = this;
		this.clearCandidatesQueue();
		if(!this.isPresenter()) return;
		kurento.getSingleton(kurentoUrl).then(function(client) {
			return client.create("MediaPipeline");
		})["catch"](function(error) {
			haxe_Log.trace(error,{ fileName : "Session.hx", lineNumber : 68, className : "speech.core.Session", methodName : "startStream"});
			_g.ws.send(JSON.stringify({ id : "onStopStream", data : error}));
			return null;
		}).then(function(pipeline) {
			_g.pipeline = pipeline;
			var p1 = pipeline.create("WebRtcEndpoint");
			_g.recordPath = js_node_Path.join(recordDir,Std.string(new Date().getTime()) + ".webm");
			var p2 = pipeline.create("RecorderEndpoint",{ uri : _g.recordPath});
			return Promise.all([p1,p2]);
		}).then(function(endpoints) {
			_g.endpoint = endpoints[0];
			_g.recorder = endpoints[1];
			return _g.endpoint.connect(_g.recorder);
		}).then(function(dummy) {
			_g.recorder.record();
			_g.exchangeCandidates();
			var p11 = _g.endpoint.processOffer(sdpOffer);
			var p21 = _g.endpoint.gatherCandidates();
			return Promise.all([p11,p21]);
		}).then(function(results) {
			var sdpAnswer = results[0];
			_g.ws.send(JSON.stringify({ id : "acceptStream", data : sdpAnswer}));
			_g.room.broadcast(speech_core_Response.CAN_START_STREAM);
			return null;
		})["catch"](function(error1) {
			haxe_Log.trace(error1,{ fileName : "Session.hx", lineNumber : 110, className : "speech.core.Session", methodName : "startStream"});
			_g.stopStream();
			return null;
		});
	}
	,connectStream: function(sdpOffer) {
		var _g = this;
		if(this.room == null || this.room.presenter == null || this.room.presenter.pipeline == null) return;
		this.pipeline = this.room.presenter.pipeline;
		var sdpAnswer = null;
		this.pipeline.create("WebRtcEndpoint").then(function(endpoint) {
			_g.endpoint = endpoint;
			_g.exchangeCandidates();
			return endpoint.processOffer(sdpOffer);
		}).then(function(answer) {
			sdpAnswer = answer;
			return _g.room.presenter.endpoint.connect(_g.endpoint);
		}).then(function(dummy) {
			return _g.endpoint.gatherCandidates();
		}).then(function(dummy1) {
			_g.ws.send(JSON.stringify({ id : "startStream", data : sdpAnswer}));
			return null;
		})["catch"](function(error) {
			haxe_Log.trace(error,{ fileName : "Session.hx", lineNumber : 150, className : "speech.core.Session", methodName : "connectStream"});
			_g.stopStream();
		});
	}
	,stopStream: function() {
		if(this.isPresenter()) {
			this.room.broadcast(speech_core_Response.STOP_STREAM);
			if(this.recorder != null) {
				this.recorder.stop();
				this.recorder.release();
				this.recorder = null;
				haxe_Log.trace("stop recording",{ fileName : "Session.hx", lineNumber : 164, className : "speech.core.Session", methodName : "stopStream"});
			}
			this.pipeline.release();
		}
		this.pipeline = null;
		this.endpoint.release();
		this.endpoint = null;
		this.clearCandidatesQueue();
	}
	,addIceCandidate: function(ic) {
		ic = kurento.register.complexTypes.IceCandidate(ic);
		if(this.endpoint != null) this.endpoint.addIceCandidate(ic); else this._candidatesQueue.push(ic);
	}
	,exchangeCandidates: function() {
		var _g = this;
		while(this._candidatesQueue.length > 0) {
			var candidate = this._candidatesQueue.shift();
			this.endpoint.addIceCandidate(candidate);
		}
		this.endpoint.on("OnIceCandidate",function(ic) {
			var candidate1 = kurento.register.complexTypes.IceCandidate(ic.candidate);
			_g.ws.send(JSON.stringify({ id : "iceCandidate", candidate : candidate1}));
		});
	}
	,clearCandidatesQueue: function() {
		this._candidatesQueue = [];
	}
	,destroy: function() {
		if(this.id == null) return;
		this.id = null;
		if(this.ws != null) this.ws.close();
		this.ws = null;
		if(this.room != null) {
			if(this.isPresenter()) this.room.destroy(); else HxOverrides.remove(this.room.viewerList,this);
		}
		this.room = null;
		if(this.recorder != null && this.isPresenter()) {
			this.recorder.stop();
			this.recorder.release();
		}
		this.recorder = null;
		this.recordPath == null;
		if(this.pipeline != null && this.isPresenter()) this.pipeline.release();
		this.pipeline = null;
		if(this.endpoint != null) this.endpoint.release();
		this.endpoint = null;
		this._candidatesQueue = null;
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
speech_Main.MS_URI = "ws://localhost:8888/kurento";
speech_Main.MV_DIR = "file:///tmp";
speech_core_Session._idCounter = 0;
speech_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});

//# sourceMappingURL=app.js.map