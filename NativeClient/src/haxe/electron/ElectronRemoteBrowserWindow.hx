package electron;

@:native("electron_ElectronRemoteBrowserWindow")
extern class ElectronRemoteBrowserWindow extends ElectronBrowserWindow
{
	function new(options:Dynamic);
	
	private static function __init__() : Void untyped
	{
        var electron_ElectronRemoteBrowserWindow = require('remote').require('browser-window');
	}
}
