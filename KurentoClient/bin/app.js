(function (console, $global) { "use strict";
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
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = true;
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_Log = function() { };
haxe_Log.__name__ = true;
haxe_Log.trace = function(v,infos) {
	js_Boot.__trace(v,infos);
};
var haxe_ds_IntMap = function() {
	this.h = { };
};
haxe_ds_IntMap.__name__ = true;
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
haxe_ds_IntMap.prototype = {
	remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i];
		}};
	}
	,__class__: haxe_ds_IntMap
};
var haxe_ds_ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
haxe_ds_ObjectMap.__name__ = true;
haxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];
haxe_ds_ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe_ds_ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,remove: function(key) {
		var id = key.__id__;
		if(this.h.__keys__[id] == null) return false;
		delete(this.h[id]);
		delete(this.h.__keys__[id]);
		return true;
	}
	,__class__: haxe_ds_ObjectMap
};
var haxe_io_Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
var haxe_io_FPHelper = function() { };
haxe_io_FPHelper.__name__ = true;
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af;
	if(f < 0) af = -f; else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
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
	__class__: js__$Boot_HaxeError
});
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
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
js_html_compat_ArrayBuffer.__name__ = true;
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
js_html_compat_Uint8Array.__name__ = true;
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
var js_node_Fs = require("fs");
var js_node_Https = require("https");
var js_node_Path = require("path");
var js_node_Url = require("url");
var js_node_tls_SecureContext = function() { };
js_node_tls_SecureContext.__name__ = true;
var kurento = require("kurento-client");
var shortId_ShortId = require("shortid");
var speech_Main = function() {
	this._w = new haxe_ds_ObjectMap();
	this._u = new haxe_ds_IntMap();
	this._p = new haxe_ds_IntMap();
	var server = js_node_Https.createServer({ key : js_node_Fs.readFileSync("/etc/letsencrypt/live/seibe.jp/privkey.pem"), cert : js_node_Fs.readFileSync("/etc/letsencrypt/live/seibe.jp/cert.pem")},function(req,res) {
		res.writeHead(200);
		res.end("All glory to WebSockets!\n");
	}).listen(8081);
	this._server = new ws_WsServer({ server : server, path : "/speech"});
	this._server.on("connection",$bind(this,this.onConnect));
};
speech_Main.__name__ = true;
speech_Main.main = function() {
	new speech_Main();
};
speech_Main.prototype = {
	onConnect: function(ws) {
		var _g = this;
		{
			this._w.set(ws,null);
			null;
		}
		ws.on("message",function(data,flags) {
			_g.onMessage(ws,data,flags);
		});
		ws.on("close",function() {
			_g.onClose(ws);
		});
		ws.on("error",function(error) {
			_g.onError(ws,error);
		});
	}
	,onMessage: function(ws,data,flags) {
		var json = JSON.parse(data);
		var type = json.type;
		var d = json.data;
		var u = this._w.h[ws.__id__];
		switch(type) {
		case "joinPresenter":
			this.initPresentation(ws,d.title,d.slideUrl,d.name);
			break;
		case "leavePresenter":
			if(u.type != speech_abstracts_UserType.PRESENTER) return;
			this.finalizePresentation(u);
			break;
		case "joinViewer":
			this.joinPresentation(ws,d);
			break;
		case "leaveViewer":
			if(u.type != speech_abstracts_UserType.AUDIENCE) return;
			this.leavePresentation(u);
			break;
		case "updateSlide":
			if(u.type != speech_abstracts_UserType.PRESENTER) return;
			this.updateSlideUrl(u,d);
			break;
		case "startStream":
			if(u.type != speech_abstracts_UserType.PRESENTER) return;
			this.initStream(u,d.offer,d.target);
			break;
		case "stopStream":
			if(u.type != speech_abstracts_UserType.PRESENTER) return;
			this.finalizeStream(u);
			break;
		case "startPointer":
			break;
		case "updatePointer":
			break;
		case "stopPointer":
			break;
		case "connectStream":
			if(u.type != speech_abstracts_UserType.AUDIENCE) return;
			this.connectStream(u,d);
			break;
		case "disconnectStream":
			if(u.type != speech_abstracts_UserType.AUDIENCE) return;
			this.disconnectStream(u);
			break;
		case "comment":
			this.comment(u,{ type : d.type, text : d.text, pageUrl : d.pageUrl, userId : u.id, name : d.name, point : d.point});
			break;
		case "iceCandidate":
			this.addIceCandidate(u,d);
			break;
		case "requestLog":
			if(u.type != speech_abstracts_UserType.PRESENTER) return;
			this.makeLog(u);
			break;
		default:
			haxe_Log.trace("ws throw",{ fileName : "Main.hx", lineNumber : 174, className : "speech.Main", methodName : "onMessage", customParams : [json.type]});
		}
	}
	,onClose: function(ws) {
		var u = this._w.h[ws.__id__];
		if(u != null) {
			u.socket = null;
			var _g = u.type;
			switch(_g[1]) {
			case 1:
				if(!u.deleted) this.leavePresentation(u);
				var p;
				var key = u.presentationId.toInt();
				p = this._p.h[key];
				if(p != null) this.broadcast(p,"updateAudience",this.getNumAlive(p),true);
				break;
			case 0:
				if(!u.deleted) this.finalizePresentation(u);
				break;
			}
		}
		this._w.remove(ws);
	}
	,onError: function(ws,error) {
		haxe_Log.trace("ws error",{ fileName : "Main.hx", lineNumber : 201, className : "speech.Main", methodName : "onError", customParams : [error]});
	}
	,initPresentation: function(ws,title,url,name) {
		var urldata = js_node_Url.parse(url);
		if(urldata.protocol != "http:" && urldata.protocol != "https:") {
			haxe_Log.trace("無効なURLが指定された: " + url,{ fileName : "Main.hx", lineNumber : 217, className : "speech.Main", methodName : "initPresentation"});
			return;
		}
		var p = new speech_abstracts_Presentation();
		var k = p.id.toInt();
		this._p.h[k] = p;
		p;
		var u = new speech_abstracts_Presenter(p.id,ws);
		u.ipaddr = ws.upgradeReq.connection.remoteAddress;
		u.name = name;
		var k1 = u.id.toInt();
		this._u.h[k1] = u;
		u;
		{
			this._w.set(ws,u);
			u;
		}
		p.presenterId = u.id;
		p.title = title;
		p.slideUrls.push(url);
		p.activities.push(new speech_abstracts_Activity(speech_abstracts_ActivityType.INITIALIZE));
		ws.send(speech_abstracts_Message.generate("acceptPresenter",p.shortId));
	}
	,finalizePresentation: function(u) {
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		if(u.stream != null) this.finalizeStream(u);
		u.deleted = true;
		if(u.socket != null) {
			u.socket.send(speech_abstracts_Message.generate("finish"));
			u.socket.close();
			u.socket = null;
		}
		var _g = 0;
		var _g1 = p.audienceIds;
		while(_g < _g1.length) {
			var aid = _g1[_g];
			++_g;
			var a;
			var key1 = aid.toInt();
			a = this._u.h[key1];
			a.deleted = true;
			if(a.socket != null) {
				a.socket.send(speech_abstracts_Message.generate("finish"));
				a.socket.close();
				a.socket = null;
			}
		}
		var key2 = p.presenterId.toInt();
		this._u.remove(key2);
		var _g2 = 0;
		var _g11 = p.audienceIds;
		while(_g2 < _g11.length) {
			var aid1 = _g11[_g2];
			++_g2;
			var key3 = aid1.toInt();
			this._u.remove(key3);
		}
		var key4 = p.id.toInt();
		this._p.remove(key4);
	}
	,joinPresentation: function(ws,shortId) {
		var p = null;
		if(shortId != null) {
			var $it0 = this._p.iterator();
			while( $it0.hasNext() ) {
				var temp = $it0.next();
				if(temp.shortId == shortId) {
					p = temp;
					break;
				}
			}
			if(p == null) {
				ws.send(speech_abstracts_Message.generate("onError","発表が存在しません"));
				ws.close();
				return;
			}
		} else {
			if(p == null) {
				var $it1 = this._p.iterator();
				while( $it1.hasNext() ) {
					var temp1 = $it1.next();
					p = temp1;
					break;
				}
			}
			if(p == null) {
				ws.send(speech_abstracts_Message.generate("onError","現在発表は行われていません"));
				ws.close();
				return;
			}
		}
		var a = new speech_abstracts_Audience(p.id,ws);
		a.ipaddr = ws.upgradeReq.connection.remoteAddress;
		var k = a.id.toInt();
		this._u.h[k] = a;
		a;
		{
			this._w.set(ws,a);
			a;
		}
		p.audienceIds.push(a.id);
		p.activities.push(new speech_abstracts_Activity(speech_abstracts_ActivityType.JOIN(p.audienceIds.length - 1)));
		ws.send(speech_abstracts_Message.generate("acceptAudience",{ title : p.title, slideUrl : p.slideUrls[p.slideUrls.length - 1]}));
		var u;
		var key = p.presenterId.toInt();
		u = this._u.h[key];
		if(u.endpoint != null) a.socket.send(speech_abstracts_Message.generate("canConnectStream"));
		this.broadcast(p,"updateAudience",this.getNumAlive(p),true);
	}
	,leavePresentation: function(a) {
		var p;
		var key = a.presentationId.toInt();
		p = this._p.h[key];
		if(a.endpoint != null) this.disconnectStream(a);
		if(a.socket != null) {
			a.deleted = true;
			a.socket.close();
			a.socket = null;
		}
		var index = HxOverrides.indexOf(p.audienceIds,a.id,0);
		p.activities.push(new speech_abstracts_Activity(speech_abstracts_ActivityType.LEAVE(index)));
	}
	,updateSlideUrl: function(u,url) {
		var urldata = js_node_Url.parse(url);
		if(urldata.protocol != "http:" && urldata.protocol != "https:") {
			haxe_Log.trace("無効なURLが指定された: " + url,{ fileName : "Main.hx", lineNumber : 389, className : "speech.Main", methodName : "updateSlideUrl"});
			return;
		}
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		var index = HxOverrides.indexOf(p.slideUrls,url,0);
		if(index < 0) {
			p.slideUrls.push(url);
			index = p.slideUrls.length - 1;
		}
		p.activities.push(new speech_abstracts_Activity(speech_abstracts_ActivityType.UPDATE_SLIDE(index)));
		this.broadcast(p,"onUpdateSlide",url);
	}
	,initStream: function(u,sdpOffer,target) {
		var _g = this;
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		u.candidatesQueue = [];
		kurento.getSingleton("ws://kurento.seibe.jp:8888/kurento").then(function(client) {
			if(u.socket == null || client == null) return Promise.reject();
			return client.create("MediaPipeline");
		})["catch"](function(error) {
			haxe_Log.trace(error,{ fileName : "Main.hx", lineNumber : 433, className : "speech.Main", methodName : "initStream"});
			if(u.socket != null) u.socket.send(speech_abstracts_Message.generate("onError",error));
			_g.finalizeStream(u);
			return null;
		}).then(function(pipeline) {
			if(u.socket == null || pipeline == null) return Promise.reject();
			u.pipeline = pipeline;
			var p1 = pipeline.create("WebRtcEndpoint");
			u.stream = new speech_abstracts_Stream(target);
			var p2 = pipeline.create("RecorderEndpoint",{ uri : js_node_Path.join("file:///var/www/kurento.seibe.jp/record",u.stream.filename)});
			return Promise.all([p1,p2]);
		}).then(function(endpoints) {
			if(u.socket == null || u.pipeline == null) return Promise.reject();
			u.endpoint = endpoints[0];
			u.recorder = endpoints[1];
			if(u.endpoint == null || u.recorder == null) return Promise.reject();
			return u.endpoint.connect(u.recorder);
		}).then(function(dummy) {
			if(u.socket == null || u.pipeline == null) return Promise.reject();
			if(u.endpoint == null || u.recorder == null) return Promise.reject();
			u.recorder.record();
			_g.exchangeCandidates(u);
			var p11 = u.endpoint.processOffer(sdpOffer);
			var p21 = u.endpoint.gatherCandidates();
			return Promise.all([p11,p21]);
		}).then(function(results) {
			if(u.socket == null || u.pipeline == null) return Promise.reject();
			var sdpAnswer = results[0];
			p.streams.push(u.stream);
			p.activities.push(new speech_abstracts_Activity(speech_abstracts_ActivityType.STREAM_BEGIN(p.streams.length - 1)));
			u.socket.send(speech_abstracts_Message.generate("acceptStream",sdpAnswer));
			_g.broadcast(p,"canConnectStream");
			return null;
		})["catch"](function(error1) {
			haxe_Log.trace(error1,{ fileName : "Main.hx", lineNumber : 485, className : "speech.Main", methodName : "initStream"});
			if(u.socket != null) u.socket.send(speech_abstracts_Message.generate("onError",error1));
			_g.finalizeStream(u);
			return null;
		});
	}
	,finalizeStream: function(u) {
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		this.broadcast(p,"willStopStream",null,true);
		var index = HxOverrides.indexOf(p.streams,u.stream,0);
		p.activities.push(new speech_abstracts_Activity(speech_abstracts_ActivityType.STREAM_END(index)));
		try {
			if(u.recorder != null) {
				u.recorder.stop();
				u.recorder.release();
			}
			if(u.pipeline != null) u.pipeline.release();
			if(u.endpoint != null) u.endpoint.release();
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			if( js_Boot.__instanceof(e,Error) ) {
				haxe_Log.trace(e,{ fileName : "Main.hx", lineNumber : 519, className : "speech.Main", methodName : "finalizeStream"});
			} else throw(e);
		}
		u.stream = null;
		u.candidatesQueue = null;
		u.recorder = null;
		u.pipeline = null;
		u.endpoint = null;
		u.socket.send(speech_abstracts_Message.generate("onStopStream"));
		var _g = 0;
		var _g1 = p.audienceIds;
		while(_g < _g1.length) {
			var aid = _g1[_g];
			++_g;
			var a;
			var key1 = aid.toInt();
			a = this._u.h[key1];
			this.disconnectStream(a);
		}
	}
	,connectStream: function(a,sdpOffer) {
		var _g = this;
		var p;
		var key = a.presentationId.toInt();
		p = this._p.h[key];
		var u;
		var key1 = p.presenterId.toInt();
		u = this._u.h[key1];
		if(u.endpoint == null || u.pipeline == null) {
			a.socket.send(speech_abstracts_Message.generate("onError","映像配信がないです"));
			return;
		}
		var sdpAnswer = null;
		a.pipeline = u.pipeline;
		a.pipeline.create("WebRtcEndpoint").then(function(endpoint) {
			if(a.socket == null || a.pipeline == null) return Promise.reject();
			a.endpoint = endpoint;
			_g.exchangeCandidates(u);
			return endpoint.processOffer(sdpOffer);
		}).then(function(answer) {
			if(a.socket == null || a.pipeline == null) return Promise.reject();
			sdpAnswer = answer;
			return u.endpoint.connect(a.endpoint);
		}).then(function(dummy) {
			if(a.socket == null || a.pipeline == null) return Promise.reject();
			return a.endpoint.gatherCandidates();
		}).then(function(dummy1) {
			if(a.socket == null || a.pipeline == null) return Promise.reject();
			a.socket.send(speech_abstracts_Message.generate("acceptStream",sdpAnswer));
			return null;
		})["catch"](function(error) {
			haxe_Log.trace(error,{ fileName : "Main.hx", lineNumber : 582, className : "speech.Main", methodName : "connectStream"});
			a.socket.send(speech_abstracts_Message.generate("onError",error));
		});
	}
	,disconnectStream: function(a) {
		try {
			if(a.endpoint != null) a.endpoint.release();
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			if( js_Boot.__instanceof(e,Error) ) {
				haxe_Log.trace(e,{ fileName : "Main.hx", lineNumber : 597, className : "speech.Main", methodName : "disconnectStream"});
			} else throw(e);
		}
		a.candidatesQueue = null;
		a.pipeline = null;
		a.endpoint = null;
		if(a.socket != null) a.socket.send(speech_abstracts_Message.generate("onStopStream"));
	}
	,comment: function(u,d) {
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		p.activities.push(new speech_abstracts_Activity(speech_abstracts_ActivityType.COMMENT(d)));
		this.broadcast(p,"onComment",d,true);
	}
	,startPointer: function(u) {
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		this.broadcast(p,"startPointer");
	}
	,updatePointer: function(u,d) {
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		this.broadcast(p,"updatePointer",d);
	}
	,stopPointer: function(u) {
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		this.broadcast(p,"stopPointer");
	}
	,makeLog: function(u) {
		var p;
		var key = u.presentationId.toInt();
		p = this._p.h[key];
		if(u.stream != null) this.finalizeStream(u);
		p.activities.push(new speech_abstracts_Activity(speech_abstracts_ActivityType.FINALIZE));
		var log = { title : p.title, time_begin : p.activities[0].time, time_end : p.activities[p.activities.length - 1].time, presenter : { ipaddr : u.ipaddr, name : u.name}, audience : [], slide : [], attachment : [], activity : []};
		var _g1 = 0;
		var _g = p.audienceIds.length;
		while(_g1 < _g) {
			var i = _g1++;
			var a;
			var key1 = p.audienceIds[i].toInt();
			a = this._u.h[key1];
			log.audience.push({ index : i, ipaddr : a.ipaddr, name : a.name});
		}
		var _g11 = 0;
		var _g2 = p.slideUrls.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			var url = Std.string(p.slideUrls[i1]);
			log.slide.push({ index : i1, url : url});
		}
		var _g12 = 0;
		var _g3 = p.streams.length;
		while(_g12 < _g3) {
			var i2 = _g12++;
			var url1 = js_node_Path.join("https://kurento.seibe.jp/record",p.streams[i2].filename);
			log.attachment.push({ index : i2, type : "video/webm", url : url1, name : p.streams[i2].target});
		}
		var _g13 = 0;
		var _g4 = p.activities.length;
		while(_g13 < _g4) {
			var i3 = _g13++;
			var act = p.activities[i3];
			{
				var _g21 = act.type;
				switch(_g21[1]) {
				case 0:
					log.activity.push({ index : i3, time : act.time, type : "begin"});
					break;
				case 1:
					log.activity.push({ index : i3, time : act.time, type : "end"});
					break;
				case 2:
					var index = _g21[2];
					log.activity.push({ index : i3, time : act.time, type : "join", audience_index : index});
					break;
				case 3:
					var index1 = _g21[2];
					log.activity.push({ index : i3, time : act.time, type : "leave", audience_index : index1});
					break;
				case 4:
					var index2 = _g21[2];
					log.activity.push({ index : i3, time : act.time, type : "update_slide", slide_index : index2});
					break;
				case 5:
					var index3 = _g21[2];
					log.activity.push({ index : i3, time : act.time, type : "begin_stream", attachment_index : index3});
					break;
				case 6:
					var index4 = _g21[2];
					log.activity.push({ index : i3, time : act.time, type : "end_stream", attachment_index : index4});
					break;
				case 7:
					var data = _g21[2];
					var slideIndex = HxOverrides.indexOf(p.slideUrls,data.pageUrl,0);
					var audienceIndex = HxOverrides.indexOf(p.audienceIds,data.userId,0);
					log.activity.push({ index : i3, time : act.time, type : "comment", slide_index : slideIndex, comment : { text : data.text, user_name : data.name, comment_type : Std.string(data.type)}, point : data.point, audience_index : audienceIndex});
					break;
				}
			}
		}
		var filename = shortId_ShortId.generate() + ".json";
		var filepath = js_node_Path.join("/var/www/seibe.jp/speech/log",filename);
		js_node_Fs.appendFileSync(filepath,JSON.stringify(log));
		if(u.socket != null) {
			var url2 = js_node_Path.join("https://seibe.jp/speech/log",filename);
			u.socket.send(speech_abstracts_Message.generate("onCreateLog",url2));
		}
	}
	,addIceCandidate: function(u,candidate) {
		candidate = kurento.register.complexTypes.IceCandidate(candidate);
		if(u.endpoint != null) u.endpoint.addIceCandidate(candidate); else {
			if(u.candidatesQueue == null) u.candidatesQueue = [];
			u.candidatesQueue.push(candidate);
		}
	}
	,exchangeCandidates: function(u) {
		while(u.candidatesQueue.length > 0) {
			var candidate = u.candidatesQueue.shift();
			u.endpoint.addIceCandidate(candidate);
		}
		u.endpoint.on("OnIceCandidate",function(e) {
			var candidate1 = kurento.register.complexTypes.IceCandidate(e.candidate);
			u.socket.send(speech_abstracts_Message.generate("iceCandidate",candidate1));
		});
	}
	,broadcast: function(p,type,data,withPresenter) {
		if(withPresenter == null) withPresenter = false;
		if(withPresenter) {
			var u;
			var key = p.presenterId.toInt();
			u = this._u.h[key];
			if(u.socket != null) u.socket.send(speech_abstracts_Message.generate(type,data));
		}
		var _g = 0;
		var _g1 = p.audienceIds;
		while(_g < _g1.length) {
			var aid = _g1[_g];
			++_g;
			var a;
			var key1 = aid.toInt();
			a = this._u.h[key1];
			if(a.socket != null) a.socket.send(speech_abstracts_Message.generate(type,data));
		}
	}
	,getNumAlive: function(p) {
		var num = 0;
		var _g = 0;
		var _g1 = p.audienceIds;
		while(_g < _g1.length) {
			var aid = _g1[_g];
			++_g;
			var a;
			var key = aid.toInt();
			a = this._u.h[key];
			if(a.socket != null) num++;
		}
		return num;
	}
	,__class__: speech_Main
};
var speech_abstracts_Activity = function(actType) {
	this.time = new Date().getTime();
	this.type = actType;
};
speech_abstracts_Activity.__name__ = true;
speech_abstracts_Activity.prototype = {
	__class__: speech_abstracts_Activity
};
var speech_abstracts_ActivityType = { __ename__ : true, __constructs__ : ["INITIALIZE","FINALIZE","JOIN","LEAVE","UPDATE_SLIDE","STREAM_BEGIN","STREAM_END","COMMENT"] };
speech_abstracts_ActivityType.INITIALIZE = ["INITIALIZE",0];
speech_abstracts_ActivityType.INITIALIZE.toString = $estr;
speech_abstracts_ActivityType.INITIALIZE.__enum__ = speech_abstracts_ActivityType;
speech_abstracts_ActivityType.FINALIZE = ["FINALIZE",1];
speech_abstracts_ActivityType.FINALIZE.toString = $estr;
speech_abstracts_ActivityType.FINALIZE.__enum__ = speech_abstracts_ActivityType;
speech_abstracts_ActivityType.JOIN = function(index) { var $x = ["JOIN",2,index]; $x.__enum__ = speech_abstracts_ActivityType; $x.toString = $estr; return $x; };
speech_abstracts_ActivityType.LEAVE = function(index) { var $x = ["LEAVE",3,index]; $x.__enum__ = speech_abstracts_ActivityType; $x.toString = $estr; return $x; };
speech_abstracts_ActivityType.UPDATE_SLIDE = function(index) { var $x = ["UPDATE_SLIDE",4,index]; $x.__enum__ = speech_abstracts_ActivityType; $x.toString = $estr; return $x; };
speech_abstracts_ActivityType.STREAM_BEGIN = function(index) { var $x = ["STREAM_BEGIN",5,index]; $x.__enum__ = speech_abstracts_ActivityType; $x.toString = $estr; return $x; };
speech_abstracts_ActivityType.STREAM_END = function(index) { var $x = ["STREAM_END",6,index]; $x.__enum__ = speech_abstracts_ActivityType; $x.toString = $estr; return $x; };
speech_abstracts_ActivityType.COMMENT = function(data) { var $x = ["COMMENT",7,data]; $x.__enum__ = speech_abstracts_ActivityType; $x.toString = $estr; return $x; };
var speech_abstracts_User = function(utype,pid,ws) {
	this.id = speech_abstracts_Uuid.generate();
	this.presentationId = pid;
	this.type = utype;
	this.deleted = false;
	this.name = null;
	this.socket = ws;
	this.candidatesQueue = null;
	this.pipeline = null;
	this.endpoint = null;
};
speech_abstracts_User.__name__ = true;
speech_abstracts_User.prototype = {
	__class__: speech_abstracts_User
};
var speech_abstracts_Audience = function(pid,ws) {
	speech_abstracts_User.call(this,speech_abstracts_UserType.AUDIENCE,pid,ws);
};
speech_abstracts_Audience.__name__ = true;
speech_abstracts_Audience.__super__ = speech_abstracts_User;
speech_abstracts_Audience.prototype = $extend(speech_abstracts_User.prototype,{
	__class__: speech_abstracts_Audience
});
var speech_abstracts_Message = function() { };
speech_abstracts_Message.__name__ = true;
speech_abstracts_Message.generate = function(type,data) {
	return JSON.stringify({ type : type, data : data, timestamp : new Date().getTime()});
};
var speech_abstracts_Presentation = function() {
	this.id = speech_abstracts_Uuid.generate();
	this.shortId = shortId_ShortId.generate();
	this.presenterId = null;
	this.audienceIds = [];
	this.title = null;
	this.slideUrls = [];
	this.streams = [];
	this.activities = [];
};
speech_abstracts_Presentation.__name__ = true;
speech_abstracts_Presentation.prototype = {
	__class__: speech_abstracts_Presentation
};
var speech_abstracts_Presenter = function(pid,ws) {
	speech_abstracts_User.call(this,speech_abstracts_UserType.PRESENTER,pid,ws);
	this.recorder = null;
	this.stream = null;
};
speech_abstracts_Presenter.__name__ = true;
speech_abstracts_Presenter.__super__ = speech_abstracts_User;
speech_abstracts_Presenter.prototype = $extend(speech_abstracts_User.prototype,{
	__class__: speech_abstracts_Presenter
});
var speech_abstracts_Stream = function(target) {
	this.target = target;
	this.filename = shortId_ShortId.generate() + ".webm";
};
speech_abstracts_Stream.__name__ = true;
speech_abstracts_Stream.prototype = {
	__class__: speech_abstracts_Stream
};
var speech_abstracts_UserType = { __ename__ : true, __constructs__ : ["PRESENTER","AUDIENCE"] };
speech_abstracts_UserType.PRESENTER = ["PRESENTER",0];
speech_abstracts_UserType.PRESENTER.toString = $estr;
speech_abstracts_UserType.PRESENTER.__enum__ = speech_abstracts_UserType;
speech_abstracts_UserType.AUDIENCE = ["AUDIENCE",1];
speech_abstracts_UserType.AUDIENCE.toString = $estr;
speech_abstracts_UserType.AUDIENCE.__enum__ = speech_abstracts_UserType;
var speech_abstracts_Uuid = function(value) {
	this._id = value;
};
speech_abstracts_Uuid.__name__ = true;
speech_abstracts_Uuid.generate = function() {
	var temp = new speech_abstracts_Uuid(speech_abstracts_Uuid._nextId);
	speech_abstracts_Uuid._nextId++;
	return temp;
};
speech_abstracts_Uuid.prototype = {
	toInt: function() {
		return this._id;
	}
	,toString: function() {
		return "" + this._id;
	}
	,__class__: speech_abstracts_Uuid
};
var ws_WsServer = require("ws").Server;
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
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
var ArrayBuffer = $global.ArrayBuffer || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = $global.DataView || js_html_compat_DataView;
var Uint8Array = $global.Uint8Array || js_html_compat_Uint8Array._new;
haxe_ds_ObjectMap.count = 0;
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
speech_Main.IS_DEBUG = false;
speech_Main.WS_PORT = 8081;
speech_Main.WS_PATH = "/speech";
speech_Main.MS_URI = "ws://kurento.seibe.jp:8888/kurento";
speech_Main.MV_DIR = "file:///var/www/kurento.seibe.jp/record";
speech_Main.MV_URI = "https://kurento.seibe.jp/record";
speech_Main.LOG_DIR = "/var/www/seibe.jp/speech/log";
speech_Main.LOG_URI = "https://seibe.jp/speech/log";
speech_Main.TLS_KEY = "/etc/letsencrypt/live/seibe.jp/privkey.pem";
speech_Main.TLS_CERT = "/etc/letsencrypt/live/seibe.jp/cert.pem";
speech_abstracts_Uuid._nextId = 0;
speech_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);

//# sourceMappingURL=app.js.map