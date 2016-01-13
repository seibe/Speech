(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
var DateTools = function() { };
DateTools.__name__ = true;
DateTools.parse = function(t) {
	var s = t / 1000;
	var m = s / 60;
	var h = m / 60;
	return { ms : t % 1000, seconds : s % 60 | 0, minutes : m % 60 | 0, hours : h % 24 | 0, days : h / 24 | 0};
};
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
	,getSelect: function(id,sceneId) {
		return this._get(id,sceneId,"select");
	}
	,getDialog: function(id,sceneId) {
		return this._idMap.get("dialog-" + id);
	}
	,getScene: function(id) {
		return this._idMap.get("scene-" + id);
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
	,setMediaSource: function(id,trackList) {
		var optionHtml = [];
		optionHtml.push("<option value=\"\">なし</option>");
		var _g = 0;
		while(_g < trackList.length) {
			var track = trackList[_g];
			++_g;
			optionHtml.push("<option value=\"" + track.id + "\">" + track.label + "</option>");
		}
		this.setOptions(id,optionHtml);
	}
	,initPlayer: function(src) {
		var webview = this.get("slide","live");
		webview.src = src;
		webview.classList.add("show");
		return webview;
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
};
var speech_manager_MediaManager = function() {
	this._trackList = [];
};
speech_manager_MediaManager.__name__ = true;
speech_manager_MediaManager.prototype = {
	getTrackList: function(callback) {
		var _g = this;
		MediaStreamTrack.getSources(function(data) {
			_g._trackList = data.slice();
			callback(data);
		});
	}
	,getUserVideo: function(videoId,success,error) {
		window.navigator.webkitGetUserMedia({ video : { optional : [{ sourceId : videoId}]}, audio : true},success,error);
	}
};
var speech_renderer_State = { __ename__ : true, __constructs__ : ["SETUP","LIVE_BEFORE","LIVE","LIVE_AFTER"] };
speech_renderer_State.SETUP = ["SETUP",0];
speech_renderer_State.SETUP.toString = $estr;
speech_renderer_State.SETUP.__enum__ = speech_renderer_State;
speech_renderer_State.LIVE_BEFORE = ["LIVE_BEFORE",1];
speech_renderer_State.LIVE_BEFORE.toString = $estr;
speech_renderer_State.LIVE_BEFORE.__enum__ = speech_renderer_State;
speech_renderer_State.LIVE = ["LIVE",2];
speech_renderer_State.LIVE.toString = $estr;
speech_renderer_State.LIVE.__enum__ = speech_renderer_State;
speech_renderer_State.LIVE_AFTER = ["LIVE_AFTER",3];
speech_renderer_State.LIVE_AFTER.toString = $estr;
speech_renderer_State.LIVE_AFTER.__enum__ = speech_renderer_State;
var speech_renderer_Request = { __ename__ : true, __constructs__ : ["JOIN_PRESENTER","LEAVE_PRESENTER","UPDATE_SLIDE","START_STREAM","STOP_STREAM","MAKE_LOG","ICE_CANDIDATE"] };
speech_renderer_Request.JOIN_PRESENTER = function(option) { var $x = ["JOIN_PRESENTER",0,option]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
speech_renderer_Request.LEAVE_PRESENTER = ["LEAVE_PRESENTER",1];
speech_renderer_Request.LEAVE_PRESENTER.toString = $estr;
speech_renderer_Request.LEAVE_PRESENTER.__enum__ = speech_renderer_Request;
speech_renderer_Request.UPDATE_SLIDE = function(slideUrl) { var $x = ["UPDATE_SLIDE",2,slideUrl]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
speech_renderer_Request.START_STREAM = function(offer,target) { var $x = ["START_STREAM",3,offer,target]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
speech_renderer_Request.STOP_STREAM = ["STOP_STREAM",4];
speech_renderer_Request.STOP_STREAM.toString = $estr;
speech_renderer_Request.STOP_STREAM.__enum__ = speech_renderer_Request;
speech_renderer_Request.MAKE_LOG = ["MAKE_LOG",5];
speech_renderer_Request.MAKE_LOG.toString = $estr;
speech_renderer_Request.MAKE_LOG.__enum__ = speech_renderer_Request;
speech_renderer_Request.ICE_CANDIDATE = function(ice) { var $x = ["ICE_CANDIDATE",6,ice]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
var speech_renderer_Index = function() {
	this.WS_URL = "wss://seibe.jp:8081/speech";
	var _g = this;
	window.onload = function() {
		_g._state = null;
		_g._timer = null;
		_g._beginTime = -1;
		_g._prevUrl = "";
		_g._numQuestion = 0;
		_g._title = null;
		_g._username = null;
		_g._slideUrl = null;
		_g._videoSourceId = null;
		_g._reqCount = 0;
		_g._slideview = null;
		_g._dom = new speech_manager_DomManager();
		_g._media = new speech_manager_MediaManager();
		_g.setState(speech_renderer_State.SETUP);
	};
	window.onunload = function() {
		if(_g._ws != null) _g._ws.close();
	};
};
speech_renderer_Index.__name__ = true;
speech_renderer_Index.main = function() {
	new speech_renderer_Index();
};
speech_renderer_Index.prototype = {
	setState: function(nextState) {
		var _g = this;
		if(this._state == nextState) return;
		var _g1 = this._state;
		if(_g1 == null) {
		} else switch(_g1[1]) {
		case 0:
			this._title = this._dom.getInput("title","setup").value;
			this._username = this._dom.getInput("presenter","setup").value;
			this._slideUrl = this._dom.getInput("slide-url","setup").value;
			this._videoSourceId = this._dom.getSelect("video","setup").value;
			this._dom.getButton("submit").removeEventListener("click",$bind(this,this.onClickButtonStart));
			break;
		case 1:
			this._dom.getDialog("loading").close();
			break;
		case 2:
			if(this._webRtcPeer != null) {
				this.send(speech_renderer_Request.STOP_STREAM);
				this._webRtcPeer.dispose();
				this._webRtcPeer = null;
			}
			this.send(speech_renderer_Request.LEAVE_PRESENTER);
			if(this._timer != null) this._timer.stop();
			this._timer = null;
			window.removeEventListener("resize",$bind(this,this.onResize));
			window.removeEventListener("keydown",$bind(this,this.onKeyDown));
			this._slideview.removeEventListener("keydown",$bind(this,this.onChangeSlide));
			this._slideview.removeEventListener("wheel",$bind(this,this.onChangeSlide));
			this._slideview.removeEventListener("mouseup",$bind(this,this.onChangeSlide));
			this._slideview.removeEventListener("focus",$bind(this,this.onFocusSlide));
			this._slideview.removeEventListener("blur",$bind(this,this.onBlurSlide));
			if(nextState == speech_renderer_State.SETUP) {
				this._ws.close();
				this._ws = null;
			}
			break;
		case 3:
			if(this._ws != null) {
				this._ws.close();
				this._ws = null;
			}
			break;
		}
		switch(nextState[1]) {
		case 0:
			this._dom.changeScene("setup");
			var videoList = [];
			var audioList = [];
			this._media.getTrackList(function(data) {
				var _g2 = 0;
				while(_g2 < data.length) {
					var track = data[_g2];
					++_g2;
					var _g11 = track.kind;
					switch(_g11) {
					case "video":
						videoList.push(track);
						break;
					case "audio":
						audioList.push(track);
						break;
					default:
						haxe_Log.trace(track,{ fileName : "Index.hx", lineNumber : 171, className : "speech.renderer.Index", methodName : "setState"});
					}
				}
				_g._dom.setMediaSource("video",videoList);
			});
			this._dom.getButton("submit").addEventListener("click",$bind(this,this.onClickButtonStart));
			break;
		case 1:
			this._dom.getDialog("loading").showModal();
			this._ws = new WebSocket(this.WS_URL);
			this._ws.addEventListener("open",$bind(this,this.onWsConnect));
			this._ws.addEventListener("close",$bind(this,this.onWsClose));
			this._ws.addEventListener("message",$bind(this,this.onWsMessage));
			this._ws.addEventListener("error",$bind(this,this.onWsError));
			this._slideview = this._dom.initPlayer(this._slideUrl);
			this._prevUrl = this._slideUrl;
			this._numQuestion = 0;
			this._dom.get("comment-list","live").innerHTML = "";
			this._dom.get("question-list","live").innerHTML = "";
			this._dom.get("num-question","live").innerText = "0";
			this._dom.get("num-audience","live").innerText = "0";
			break;
		case 2:
			this._beginTime = new Date().getTime();
			if(this._timer != null) this._timer.stop();
			this._timer = new haxe_Timer(1000);
			this._timer.run = $bind(this,this.onUpdate);
			this._dom.changeScene("live");
			this._slideview.focus();
			window.addEventListener("resize",$bind(this,this.onResize));
			this.onResize();
			this._slideview.addEventListener("keydown",$bind(this,this.onChangeSlide));
			this._slideview.addEventListener("wheel",$bind(this,this.onChangeSlide));
			this._slideview.addEventListener("mouseup",$bind(this,this.onChangeSlide));
			this._slideview.addEventListener("focus",$bind(this,this.onFocusSlide));
			this._slideview.addEventListener("blur",$bind(this,this.onBlurSlide));
			this._dom.getButton("finish").addEventListener("click",$bind(this,this.onClickButtonFinish));
			break;
		case 3:
			break;
		}
		this._state = nextState;
	}
	,onChangeSlide: function(e) {
		var _g = this;
		if(this._state != speech_renderer_State.LIVE) return;
		haxe_Timer.delay(function() {
			var url = _g._slideview.getUrl();
			if(_g._prevUrl != url) {
				_g.send(speech_renderer_Request.UPDATE_SLIDE(url));
				_g._prevUrl = url;
			}
		},250);
	}
	,onFocusSlide: function() {
		window.removeEventListener("keydown",$bind(this,this.onKeyDown));
	}
	,onBlurSlide: function() {
		window.addEventListener("keydown",$bind(this,this.onKeyDown));
	}
	,onResize: function() {
		var playerHeight = window.innerHeight - 272;
		this._slideview.style.height = (playerHeight == null?"null":"" + playerHeight) + "px";
	}
	,onKeyDown: function() {
		this._slideview.focus();
	}
	,onUpdate: function() {
		var elapsedTime = DateTools.parse(new Date().getTime() - this._beginTime);
		var min = elapsedTime.hours * 60 + elapsedTime.minutes;
		var sec = elapsedTime.seconds;
		this._dom.get("elapsed-time","live").innerText = (min < 10?"0" + min:"" + min) + ":" + (sec < 10?"0" + sec:"" + sec);
	}
	,onClickButtonStart: function() {
		var slideUrl = this._dom.getInput("slide-url").value;
		var title = this._dom.getInput("title").value;
		var urlChecker = new EReg("https?://.+","");
		if(slideUrl.length == 0 || title.length == 0 || !urlChecker.match(slideUrl)) this._dom.getInput("slide-url").focus(); else this.setState(speech_renderer_State.LIVE_BEFORE);
	}
	,onClickButtonFinish: function() {
		this.send(speech_renderer_Request.MAKE_LOG);
	}
	,send: function(req) {
		var obj = { };
		switch(req[1]) {
		case 0:
			var option = req[2];
			obj.type = "joinPresenter";
			obj.data = option;
			break;
		case 1:
			obj.type = "leavePresenter";
			break;
		case 2:
			var slideUrl = req[2];
			obj.type = "updateSlide";
			obj.data = slideUrl;
			break;
		case 3:
			var streamTarget = req[3];
			var offerSdp = req[2];
			obj.type = "startStream";
			obj.data = { offer : offerSdp, target : streamTarget};
			break;
		case 4:
			obj.type = "stopStream";
			break;
		case 5:
			obj.type = "requestLog";
			break;
		case 6:
			var candidate = req[2];
			obj.type = "iceCandidate";
			obj.data = candidate;
			break;
		}
		obj.timestamp = new Date().getTime();
		obj.requestId = this._reqCount++;
		haxe_Log.trace("send",{ fileName : "Index.hx", lineNumber : 326, className : "speech.renderer.Index", methodName : "send", customParams : [obj.type]});
		this._ws.send(JSON.stringify(obj));
		return this._reqCount;
	}
	,addComment: function(text,name) {
		this._dom.get("comment-list","live").insertAdjacentHTML("afterbegin","<li class=\"discuss-comment new\"><img class=\"discuss-comment-image\" src=\"img/avatar.png\"><div class=\"discuss-comment-body\"><strong>" + name + "</strong><p>" + text + "</p></div></li>");
		this._dom.query(".discuss-comment.new").addEventListener("animationend",function(e) {
			haxe_Log.trace("animation end",{ fileName : "Index.hx", lineNumber : 336, className : "speech.renderer.Index", methodName : "addComment"});
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
		var _g = this;
		this.send(speech_renderer_Request.JOIN_PRESENTER({ title : this._title, slideUrl : this._slideUrl, name : this._username}));
		if(this._videoSourceId != null && this._videoSourceId.length > 0) {
			var videoElem = this._dom.get("video","live");
			this._media.getUserVideo(this._videoSourceId,function(lms) {
				_g._webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly({ localVideo : videoElem, videoStream : lms, onicecandidate : $bind(_g,_g.onIcecandidate)},function(err) {
					if(err != null) _g.setState(speech_renderer_State.SETUP);
					_g._webRtcPeer.generateOffer($bind(_g,_g.onOffer));
				});
			},function(err1) {
				haxe_Log.trace("error getUserVideo",{ fileName : "Index.hx", lineNumber : 389, className : "speech.renderer.Index", methodName : "onWsConnect"});
			});
		}
	}
	,onWsClose: function(e) {
		this.setState(speech_renderer_State.SETUP);
	}
	,onWsMessage: function(e) {
		var resp = JSON.parse(e.data);
		var type = resp.type;
		var d = resp.data;
		switch(type) {
		case "acceptStream":
			var sdpAnswer = d;
			this._webRtcPeer.processAnswer(sdpAnswer);
			break;
		case "updateAudience":
			var numAudience = d;
			this._dom.get("num-audience","live").innerText = "" + numAudience;
			break;
		case "iceCandidate":
			this._webRtcPeer.addIceCandidate(d);
			break;
		case "onComment":
			var comment = d;
			var name;
			if(comment.name != null) name = StringTools.htmlEscape(comment.name); else name = "nanashi";
			var text = StringTools.htmlEscape(comment.text);
			var _g = comment.type;
			switch(_g) {
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
			haxe_Log.trace("server error",{ fileName : "Index.hx", lineNumber : 458, className : "speech.renderer.Index", methodName : "onWsMessage", customParams : [d]});
			break;
		case "finish":
			this.setState(speech_renderer_State.SETUP);
			break;
		case "willStopStream":
			break;
		case "onStopStream":
			if(this._webRtcPeer != null) {
				this._webRtcPeer.dispose();
				this._webRtcPeer = null;
			}
			break;
		case "acceptPresenter":
			this._presentationShortId = d;
			this.setState(speech_renderer_State.LIVE);
			break;
		case "onCreateLog":
			haxe_Log.trace("log URL",{ fileName : "Index.hx", lineNumber : 481, className : "speech.renderer.Index", methodName : "onWsMessage", customParams : [d]});
			this.setState(speech_renderer_State.LIVE_AFTER);
			break;
		default:
			haxe_Log.trace("unknown ws",{ fileName : "Index.hx", lineNumber : 485, className : "speech.renderer.Index", methodName : "onWsMessage", customParams : [resp]});
		}
	}
	,onWsError: function(error) {
		haxe_Log.trace("error",{ fileName : "Index.hx", lineNumber : 491, className : "speech.renderer.Index", methodName : "onWsError", customParams : [error]});
		this.setState(speech_renderer_State.SETUP);
	}
	,onOffer: function(error,offerSdp) {
		this.send(speech_renderer_Request.START_STREAM(offerSdp,"webcam"));
	}
	,onIcecandidate: function(candidate) {
		this.send(speech_renderer_Request.ICE_CANDIDATE(candidate));
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
var __map_reserved = {}
speech_renderer_Index.main();
})(typeof console != "undefined" ? console : {log:function(){}});
