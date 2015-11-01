package electron;
import electron.Electron.ElectronWebContents;

@:native("electron_ElectronRemoteBrowserWindow")
extern class ElectronRemoteBrowserWindow extends ElectronBrowserWindow
{
	function new(options:Dynamic);
	
	static function getAllWindows():Array<ElectronBrowserWindow>;
	static function getFocusedWindow():ElectronBrowserWindow;
	static function fromWebContents(webContents:ElectronWebContents):ElectronBrowserWindow;
	static function fromId(id:Int):ElectronBrowserWindow;
	static function addDevToolsExtension(path:String):Void;
	static function removeDevToolsExtension(name:String):Void;
	
	private static function __init__() : Void untyped
	{
        var electron_ElectronRemoteBrowserWindow = require('remote').require('browser-window');
	}
}
