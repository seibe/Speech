package electron;
import electron.ElectronMenuItem;

@:native("electron_ElectronRemoteMenuItem")
extern class ElectronRemoteMenuItem extends ElectronMenuItem
{
	function new(options:ElectronMenuItemConfig);
	
	private static function __init__() : Void untyped
	{
        var electron_ElectronRemoteMenuItem = require('remote').require('menu-item');
	}
}
