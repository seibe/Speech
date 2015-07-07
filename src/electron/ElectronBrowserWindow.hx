package electron;

import electron.Electron;
import haxe.extern.Rest;

@:jsRequire('browser-window')
extern class ElectronBrowserWindow
{
	function new(options:Dynamic);
	
	static function getAllWindows():Array<ElectronBrowserWindow>;
	static function getFocusedWindow():ElectronBrowserWindow;
	static function fromWebContents(webContents:ElectronWebContents):ElectronBrowserWindow;
	static function fromId(id:Int):ElectronBrowserWindow;
	static function addDevToolsExtension(path:String):Void;
	static function removeDevToolsExtension(name:String):Void;
	
	var webContents(default,null):ElectronWebContents;
	var devToolsWebContents(default, null):ElectronWebContents;
	var id(default, null):Int;
	
	function destroy():Void;
	function close():Void;
	function focus():Void;
	function isFocused():Bool;
	function show():Void;
	function showInactive():Void;
	function hide():Void;
	function isVisible():Bool;
	function maximize():Void;
	function unmaximize():Void;
	function isMaximized():Bool;
	function minimize():Void;
	function restore():Void;
	function isMinimized():Bool;
	function setFullScreen(flag:Bool):Void;
	function isFullScreen():Bool;
	function setBounds(options:{ x:Int, y:Int, width:Int, height:Int }):Void;
	function getBounds():{ x:Int, y:Int, width:Int, height:Int };
	function setSize(width:Int, height:Int):Void;
	function getSize():Array<Int>;
	function setMinimumSize(width:Int, height:Int):Void;
	function getMinimumSize():Array<Int>;
	function setMaximumSize(width:Int, height:Int):Void;
	function getMaximumSize():Array<Int>;
	function setResizable(resizable:Bool):Void;
	function isResizable():Bool;
	function setAlwaysOnTop(flag:Bool):Void;
	function isAlwaysOnTop():Bool;
	function center():Void;
	function setPosition(x:Int, y:Int):Void;
	function getPosition():Array<Int>;
	function setTitle(title:String):Void;
	function getTitle():String;
	function flashFrame(flag:Bool):Void;
	function setSkipTaskbar(skip:Bool):Void;
	function setKiosk(flag:Bool):Void;
	function isKiosk():Bool;
	function setRepresentedFilename(filename:String):Void; // available only on OS X
	function getRepresentedFilename():String; // available only on OS X
	function setDocumentEdited(edited:Bool):Void; // available only on OS X
	function isDocumentEdited():String; // available only on OS X
	function openDevTools(?options: { detach:Bool } ):Void;
	function closeDevTools():Void;
	function isDevToolsOpened():Bool;
	function toggleDevTools():Void;
	function inspectElement(x:Int, y:Int):Void;
	function inspectServiceWorker():Void;
	function focusOnWebView():Void;
	function blurWebView():Void;
	
	@:overload(function(rect:{ x:Int, y:Int, width:Int, height:Int }, callback:ElectronNativeImage->Void):Void{})
	function capturePage(callback:ElectronNativeImage->Void):Void;
	
	function setMenu(menu:ElectronMenu):Void; // does nothing on OS X
	function setProgressBar(progress:Float):Void;
	function setOverlayIcon(overlay:ElectronNativeImage, description:String):Void; // available only on Windows
	function showDefinitionForSelection():Void; // available only on OS X
	function setAutoHideMenuBar(hide:Bool):Void;
	function isMenuBarAutoHide():Bool;
	function setMenuBarVisibility(visible:Bool):Void;
	function isMenuBarVisible():Bool;
	function setVisibleOnAllWorkspaces(visible:Bool):Void; // does nothing on Windows
	function isVisibleOnAllWorkspaces():Bool; // does nothing on Windows
	
	// same with webContents
	function print(?options: { ?silent:Bool, ?printBackground:Bool } ):Void;
	function printToPDF(options: { ?marginsType:Int, ?printBackground:Bool, ?printSelectionOnly:Bool, ?landscape:Bool }, callback:ElectronFunction):Void;
	function loadUrl(url:String, ?options: { ?httpReferrer:String, ?userAgent:String } ):Void;
	function reload():Void;
	function reloadIgnoringCache():Void;
	
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
