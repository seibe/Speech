package electron;

@:native("electron_ElectronRemoteMenu")
extern class ElectronRemoteMenu extends ElectronMenu
{
	function new();
	
	private static function __init__() : Void untyped
	{
        var electron_ElectronRemoteMenu = require('remote').require('menu');
	}
}
