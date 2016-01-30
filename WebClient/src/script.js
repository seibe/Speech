(function (console, $global) { "use strict";
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
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.htmlEscape = function(s,quotes) {
	s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	if(quotes) return s.split("\"").join("&quot;").split("'").join("&#039;"); else return s;
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
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
	,__class__: haxe_Timer
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,remove: function(key) {
		if(__map_reserved[key] != null) {
			key = "$" + key;
			if(this.rh == null || !this.rh.hasOwnProperty(key)) return false;
			delete(this.rh[key]);
			return true;
		} else {
			if(!this.h.hasOwnProperty(key)) return false;
			delete(this.h[key]);
			return true;
		}
	}
	,keys: function() {
		var _this = this.arrayKeys();
		return HxOverrides.iter(_this);
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,__class__: haxe_ds_StringMap
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
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
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
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var speech_State = { __ename__ : true, __constructs__ : ["SETUP","WATCH_BEFORE","WATCH"] };
speech_State.SETUP = ["SETUP",0];
speech_State.SETUP.toString = $estr;
speech_State.SETUP.__enum__ = speech_State;
speech_State.WATCH_BEFORE = ["WATCH_BEFORE",1];
speech_State.WATCH_BEFORE.toString = $estr;
speech_State.WATCH_BEFORE.__enum__ = speech_State;
speech_State.WATCH = ["WATCH",2];
speech_State.WATCH.toString = $estr;
speech_State.WATCH.__enum__ = speech_State;
var speech_Request = { __ename__ : true, __constructs__ : ["ICE_CANDIDATE","JOIN_VIEWER","LEAVE_VIEWER","CONNECT_STREAM","DISCONNECT_STREAM","COMMENT"] };
speech_Request.ICE_CANDIDATE = function(candidate) { var $x = ["ICE_CANDIDATE",0,candidate]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
speech_Request.JOIN_VIEWER = ["JOIN_VIEWER",1];
speech_Request.JOIN_VIEWER.toString = $estr;
speech_Request.JOIN_VIEWER.__enum__ = speech_Request;
speech_Request.LEAVE_VIEWER = ["LEAVE_VIEWER",2];
speech_Request.LEAVE_VIEWER.toString = $estr;
speech_Request.LEAVE_VIEWER.__enum__ = speech_Request;
speech_Request.CONNECT_STREAM = function(sdpOffer) { var $x = ["CONNECT_STREAM",3,sdpOffer]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
speech_Request.DISCONNECT_STREAM = ["DISCONNECT_STREAM",4];
speech_Request.DISCONNECT_STREAM.toString = $estr;
speech_Request.DISCONNECT_STREAM.__enum__ = speech_Request;
speech_Request.COMMENT = function(text,type,pageUrl) { var $x = ["COMMENT",5,text,type,pageUrl]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
var speech_Main = function() {
	this.WS_URL = "wss://seibe.jp:8081/speech";
	var _g = this;
	window.onload = function() {
		_g._ws = null;
		_g._webRtcPeer = null;
		_g._state = null;
		_g._timer = null;
		_g._numQuestion = 0;
		_g._title = null;
		_g._username = null;
		_g._dom = new speech_manager_DomManager();
		_g.setState(speech_State.SETUP);
	};
	window.onunload = function() {
		if(_g._ws != null) _g._ws.close();
	};
};
speech_Main.__name__ = true;
speech_Main.main = function() {
	new speech_Main();
};
speech_Main.prototype = {
	setState: function(nextState) {
		if(this._state == nextState) return;
		var _g = this._state;
		if(_g == null) {
		} else switch(_g[1]) {
		case 0:
			this._dom.getButton("submit","setup").removeEventListener("click",$bind(this,this.onClickButtonStart));
			this._username = this._dom.getInput("viewer","setup").value;
			this._dom.getOutput("error","setup").innerText = "";
			break;
		case 1:
			try {
				this._dom.getDialog("loading").close();
			} catch( e ) {
				if( js_Boot.__instanceof(e,Error) ) {
					haxe_Log.trace(e,{ fileName : "Main.hx", lineNumber : 103, className : "speech.Main", methodName : "setState"});
				} else throw(e);
			}
			break;
		case 2:
			if(this._webRtcPeer != null) {
				this.send(speech_Request.DISCONNECT_STREAM);
				this._webRtcPeer.dispose();
				this._webRtcPeer = null;
			}
			if(this._ws != null) {
				this.send(speech_Request.LEAVE_VIEWER);
				this._ws.close();
				this._ws = null;
			}
			this._dom.get("comment-send-normal","live").removeEventListener("click",$bind(this,this.sendComment));
			this._dom.get("comment-send-question","live").removeEventListener("click",$bind(this,this.sendComment));
			this._dom.get("action-comment","live").removeEventListener("click",$bind(this,this.onClickCommentTypeNormal));
			this._dom.get("action-question","live").removeEventListener("click",$bind(this,this.onClickCommentTypeQuestion));
			this._dom.get("action-setting","live").removeEventListener("click",$bind(this,this.onClickSetting));
			this._dom.getInput("comment","live").removeEventListener("keypress",$bind(this,this.onKeyPressComment));
			break;
		}
		switch(nextState[1]) {
		case 0:
			this._dom.changeScene("setup");
			this._dom.getButton("submit").addEventListener("click",$bind(this,this.onClickButtonStart));
			break;
		case 1:
			try {
				this._dom.getDialog("loading").showModal();
			} catch( e1 ) {
				if( js_Boot.__instanceof(e1,Error) ) {
					haxe_Log.trace(e1,{ fileName : "Main.hx", lineNumber : 146, className : "speech.Main", methodName : "setState"});
				} else throw(e1);
			}
			this._ws = new WebSocket(this.WS_URL);
			this._ws.addEventListener("open",$bind(this,this.onWsConnect));
			this._ws.addEventListener("close",$bind(this,this.onWsClose));
			this._ws.addEventListener("message",$bind(this,this.onWsMessage));
			this._ws.addEventListener("error",$bind(this,this.onWsError));
			this._numQuestion = 0;
			this._dom.get("comment-list","live").innerHTML = "";
			this._dom.get("question-list","live").innerHTML = "";
			this._dom.get("num-question","live").innerText = "0";
			this._dom.get("num-audience","live").innerText = "0";
			break;
		case 2:
			this._dom.changeScene("live");
			this._dom.get("comment-send-normal").addEventListener("click",$bind(this,this.sendComment));
			this._dom.get("comment-send-question").addEventListener("click",$bind(this,this.sendComment));
			this._dom.get("action-comment").addEventListener("click",$bind(this,this.onClickCommentTypeNormal));
			this._dom.get("action-question").addEventListener("click",$bind(this,this.onClickCommentTypeQuestion));
			this._dom.get("action-setting").addEventListener("click",$bind(this,this.onClickSetting));
			this._dom.getInput("comment").addEventListener("keypress",$bind(this,this.onKeyPressComment));
			break;
		}
		this._state = nextState;
	}
	,send: function(req) {
		var obj = { };
		switch(req[1]) {
		case 0:
			var candidate = req[2];
			obj.type = "iceCandidate";
			obj.data = candidate;
			break;
		case 1:
			obj.type = "joinViewer";
			obj.data = null;
			break;
		case 2:
			obj.type = "leavePresenter";
			obj.data = null;
			break;
		case 3:
			var offer = req[2];
			obj.type = "connectStream";
			obj.data = offer;
			break;
		case 4:
			obj.type = "disconnectStream";
			obj.data = null;
			break;
		case 5:
			var pageUrl = req[4];
			var type = req[3];
			var text = req[2];
			obj.type = "comment";
			obj.data = { type : type, text : text, pageUrl : pageUrl, name : this._username, point : null};
			break;
		}
		obj.timestamp = new Date().getTime();
		this._ws.send(JSON.stringify(obj));
	}
	,connectStream: function() {
		var _g = this;
		if(this._webRtcPeer != null) {
			this._webRtcPeer.dispose();
			this._webRtcPeer = null;
		}
		this._webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly({ remoteVideo : this._dom.getVideo(), onicecandidate : $bind(this,this.onIcecandidate)},function(err1) {
			if(err1 != null) {
				haxe_Log.trace("webrtcpeer error",{ fileName : "Main.hx", lineNumber : 240, className : "speech.Main", methodName : "connectStream", customParams : [err1]});
				_g._webRtcPeer = null;
			}
			_g._webRtcPeer.generateOffer(function(err2,offerSdp) {
				if(err2 != null) {
					haxe_Log.trace("webrtcpeer error",{ fileName : "Main.hx", lineNumber : 245, className : "speech.Main", methodName : "connectStream", customParams : [err2]});
					_g._webRtcPeer = null;
				}
				_g.send(speech_Request.CONNECT_STREAM(offerSdp));
			});
		});
	}
	,sendComment: function() {
		var text = this._dom.getInput("comment","live").value;
		var type = "normal";
		var url = this._dom.getSlide().src;
		if(text.length == 0 || text == this._prevComment) return;
		if(this._dom.getInput("comment-type-question","live").checked) {
			type = "question";
			this._dom.getInput("comment-type-normal","live").checked = true;
		}
		var regPlus = new EReg("(^\\++1?$)|(^plus$)","i");
		var regClap = new EReg("(^clap$)|(^拍手$)|(^88+$)","i");
		var regHatena = new EReg("(^\\?$)|(^hatena$)|(^はてな$)","i");
		var regWarai = new EReg("(^w+$)|(^warai$)|(^笑い?$)","i");
		if(regPlus.match(text)) type = "stamp_plus"; else if(regClap.match(text)) type = "stamp_clap"; else if(regHatena.match(text)) type = "stamp_hatena"; else if(regWarai.match(text)) type = "stamp_warai";
		this.send(speech_Request.COMMENT(text,type,url));
		this._prevComment = text;
		this._dom.getInput("comment","live").value = "";
	}
	,addComment: function(text,name) {
		this._dom.get("comment-list","live").insertAdjacentHTML("afterbegin","<li class=\"discuss-comment new\"><img class=\"discuss-comment-image\" src=\"img/avatar.png\"><div class=\"discuss-comment-body\"><strong>" + name + "</strong><p>" + text + "</p></div></li>");
		this._dom.query(".discuss-comment.new").addEventListener("animationend",function(e) {
			haxe_Log.trace("animation end",{ fileName : "Main.hx", lineNumber : 288, className : "speech.Main", methodName : "addComment"});
			if(e.animationName == "comment-move-in") {
				var elem = e.target;
				elem.classList.remove("new");
			}
		});
	}
	,addQuestion: function(text,name) {
		this._dom.get("question-list","live").insertAdjacentHTML("beforeend","<li class=\"discuss-comment\"><img class=\"discuss-comment-image\" src=\"img/avatar.png\"><div class=\"discuss-comment-body\"><strong>" + name + "</strong><p>" + text + "</p></div></li>");
		this._numQuestion++;
		this._dom.get("num-question","live").innerText = Std.string(this._numQuestion);
	}
	,addStamp: function(src,alt) {
		var _g1 = this;
		var _g = 0;
		while(_g < 3) {
			var i = [_g++];
			haxe_Timer.delay((function(i) {
				return function() {
					var left = i[0] * 5 + 40 + Math.floor(Math.random() * 28);
					_g1._dom.get("atmos","live").insertAdjacentHTML("afterbegin","<img class=\"live-atmos-stamp\" alt=\"" + alt + "\" src=\"" + src + "\" style=\"left: " + left + "%\" />");
					var stamp = window.document.getElementsByClassName("live-atmos-stamp").item(0);
					haxe_Timer.delay((function() {
						return function() {
							stamp.remove();
						};
					})(),4000);
				};
			})(i),500 * i[0]);
		}
	}
	,onWsConnect: function(e) {
		haxe_Log.trace("open ws",{ fileName : "Main.hx", lineNumber : 318, className : "speech.Main", methodName : "onWsConnect"});
		this.send(speech_Request.JOIN_VIEWER);
	}
	,onWsClose: function(e) {
		haxe_Log.trace("close ws",{ fileName : "Main.hx", lineNumber : 325, className : "speech.Main", methodName : "onWsClose"});
		this.setState(speech_State.SETUP);
	}
	,onWsMessage: function(e) {
		var mes = JSON.parse(e.data);
		var d = mes.data;
		haxe_Log.trace(mes.type,{ fileName : "Main.hx", lineNumber : 334, className : "speech.Main", methodName : "onWsMessage"});
		var _g = mes.type;
		switch(_g) {
		case "acceptStream":
			this._webRtcPeer.processAnswer(d,function(e1) {
				haxe_Log.trace(e1,{ fileName : "Main.hx", lineNumber : 341, className : "speech.Main", methodName : "onWsMessage"});
			});
			break;
		case "updateAudience":
			this._dom.get("num-audience","live").innerText = d;
			break;
		case "iceCandidate":
			this._webRtcPeer.addIceCandidate(d);
			break;
		case "onComment":
			var comment = d;
			var name;
			if(comment.name != null) name = StringTools.htmlEscape(comment.name); else name = "nanashi";
			var text = StringTools.htmlEscape(comment.text);
			haxe_Log.trace(comment.type,{ fileName : "Main.hx", lineNumber : 357, className : "speech.Main", methodName : "onWsMessage"});
			var _g1 = comment.type;
			switch(_g1) {
			case "normal":
				this.addComment(text,name);
				break;
			case "question":
				this.addComment(text,name);
				this.addQuestion(text,name);
				break;
			case "stamp_clap":
				this.addComment(text,name);
				this.addStamp("img/icon_clap.png","拍手");
				break;
			case "stamp_hatena":
				this.addComment(text,name);
				this.addStamp("img/icon_hatena.png","?");
				break;
			case "stamp_plus":
				this.addComment(text,name);
				this.addStamp("img/icon_plus.png","+1");
				break;
			case "stamp_warai":
				this.addComment(text,name);
				this.addStamp("img/icon_www.png","笑い");
				break;
			}
			break;
		case "onError":
			haxe_Log.trace("error message",{ fileName : "Main.hx", lineNumber : 391, className : "speech.Main", methodName : "onWsMessage", customParams : [d]});
			this._dom.getOutput("error","setup").innerText = StringTools.htmlEscape(d);
			break;
		case "finish":
			break;
		case "willStopStream":
			break;
		case "onStopStream":
			break;
		case "acceptAudience":
			this._dom.get("title","live").innerText = d.title;
			this._dom.getSlide().src = d.slideUrl;
			this.setState(speech_State.WATCH);
			break;
		case "canConnectStream":
			this.connectStream();
			break;
		case "onUpdateSlide":
			this._dom.getSlide().src = d;
			break;
		case "startPointer":
			break;
		case "updatePointer":
			break;
		case "stopPointer":
			break;
		default:
			haxe_Log.trace("unknown message",{ fileName : "Main.hx", lineNumber : 427, className : "speech.Main", methodName : "onWsMessage", customParams : [mes]});
		}
	}
	,onWsError: function(e) {
		haxe_Log.trace("ws error",{ fileName : "Main.hx", lineNumber : 433, className : "speech.Main", methodName : "onWsError", customParams : [e]});
	}
	,onClickButtonStart: function() {
		this._name = this._dom.getInput("viewer","setup").value;
		if(this._name.length == 0) {
			this._dom.getInput("viewer","setup").focus();
			this._dom.getOutput("error","setup").innerText = "名前を入力してください";
		} else this.setState(speech_State.WATCH_BEFORE);
	}
	,onClickCommentTypeNormal: function() {
		this._dom.getInput("comment-type-normal","live").checked = true;
		this._dom.getInput("comment","live").focus();
	}
	,onClickCommentTypeQuestion: function() {
		this._dom.getInput("comment-type-question","live").checked = true;
		this._dom.getInput("comment","live").focus();
	}
	,onClickSetting: function() {
	}
	,onKeyPressComment: function(e) {
		if(e.keyCode == 13) this.sendComment();
	}
	,onIcecandidate: function(candidate) {
		this.send(speech_Request.ICE_CANDIDATE(candidate));
	}
	,__class__: speech_Main
};
var speech_manager_DomManager = function() {
	this._idMap = new haxe_ds_StringMap();
	this.setElementList(window.document.body);
	this._sceneMap = new haxe_ds_StringMap();
	var v = this.getScene("setup");
	this._sceneMap.set("setup",v);
	v;
	var v1 = this.getScene("live");
	this._sceneMap.set("live",v1);
	v1;
	this.changeScene("setup");
};
speech_manager_DomManager.__name__ = true;
speech_manager_DomManager.prototype = {
	get: function(id,sceneId) {
		return this._get(id,sceneId);
	}
	,getButton: function(id,sceneId) {
		return this._get(id,sceneId,"button");
	}
	,getInput: function(id,sceneId) {
		return this._get(id,sceneId,"input");
	}
	,getOutput: function(id,sceneId) {
		return this._get(id,sceneId,"output");
	}
	,getSelect: function(id,sceneId) {
		return this._get(id,sceneId,"select");
	}
	,getDialog: function(id,sceneId) {
		return this._idMap.get("dialog-" + id);
	}
	,getScene: function(id) {
		return this._idMap.get("scene-" + id);
	}
	,getSlide: function() {
		return this._idMap.get("live-slide");
	}
	,getVideo: function() {
		return this._idMap.get("live-video");
	}
	,query: function(selectors) {
		return window.document.querySelector(selectors);
	}
	,changeScene: function(id,callback) {
		if(this._sceneMap.get(id) == null) return;
		this._nowScene = id;
		var $it0 = this._sceneMap.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			if(key == id) this._sceneMap.get(key).classList.remove("hide"); else this._sceneMap.get(key).classList.add("hide");
		}
		if(callback != null) callback();
	}
	,_getId: function(id,sceneId,prefix) {
		var array = [];
		if(prefix != null) array.push(prefix);
		array.push(sceneId == null?this._nowScene:sceneId);
		array.push(id);
		return array.join("-");
	}
	,_get: function(id,sceneId,prefix) {
		var key = this._getId(id,sceneId,prefix);
		return this._idMap.get(key);
	}
	,_remove: function(id,sceneId,prefix) {
		var _id = this._getId(id,sceneId,prefix);
		var elem = this._idMap.get(_id);
		elem.remove();
		this._idMap.remove(_id);
	}
	,setOptions: function(selectId,optionHtml) {
		var select = this.getSelect(selectId);
		select.innerHTML = optionHtml.join("");
	}
	,setElementList: function(elem) {
		if(elem.id != null && elem.id.length > 0) {
			this._idMap.set(elem.id,elem);
			elem;
		}
		var child = elem.firstElementChild;
		while(child != null) {
			this.setElementList(child);
			child = child.nextElementSibling;
		}
	}
	,__class__: speech_manager_DomManager
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var __map_reserved = {}
js_Boot.__toStr = {}.toString;
speech_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);

//# sourceMappingURL=script.js.map