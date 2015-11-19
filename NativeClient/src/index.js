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
var electron_Electron = function() { };
electron_Electron.__name__ = true;
electron_Electron.get_app = function() {
	return electron_Electron.require("app");
};
electron_Electron.get_autoUpdater = function() {
	return electron_Electron.require("auto-updater");
};
electron_Electron.get_contentTracing = function() {
	return electron_Electron.require("content-tracing");
};
electron_Electron.get_dialog = function() {
	return electron_Electron.require("dialog");
};
electron_Electron.get_globalShortcut = function() {
	return electron_Electron.require("global-shortcut");
};
electron_Electron.get_ipc = function() {
	return electron_Electron.require("ipc");
};
electron_Electron.get_powerMonitor = function() {
	return electron_Electron.require("power-monitor");
};
electron_Electron.get_protocol = function() {
	return electron_Electron.require("protocol");
};
electron_Electron.get_remote = function() {
	return electron_Electron.require("remote");
};
electron_Electron.get_remoteApp = function() {
	return electron_Electron.remoteRequire("app");
};
electron_Electron.get_remoteAutoUpdater = function() {
	return electron_Electron.remoteRequire("auto-updater");
};
electron_Electron.get_remoteContentTracing = function() {
	return electron_Electron.remoteRequire("content-tracing");
};
electron_Electron.get_remoteDialog = function() {
	return electron_Electron.remoteRequire("dialog");
};
electron_Electron.get_remoteGlobalShortcut = function() {
	return electron_Electron.remoteRequire("global-shortcut");
};
electron_Electron.get_remoteIpc = function() {
	return electron_Electron.remoteRequire("ipc");
};
electron_Electron.get_remotePowerMonitor = function() {
	return electron_Electron.remoteRequire("power-monitor");
};
electron_Electron.get_remoteProtocol = function() {
	return electron_Electron.remoteRequire("protocol");
};
electron_Electron.get_remoteClipboard = function() {
	return electron_Electron.remoteRequire("clipboard");
};
electron_Electron.get_remoteCrashReporter = function() {
	return electron_Electron.remoteRequire("crash-reporter");
};
electron_Electron.get_remoteScreen = function() {
	return electron_Electron.remoteRequire("screen");
};
electron_Electron.get_remoteShell = function() {
	return electron_Electron.remoteRequire("shell");
};
electron_Electron.get_webFrame = function() {
	return electron_Electron.require("web-frame");
};
electron_Electron.get_clipboard = function() {
	return electron_Electron.require("clipboard");
};
electron_Electron.get_crashReporter = function() {
	return electron_Electron.require("crash-reporter");
};
electron_Electron.get_screen = function() {
	return electron_Electron.require("screen");
};
electron_Electron.get_shell = function() {
	return electron_Electron.require("shell");
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
		optionHtml.push("<option value=\"\">None</option>");
		var _g = 0;
		while(_g < trackList.length) {
			var track = trackList[_g];
			++_g;
			optionHtml.push("<option value=\"" + track.id + "\">" + track.label + "</option>");
		}
		this.setOptions(id,optionHtml);
	}
	,initPlayer: function(src) {
		this.get("player-main","live").innerHTML = "";
		this.addMedia("<webview class=\"player-webview\" id=\"live-slideview\" src=\"" + src + "\" autosize=\"on\" disablewebsecurity></webview>",true);
		var v = window.document.getElementById("live-slideview");
		this._idMap.set("live-slideview",v);
		v;
		return this._idMap.get("live-slideview");
	}
	,addWebView: function(src) {
		this.addMedia("<webview class=\"player-webview\" src=\"" + src + "\" autosize=\"on\" disablewebsecurity></webview>");
	}
	,addVideo: function(name,src,posterSrc) {
		var id = this._getId(name,"live","video");
		if(this._idMap.get(id) != null) return this._idMap.get(id);
		this.addMedia("<video class=\"player-video\" id=\"" + id + "\" autoplay></video>");
		var video = window.document.getElementById(id);
		if(src != null) video.src = src;
		if(posterSrc != null) video.poster = posterSrc;
		{
			this._idMap.set(id,video);
			video;
		}
		return this._idMap.get(id);
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
	,addMedia: function(innerHTML,forceActive) {
		if(forceActive == null) forceActive = false;
		var player = this.get("player-main","live");
		var i;
		if(player.childElementCount == null) i = "null"; else i = "" + player.childElementCount;
		var list;
		var _this = window.document;
		list = _this.createElement("li");
		list.classList.add("player-main-item");
		list.innerHTML = "<input type=\"checkbox\" id=\"player-main-item-" + i + "\" /><div><button>×</button><label for=\"player-main-item-" + i + "\">-</label></div>";
		var div = list.getElementsByTagName("div")[0];
		div.insertAdjacentHTML("afterbegin",innerHTML);
		if(player.childElementCount == 0 || forceActive) {
			var others = window.document.getElementsByClassName("player-main-item");
			var _g = 0;
			while(_g < others.length) {
				var elem = others[_g];
				++_g;
				elem.classList.remove("active");
			}
			list.classList.add("active");
		}
		player.appendChild(list);
		return list;
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
	,getUserMedia: function(videoId,audioId,success,error) {
		var reqVideo = videoId != null && videoId.length > 0;
		var reqAudio = audioId != null && audioId.length > 0;
		if(reqVideo && reqAudio) window.navigator.webkitGetUserMedia({ video : { optional : [{ sourceId : videoId}]}, audio : { optional : [{ sourceId : audioId}]}},success,error); else if(reqVideo) window.navigator.webkitGetUserMedia({ video : { optional : [{ sourceId : videoId}]}},success,error); else if(reqAudio) window.navigator.webkitGetUserMedia({ video : false, audio : { optional : [{ sourceId : audioId}]}},success,error);
	}
	,getUserVideo: function(videoId,success,error) {
		window.navigator.webkitGetUserMedia({ video : { optional : [{ sourceId : videoId}]}, audio : true},success,error);
	}
};
var speech_renderer_State = { __ename__ : true, __constructs__ : ["SETUP","LIVE_STARTING","LIVE"] };
speech_renderer_State.SETUP = ["SETUP",0];
speech_renderer_State.SETUP.toString = $estr;
speech_renderer_State.SETUP.__enum__ = speech_renderer_State;
speech_renderer_State.LIVE_STARTING = ["LIVE_STARTING",1];
speech_renderer_State.LIVE_STARTING.toString = $estr;
speech_renderer_State.LIVE_STARTING.__enum__ = speech_renderer_State;
speech_renderer_State.LIVE = ["LIVE",2];
speech_renderer_State.LIVE.toString = $estr;
speech_renderer_State.LIVE.__enum__ = speech_renderer_State;
var speech_renderer_Request = { __ename__ : true, __constructs__ : ["JOIN_PRESENTER","LEAVE_PRESENTER","UPDATE_SLIDE","START_STREAM","STOP_STREAM","ICE_CANDIDATE"] };
speech_renderer_Request.JOIN_PRESENTER = function(option) { var $x = ["JOIN_PRESENTER",0,option]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
speech_renderer_Request.LEAVE_PRESENTER = ["LEAVE_PRESENTER",1];
speech_renderer_Request.LEAVE_PRESENTER.toString = $estr;
speech_renderer_Request.LEAVE_PRESENTER.__enum__ = speech_renderer_Request;
speech_renderer_Request.UPDATE_SLIDE = function(slideUrl) { var $x = ["UPDATE_SLIDE",2,slideUrl]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
speech_renderer_Request.START_STREAM = function(offer) { var $x = ["START_STREAM",3,offer]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
speech_renderer_Request.STOP_STREAM = ["STOP_STREAM",4];
speech_renderer_Request.STOP_STREAM.toString = $estr;
speech_renderer_Request.STOP_STREAM.__enum__ = speech_renderer_Request;
speech_renderer_Request.ICE_CANDIDATE = function(ice) { var $x = ["ICE_CANDIDATE",5,ice]; $x.__enum__ = speech_renderer_Request; $x.toString = $estr; return $x; };
var speech_renderer_Index = function() {
	this.WS_URL = "ws://localhost:8081/speech";
	var _g = this;
	window.onload = function() {
		_g._state = null;
		_g._prevUrl = "";
		_g._title = null;
		_g._description = null;
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
		var temp = new haxe_ds_StringMap();
		var _g1 = this._state;
		if(_g1 == null) {
		} else switch(_g1[1]) {
		case 0:
			this._title = this._dom.getInput("title","setup").value;
			this._description = this._dom.getInput("description","setup").value;
			this._slideUrl = this._dom.getInput("slide-url","setup").value;
			this._videoSourceId = this._dom.getSelect("video","setup").value;
			this._dom.getButton("submit").addEventListener("click",$bind(this,this.onClickButtonStart));
			break;
		case 1:
			this._dom.getDialog("loading").close();
			break;
		case 2:
			this._dom.get("player-main","live").innerHTML = "";
			if(this._webRtcPeer != null) {
				this.send(speech_renderer_Request.STOP_STREAM);
				this._webRtcPeer.dispose();
				this._webRtcPeer = null;
			}
			this.send(speech_renderer_Request.LEAVE_PRESENTER);
			this._ws.close();
			this._ws = null;
			window.removeEventListener("resize",$bind(this,this.onResize));
			this._slideview.removeEventListener("keydown",$bind(this,this.onChangeSlide));
			this._slideview.removeEventListener("wheel",$bind(this,this.onChangeSlide));
			this._slideview.removeEventListener("mouseup",$bind(this,this.onChangeSlide));
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
						haxe_Log.trace(track,{ fileName : "Index.hx", lineNumber : 147, className : "speech.renderer.Index", methodName : "setState"});
					}
				}
				_g._dom.setMediaSource("video",videoList);
				_g._dom.setMediaSource("audio",audioList);
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
			break;
		case 2:
			this._dom.changeScene("live");
			window.addEventListener("resize",$bind(this,this.onResize));
			this.onResize();
			this._slideview.addEventListener("keydown",$bind(this,this.onChangeSlide));
			this._slideview.addEventListener("wheel",$bind(this,this.onChangeSlide));
			this._slideview.addEventListener("mouseup",$bind(this,this.onChangeSlide));
			this._dom.getButton("finish").addEventListener("click",$bind(this,this.onClickButtonFinish));
			break;
		}
		this._state = nextState;
	}
	,onChangeSlide: function() {
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
	,onResize: function() {
		var playerHeight = this._dom.get("player-main","live").offsetHeight;
		this._slideview.style.height = (playerHeight == null?"null":"" + playerHeight) + "px";
	}
	,onClickButtonStart: function() {
		var slideUrl = this._dom.getInput("slide-url").value;
		var title = this._dom.getInput("title").value;
		var urlChecker = new EReg("https?://.+","");
		if(slideUrl.length == 0 || title.length == 0 || !urlChecker.match(slideUrl)) this._dom.getInput("slide-url").focus(); else this.setState(speech_renderer_State.LIVE_STARTING);
	}
	,onClickButtonFinish: function() {
		this.setState(speech_renderer_State.SETUP);
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
			var offerSdp = req[2];
			obj.type = "startStream";
			obj.data = offerSdp;
			break;
		case 4:
			obj.type = "stopStream";
			break;
		case 5:
			var candidate = req[2];
			obj.type = "iceCandidate";
			obj.data = candidate;
			break;
		}
		obj.timestamp = new Date().getTime();
		obj.requestId = this._reqCount++;
		haxe_Log.trace("send",{ fileName : "Index.hx", lineNumber : 255, className : "speech.renderer.Index", methodName : "send", customParams : [obj.type]});
		this._ws.send(JSON.stringify(obj));
		return this._reqCount;
	}
	,onWsConnect: function(e) {
		var _g = this;
		this.send(speech_renderer_Request.JOIN_PRESENTER({ title : this._title, description : this._description, slideUrl : this._slideUrl}));
		if(this._videoSourceId != null && this._videoSourceId.length > 0) {
			haxe_Log.trace("webcam: " + this._videoSourceId,{ fileName : "Index.hx", lineNumber : 273, className : "speech.renderer.Index", methodName : "onWsConnect"});
			var videoElem = this._dom.addVideo("webcam");
			this._media.getUserVideo(this._videoSourceId,function(lms) {
				_g._webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly({ localVideo : videoElem, videoStream : lms, onicecandidate : $bind(_g,_g.onIcecandidate)},function(err) {
					if(err != null) _g.setState(speech_renderer_State.SETUP);
					_g._webRtcPeer.generateOffer($bind(_g,_g.onOffer));
				});
			},function(err1) {
				haxe_Log.trace("error getUserVideo",{ fileName : "Index.hx", lineNumber : 286, className : "speech.renderer.Index", methodName : "onWsConnect"});
			});
		}
	}
	,onWsClose: function(e) {
		this.setState(speech_renderer_State.SETUP);
	}
	,onWsMessage: function(e) {
		var resp = JSON.parse(e.data);
		haxe_Log.trace(resp.type,{ fileName : "Index.hx", lineNumber : 299, className : "speech.renderer.Index", methodName : "onWsMessage"});
		var _g = resp.type;
		switch(_g) {
		case "accept":
			this._dom.getInput("url","live").value = resp.data;
			this.setState(speech_renderer_State.LIVE);
			break;
		case "acceptStream":
			this._webRtcPeer.processAnswer(resp.data);
			break;
		case "onStopStream":
			this._webRtcPeer.dispose();
			this._webRtcPeer = null;
			break;
		case "iceCandidate":
			this._webRtcPeer.addIceCandidate(resp.data);
			break;
		default:
			haxe_Log.trace("unknown ws",{ fileName : "Index.hx", lineNumber : 318, className : "speech.renderer.Index", methodName : "onWsMessage", customParams : [resp]});
		}
	}
	,onWsError: function(error) {
		haxe_Log.trace("error",{ fileName : "Index.hx", lineNumber : 324, className : "speech.renderer.Index", methodName : "onWsError", customParams : [error]});
		this.setState(speech_renderer_State.SETUP);
	}
	,onOffer: function(error,offerSdp) {
		this.send(speech_renderer_Request.START_STREAM(offerSdp));
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
electron_Electron.require = require;
electron_Electron.remoteRequire = require("remote").require;
speech_renderer_Index.main();
})(typeof console != "undefined" ? console : {log:function(){}});

//# sourceMappingURL=index.js.map