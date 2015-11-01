package electron;

import electron.ElectronMenuItem;

@:jsRequire('menu')
extern class ElectronMenu
{
	function new();
	
	static function setApplicationMenu(menu:ElectronMenu):Void;
	static function sendActionToFirstResponder(action:String):Void; // available only on OS X
	static function buildFromTemplate(template:Array<ElectronMenuItemConfig>):ElectronMenu;
	
	function popup(browserWindow:ElectronBrowserWindow, ?x:Int, ?y:Int):Void;
	function append(menuItem:ElectronMenuItem):Void;
	function insert(pos:Int, menuItem:ElectronMenuItem):Void;
	var items:Array<ElectronMenuItem>;
}
