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
var speech_State = { __ename__ : true, __constructs__ : ["STOP","WATCH_STARTING","WATCH","WATCH_WITH_VIDEO_STARTING","WATCH_WITH_VIDEO","DELIVER_SETUP","DELIVER_STARTING","DELIVER","DELIVER_WITH_VIDEO_STARTING","DELIVER_WITH_VIDEO"] };
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
speech_State.DELIVER_SETUP = ["DELIVER_SETUP",5];
speech_State.DELIVER_SETUP.toString = $estr;
speech_State.DELIVER_SETUP.__enum__ = speech_State;
speech_State.DELIVER_STARTING = function(slideUrl,title,description) { var $x = ["DELIVER_STARTING",6,slideUrl,title,description]; $x.__enum__ = speech_State; $x.toString = $estr; return $x; };
speech_State.DELIVER = ["DELIVER",7];
speech_State.DELIVER.toString = $estr;
speech_State.DELIVER.__enum__ = speech_State;
speech_State.DELIVER_WITH_VIDEO_STARTING = function(slideUrl,videoId,title,description) { var $x = ["DELIVER_WITH_VIDEO_STARTING",8,slideUrl,videoId,title,description]; $x.__enum__ = speech_State; $x.toString = $estr; return $x; };
speech_State.DELIVER_WITH_VIDEO = function(answer) { var $x = ["DELIVER_WITH_VIDEO",9,answer]; $x.__enum__ = speech_State; $x.toString = $estr; return $x; };
var speech_Request = { __ename__ : true, __constructs__ : ["JOIN_VIEWER","REQUEST_STREAM","JOIN_PRESENTER","BEGIN_STREAM_PRESENTER","UPDATE_PAGE","COMMENT","ICE_CANDIDATE"] };
speech_Request.JOIN_VIEWER = ["JOIN_VIEWER",0];
speech_Request.JOIN_VIEWER.toString = $estr;
speech_Request.JOIN_VIEWER.__enum__ = speech_Request;
speech_Request.REQUEST_STREAM = function(sdpOffer) { var $x = ["REQUEST_STREAM",1,sdpOffer]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
speech_Request.JOIN_PRESENTER = function(params) { var $x = ["JOIN_PRESENTER",2,params]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
speech_Request.BEGIN_STREAM_PRESENTER = function(sdpOffer) { var $x = ["BEGIN_STREAM_PRESENTER",3,sdpOffer]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
speech_Request.UPDATE_PAGE = function(slideUrl) { var $x = ["UPDATE_PAGE",4,slideUrl]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
speech_Request.COMMENT = function(name,text) { var $x = ["COMMENT",5,name,text]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
speech_Request.ICE_CANDIDATE = function(candidate) { var $x = ["ICE_CANDIDATE",6,candidate]; $x.__enum__ = speech_Request; $x.toString = $estr; return $x; };
var speech_Main = function() {
	this.WS_URL = "wss://localhost:8081/speech";
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
		var _g = this;
		this._slide = window.document.getElementById("slide");
		this._video = window.document.getElementById("video");
		this._labelTitle = window.document.getElementById("label-title");
		this._labelDesc = window.document.getElementById("label-description");
		this._commentList = window.document.getElementById("comment-list");
		this._defaultPane = window.document.getElementById("pane-default");
		this._createPane = window.document.getElementById("pane-create");
		this._infoPane = window.document.getElementById("pane-info");
		this._discussPane = window.document.getElementById("pane-discuss");
		this._inputComment = window.document.getElementById("input-comment");
		this._inputComment.addEventListener("keypress",function(e) {
			if(e.keyCode == 13) _g.doComment();
		});
		this._inputSlideUrl = window.document.getElementById("input-slide-url");
		this._inputTitle = window.document.getElementById("input-title");
		this._inputDescription = window.document.getElementById("input-description");
		this._selectCamera = window.document.getElementById("select-camera");
		this._outputError = window.document.getElementById("output-setup-error");
		this._btnSubmitComment = window.document.getElementById("button-submit-comment");
		this._btnSubmitComment.addEventListener("click",$bind(this,this.doComment));
		this._btnRetryJoinViewer = window.document.getElementById("button-retry-join-viewer");
		this._btnRetryJoinViewer.addEventListener("click",function() {
			_g.setState(speech_State.WATCH_STARTING);
		});
	}
	,setState: function(nextState) {
		var _g = this;
		if(this._state == nextState) return;
		haxe_Log.trace("state",{ fileName : "Main.hx", lineNumber : 166, className : "speech.Main", methodName : "setState", customParams : [nextState]});
		{
			var _g1 = this._state;
			if(_g1 == null) {
			} else switch(_g1[1]) {
			case 0:
				this._defaultPane.classList.remove("show");
				break;
			case 1:
				this._defaultPane.classList.remove("show");
				break;
			case 2:
				var url = _g1[4];
				var desc = _g1[3];
				var title = _g1[2];
				this._infoPane.classList.remove("show");
				this._discussPane.classList.remove("show");
				break;
			case 3:
				break;
			case 4:
				var answer = _g1[2];
				this._infoPane.classList.remove("show");
				this._discussPane.classList.remove("show");
				this._video.classList.remove("show");
				break;
			case 5:
				this._createPane.classList.remove("show");
				break;
			case 6:
				var desc1 = _g1[4];
				var title1 = _g1[3];
				var slideUrl = _g1[2];
				break;
			case 7:
				this._infoPane.classList.remove("show");
				this._discussPane.classList.remove("show");
				this._slide.contentWindow.removeEventListener("keydown",$bind(this,this.checkPage));
				this._slide.contentWindow.removeEventListener("wheel",$bind(this,this.checkPage));
				this._slide.contentWindow.removeEventListener("mouseup",$bind(this,this.checkPage));
				break;
			case 8:
				var desc2 = _g1[5];
				var title2 = _g1[4];
				var videoId = _g1[3];
				var slideUrl1 = _g1[2];
				break;
			case 9:
				var answer1 = _g1[2];
				this._infoPane.classList.remove("show");
				this._discussPane.classList.remove("show");
				this._slide.contentWindow.removeEventListener("keydown",$bind(this,this.checkPage));
				this._slide.contentWindow.removeEventListener("wheel",$bind(this,this.checkPage));
				this._slide.contentWindow.removeEventListener("mouseup",$bind(this,this.checkPage));
				break;
			}
		}
		switch(nextState[1]) {
		case 0:
			if(this._ws != null) this._ws.close();
			this._ws = null;
			this._slide.classList.remove("show");
			this._defaultPane.classList.add("show");
			this._prevUrl = null;
			this._prevComment = null;
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
			var desc3 = nextState[3];
			var title3 = nextState[2];
			this._labelTitle.innerText = StringTools.htmlEscape(title3);
			this._slide.src = StringTools.htmlEscape(url1);
			this._labelDesc.innerText = StringTools.htmlEscape(desc3);
			this._slide.classList.add("show");
			this._infoPane.classList.add("show");
			this._discussPane.classList.add("show");
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
			var answer2 = nextState[2];
			this._webRtcPeer.processAnswer(answer2);
			this._video.classList.add("show");
			this._infoPane.classList.add("show");
			this._discussPane.classList.add("show");
			break;
		case 5:
			MediaStreamTrack.getSources(function(trackList) {
				_g._selectCamera.innerHTML = "<option value=\"none\">なし</option>";
				var _g11 = 0;
				while(_g11 < trackList.length) {
					var track = trackList[_g11];
					++_g11;
					if(track.kind == "video") _g._selectCamera.insertAdjacentHTML("beforeend","<option value=\"" + track.id + "\">" + track.label + "</option>");
				}
			});
			this._createPane.classList.add("show");
			break;
		case 6:
			var desc4 = nextState[4];
			var title4 = nextState[3];
			var slideUrl2 = nextState[2];
			this._prevUrl = slideUrl2;
			this._ws = new WebSocket(this.WS_URL);
			this._ws.addEventListener("open",$bind(this,this.onWsConnect));
			this._ws.addEventListener("close",$bind(this,this.onWsClose));
			this._ws.addEventListener("message",$bind(this,this.onWsMessage));
			this._ws.addEventListener("error",$bind(this,this.onWsError));
			break;
		case 7:
			this._infoPane.classList.add("show");
			this._discussPane.classList.add("show");
			this._slide.classList.add("show");
			this._slide.contentWindow.addEventListener("keydown",$bind(this,this.checkPage));
			this._slide.contentWindow.addEventListener("wheel",$bind(this,this.checkPage));
			this._slide.contentWindow.addEventListener("mouseup",$bind(this,this.checkPage));
			break;
		case 8:
			var desc5 = nextState[5];
			var title5 = nextState[4];
			var videoId1 = nextState[3];
			var slideUrl3 = nextState[2];
			this._prevUrl = slideUrl3;
			this._ws = new WebSocket(this.WS_URL);
			this._ws.addEventListener("open",$bind(this,this.onWsConnect));
			this._ws.addEventListener("close",$bind(this,this.onWsClose));
			this._ws.addEventListener("message",$bind(this,this.onWsMessage));
			this._ws.addEventListener("error",$bind(this,this.onWsError));
			break;
		case 9:
			var answer3 = nextState[2];
			this._infoPane.classList.add("show");
			this._discussPane.classList.add("show");
			this._slide.classList.add("show");
			this._video.classList.add("show");
			this._webRtcPeer.processAnswer(answer3);
			this._slide.contentWindow.addEventListener("keydown",$bind(this,this.checkPage));
			this._slide.contentWindow.addEventListener("wheel",$bind(this,this.checkPage));
			this._slide.contentWindow.addEventListener("mouseup",$bind(this,this.checkPage));
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
			var params = req[2];
			obj.type = "joinPresenter";
			obj.data = params;
			break;
		case 3:
			var offerSdp = req[2];
			obj.type = "startStream";
			obj.data = offerSdp;
			break;
		case 4:
			var slideUrl = req[2];
			obj.type = "updateSlide";
			obj.data = slideUrl;
			break;
		case 5:
			var text = req[3];
			var name = req[2];
			obj.type = "comment";
			obj.data = { name : name, text : text};
			break;
		case 6:
			var candidate = req[2];
			obj.type = "iceCandidate";
			obj.data = candidate;
			break;
		}
		obj.timestamp = new Date().getTime();
		this._ws.send(JSON.stringify(obj));
	}
	,checkPage: function() {
		var _g = this;
		haxe_Log.trace(this._slide.contentWindow.location.href,{ fileName : "Main.hx", lineNumber : 381, className : "speech.Main", methodName : "checkPage"});
		if(!(function($this) {
			var $r;
			var _g1 = $this._state;
			$r = (function($this) {
				var $r;
				switch(_g1[1]) {
				case 7:
					$r = true;
					break;
				default:
					$r = false;
				}
				return $r;
			}($this));
			return $r;
		}(this)) && !(function($this) {
			var $r;
			var _g2 = $this._state;
			$r = (function($this) {
				var $r;
				switch(_g2[1]) {
				case 4:
					$r = true;
					break;
				default:
					$r = false;
				}
				return $r;
			}($this));
			return $r;
		}(this))) return;
		haxe_Timer.delay(function() {
			var url = _g._slide.contentWindow.location.href;
			if(_g._prevUrl != url) {
				_g.send(speech_Request.UPDATE_PAGE(url));
				_g._prevUrl = url;
			}
		},250);
	}
	,doComment: function() {
		var name = "匿名視聴者";
		var text = this._inputComment.value;
		if(text.length == 0 || text == this._prevComment) return;
		this.send(speech_Request.COMMENT(name,text));
		this._prevComment = text;
		this._inputComment.value = "";
	}
	,onWsConnect: function(e) {
		var _g1 = this;
		haxe_Log.trace("open ws",{ fileName : "Main.hx", lineNumber : 409, className : "speech.Main", methodName : "onWsConnect"});
		{
			var _g = this._state;
			switch(_g[1]) {
			case 1:
				this.send(speech_Request.JOIN_VIEWER);
				break;
			case 6:
				var description = _g[4];
				var title = _g[3];
				var slideUrl = _g[2];
				this.send(speech_Request.JOIN_PRESENTER({ title : title, description : description, slideUrl : slideUrl}));
				break;
			case 8:
				var description1 = _g[5];
				var title1 = _g[4];
				var videoId = _g[3];
				var slideUrl1 = _g[2];
				this.send(speech_Request.JOIN_PRESENTER({ title : title1, description : description1, slideUrl : slideUrl1}));
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
				navigator.getUserMedia({ video : { optional : [{ sourceId : videoId}]}, audio : true},function(lms) {
					_g1._webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly({ localVideo : _g1._video, videoStream : lms, onicecandidate : $bind(_g1,_g1.onIcecandidate)},function(err) {
						if(err != null) _g1.setState(speech_State.STOP);
						_g1._webRtcPeer.generateOffer(function(err2,offer) {
							_g1.send(speech_Request.BEGIN_STREAM_PRESENTER(offer));
						});
					});
				},function(err3) {
					haxe_Log.trace(err3,{ fileName : "Main.hx", lineNumber : 447, className : "speech.Main", methodName : "onWsConnect"});
				});
				break;
			default:
				haxe_Log.trace("throw@onWsConnect",{ fileName : "Main.hx", lineNumber : 451, className : "speech.Main", methodName : "onWsConnect", customParams : [this._state]});
			}
		}
	}
	,onWsClose: function(e) {
		haxe_Log.trace("close ws",{ fileName : "Main.hx", lineNumber : 457, className : "speech.Main", methodName : "onWsClose"});
		this.setState(speech_State.STOP);
	}
	,onWsMessage: function(e) {
		var mes = JSON.parse(e.data);
		var d = mes.data;
		haxe_Log.trace(mes.type,{ fileName : "Main.hx", lineNumber : 466, className : "speech.Main", methodName : "onWsMessage"});
		var _g = mes.type;
		switch(_g) {
		case "onUpdateSlide":
			this._slide.src = d;
			break;
		case "onComment":
			var name = StringTools.htmlEscape(d.name);
			var text = StringTools.htmlEscape(d.text);
			this._commentList.insertAdjacentHTML("afterbegin","<li class=\"discuss-comment new\"><img class=\"discuss-comment-image\" src=\"img/avatar.jpg\" width=\"32\" height=\"32\"><div class=\"discuss-comment-body\"><strong>" + name + "</strong><p>" + text + "</p></div></li>");
			break;
		case "canStartStream":
			this.setState(speech_State.WATCH_WITH_VIDEO_STARTING);
			break;
		case "onStopStream":
			this.setState(speech_State.STOP);
			break;
		case "accept":
			var _g1 = this._state;
			switch(_g1[1]) {
			case 1:
				this.setState(speech_State.WATCH(d.title,d.description,d.slideUrl));
				break;
			case 6:
				this.setState(speech_State.DELIVER);
				break;
			case 8:
				break;
			default:
				haxe_Log.trace("state error",{ fileName : "Main.hx", lineNumber : 496, className : "speech.Main", methodName : "onWsMessage", customParams : [mes]});
			}
			break;
		case "acceptStream":
			this.setState(speech_State.DELIVER_WITH_VIDEO(d));
			break;
		case "startStream":
			this.setState(speech_State.WATCH_WITH_VIDEO(d));
			break;
		default:
			haxe_Log.trace("unknown message",{ fileName : "Main.hx", lineNumber : 506, className : "speech.Main", methodName : "onWsMessage", customParams : [mes]});
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