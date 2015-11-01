package electron;

@:native("electron_ElectronRemoteNativeImage")
extern class ElectronRemoteNativeImage extends ElectronNativeImage
{
function new();
	
	private static function __init__() : Void untyped
	{
        var electron_ElectronRemoteNativeImage = require('remote').require('native-image');
	}
}
