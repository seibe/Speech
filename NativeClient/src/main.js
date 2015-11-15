(function (console) { "use strict";
var electron_Electron = function() { };
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
		var win = new electron_ElectronBrowserWindow({ width : 1280, height : 720, 'min-width' : 600, 'min-height' : 400, 'accept-first-mouse' : true, 'title-bar-style' : "hidden"});
		win.loadUrl("file://" + __dirname + "/index.html");
		win.openDevTools();
		win.on("closed",function() {
			win = null;
		});
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
electron_Electron.require = require;
electron_Electron.remoteRequire = require("remote").require;
speech_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});

//# sourceMappingURL=main.js.map