(function (console) { "use strict";
var electron_Electron = function() { };
var electron_ElectronBrowserWindow = require("browser-window");
var speech_Main = function() {
	electron_Electron.require("app").on("window-all-closed",($_=electron_Electron.require("app"),$bind($_,$_.quit)));
	electron_Electron.require("app").on("ready",$bind(this,this.init));
};
speech_Main.main = function() {
	new speech_Main();
};
speech_Main.prototype = {
	init: function() {
		var win = new electron_ElectronBrowserWindow({ width : 800, height : 664, 'min-width' : 600, 'min-height' : 400, 'accept-first-mouse' : true, 'title-bar-style' : "hidden"});
		win.loadUrl("file://" + __dirname + "/index.html");
		win.on("closed",function() {
			win = null;
		});
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
electron_Electron.require = require;
speech_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
