package electron;

@:native("electron_ElectronRemoteTray")
extern class ElectronRemoteTray extends ElectronTray
{
	function new(image:ElectronNativeImage);
	
	private static function __init__() : Void untyped
	{
        var electron_ElectronRemoteTray = require('remote').require('tray');
	}
}
