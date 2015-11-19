(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
Math.__name__ = true;
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.htmlEscape = function(s,quotes) {
	s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	if(quotes) return s.split("\"").join("&quot;").split("'").join("&#039;"); else return s;
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
var speech_State = { __ename__ : true, __constructs__ : ["STOP","WATCH_STARTING","WATCH","WATCH_WITH_VIDEO_STARTING","WATCH_WITH_VIDEO"] };
speech_State.STOP = ["STOP",0];
speech_State.STOP.toString = $estr;
speech_State.STOP.__enum__ = speech_State;
speech_State.WATCH_STARTING = ["WATCH_STARTING",1];
speech_State.WATCH_STARTING.toString = $estr;
speech_State.WATCH_STARTING.__enum__ = speech_State;
speech_State.WATCH = function(title,desc,url) { var $x = ["WATCH",2,title,desc,url]; $x.__enum__ = speech_State; $x.toString = $estr; return $x; };
speech_State.WATCH_WITH_VIDEO_STARTING = ["WATCH_WITH_VIDEO_STARTING",3];
speech_State.WATCH_WITH_VIDEO_STARTING.toString = $estr;
speech_State.WATCH_WITH_VIDEO_STARTING.__enum__ = speech_State;
speech_State.WATCH_WITH_VIDEO = function(answer) { var $x = ["WATCH_WITH_VIDEO",4,answer]; $x.__enum__ = speech_State; $x.toString = $estr; return $x; };
var speech_Request = { __ename__ : true, __constructs__ : ["JOIN_VIEWER","REQUEST_STREAM","ICE_CANDIDATE"] };
speech_Request.JOIN_VIEWER = ["JOIN_VIEWER",0];
speech_Request.JOIN_VIEWER.toString = $estr;
speech_Request.JOIN_VIEWER.__enum__ = speech_Request;
speech_Request.REQUEST_STREAM = function(sdpOffer) { var $x = ["REQUEST_STREAM",1,sdpOffer]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
speech_Request.ICE_CANDIDATE = function(candidate) { var $x = ["ICE_CANDIDATE",2,candidate]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
var speech_Main = function() {
	this.WS_URL = "ws://localhost:8081/speech";
	window.onload = $bind(this,this.init);
};
speech_Main.__name__ = true;
speech_Main.main = function() {
	new speech_Main();
};
speech_Main.prototype = {
	init: function() {
		this.initDomElements();
		this.setState(speech_State.WATCH_STARTING);
	}
	,initDomElements: function() {
		this._slide = window.document.getElementById("slide");
		this._video = window.document.getElementById("video");
		this._title = window.document.getElementById("slide-title");
		this._description = window.document.getElementById("slide-desc");
	}
	,setState: function(nextState) {
		var _g = this;
		if(this._state == nextState) return;
		haxe_Log.trace("state",{ fileName : "Main.hx", lineNumber : 135, className : "speech.Main", methodName : "setState", customParams : [nextState]});
		{
			var _g1 = this._state;
			if(_g1 == null) {
			} else switch(_g1[1]) {
			case 0:
				break;
			case 1:
				break;
			case 2:
				var url = _g1[4];
				var desc = _g1[3];
				var title = _g1[2];
				break;
			case 3:
				break;
			case 4:
				var answer = _g1[2];
				this._video.classList.remove("show");
				break;
			}
		}
		switch(nextState[1]) {
		case 0:
			if(this._ws != null) this._ws.close();
			this._ws = null;
			this._slide.classList.remove("show");
			break;
		case 1:
			this._ws = new WebSocket(this.WS_URL);
			this._ws.addEventListener("open",$bind(this,this.onWsConnect));
			this._ws.addEventListener("close",$bind(this,this.onWsClose));
			this._ws.addEventListener("message",$bind(this,this.onWsMessage));
			this._ws.addEventListener("error",$bind(this,this.onWsError));
			break;
		case 2:
			var url1 = nextState[4];
			var desc1 = nextState[3];
			var title1 = nextState[2];
			haxe_Log.trace(title1,{ fileName : "Main.hx", lineNumber : 182, className : "speech.Main", methodName : "setState", customParams : [desc1,url1]});
			this._title.innerText = StringTools.htmlEscape(title1);
			this._slide.src = StringTools.htmlEscape(url1);
			this._description.innerText = StringTools.htmlEscape(desc1);
			this._slide.classList.add("show");
			break;
		case 3:
			this._webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly({ remoteVideo : this._video, onicecandidate : $bind(this,this.onIcecandidate)},function(err) {
				if(err != null) _g.setState(speech_State.STOP);
				_g._webRtcPeer.generateOffer(function(error,offerSdp) {
					if(error != null) _g.setState(speech_State.STOP);
					_g.send(speech_Request.REQUEST_STREAM(offerSdp));
				});
			});
			break;
		case 4:
			var answer1 = nextState[2];
			this._webRtcPeer.processAnswer(answer1);
			this._video.classList.add("show");
			break;
		}
		this._state = nextState;
	}
	,send: function(req) {
		var obj = { };
		switch(req[1]) {
		case 0:
			obj.type = "joinViewer";
			obj.data = { };
			break;
		case 1:
			var offer = req[2];
			obj.type = "requestStream";
			obj.data = offer;
			break;
		case 2:
			var candidate = req[2];
			obj.type = "iceCandidate";
			obj.data = candidate;
			break;
		}
		obj.timestamp = new Date().getTime();
		this._ws.send(JSON.stringify(obj));
	}
	,onWsConnect: function(e) {
		haxe_Log.trace("open ws",{ fileName : "Main.hx", lineNumber : 239, className : "speech.Main", methodName : "onWsConnect"});
		this.send(speech_Request.JOIN_VIEWER);
	}
	,onWsClose: function(e) {
		haxe_Log.trace("close ws",{ fileName : "Main.hx", lineNumber : 246, className : "speech.Main", methodName : "onWsClose"});
		this.setState(speech_State.STOP);
	}
	,onWsMessage: function(e) {
		var mes = JSON.parse(e.data);
		var d = mes.data;
		haxe_Log.trace(mes.type,{ fileName : "Main.hx", lineNumber : 255, className : "speech.Main", methodName : "onWsMessage"});
		var _g = mes.type;
		switch(_g) {
		case "onUpdateSlide":
			this._slide.src = d;
			break;
		case "onComment":
			break;
		case "canStartStream":
			this.setState(speech_State.WATCH_WITH_VIDEO_STARTING);
			break;
		case "onStopStream":
			break;
		case "accept":
			this.setState(speech_State.WATCH(d.title,d.description,d.slideUrl));
			break;
		case "startStream":
			this.setState(speech_State.WATCH_WITH_VIDEO(d));
			break;
		default:
			haxe_Log.trace("unknown message",{ fileName : "Main.hx", lineNumber : 308, className : "speech.Main", methodName : "onWsMessage", customParams : [mes]});
		}
	}
	,onWsError: function(e) {
	}
	,onIcecandidate: function(candidate) {
		this.send(speech_Request.ICE_CANDIDATE(candidate));
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
speech_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});

//# sourceMappingURL=script.js.map