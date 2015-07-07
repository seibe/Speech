package electron;

import electron.Electron;
import haxe.extern.Rest;

@:jsRequire('tray')
extern class ElectronTray
{
	function new(image:ElectronNativeImage);
	
	function destroy():Void;
	function setImage(image:ElectronNativeImage):Void;
	function setPressedImage(image:ElectronNativeImage):Void;
	function setToolTip(toolTip:String):Void;
	function setTitle(title:String):Void;
	function setHighlightMode(highlight:Bool):Void;
	function displayBalloon(options: {
		var icon:ElectronNativeImage;
		var title:String;
		var content:String;
	}):Void;
	function setContextMenu(menu:ElectronMenu):Void;
	
	// extends EventEmitter
	function addListener(event:String, fn:ElectronFunction):Dynamic;
	function on(event:String, fn:ElectronFunction):Dynamic;
	function once(event:String, fn:ElectronFunction):Void;
	function removeListener(event:String, listener:ElectronFunction):Void;
	function removeAllListeners(event:String):Void;
	function listeners(event:String):Array<ElectronFunction>;
	function setMaxListeners(m:Int):Void;
	function emit(event:String, args:Rest<Dynamic>):Void;
}
