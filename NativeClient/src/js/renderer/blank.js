(function (console) { "use strict";
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
};
var speech_renderer_Blank = function() {
	window.onload = $bind(this,this.init);
};
speech_renderer_Blank.main = function() {
	new speech_renderer_Blank();
};
speech_renderer_Blank.prototype = {
	init: function() {
		var txt = window.document.getElementById("blank-form-input");
		var btn = window.document.getElementById("blank-form-submit");
		btn.addEventListener("click",function(e) {
			btn.disabled = true;
			var reg = new EReg("https?://([\\w-]+\\.)+[\\w-]+(/[\\w-./?%&=]*)?","");
			if(reg.match(txt.value)) window.location.href = txt.value; else btn.disabled = false;
		});
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
speech_renderer_Blank.main();
})(typeof console != "undefined" ? console : {log:function(){}});
