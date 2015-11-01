package electron;

import electron.Electron;
import js.html.Element;
import haxe.extern.Rest;

@:enum
abstract WebViewEventType(String) to String {
	var PAGE_TITLE_SET				= "page-title-set";
	var ENTER_HTML_FULL_SCREEN		= "enter-html-full-screen";
	var LEAVE_HTML_FULL_SCREEN		= "leave-html-full-screen";
	var CONSOLE_MESSAGE				= "console-message";
	var CLOSE						= "close";
	var IPC_MESSAGE					= "ipc-message";
	var GPU_CRASHED					= "gpu-crashed";
	
	// same with WebContentsEventType
	var DID_FINISH_LOAD				= "did-finish-load";
	var DID_FAIL_LOAD				= "did-fail-load";
	var DID_FRAME_FINISH_LOAD		= "did-frame-finish-load";
	var DID_START_LOADING			= "did-start-loading";
	var DID_STOP_LOADING			= "did-stop-loading";
	var DID_GET_RESPONSE_DETAILS	= "did-get-response-details";
	var DID_GET_REDIRECT_REQUEST	= "did-get-redirect-request";
	var DOM_READY					= "dom-ready";
	var PAGE_FAVICON_UPDATED		= "page-favicon-updated";
	var NEW_WINDOW					= "new-window";
	var CRASHED						= "crashed";
	var PLUGIN_CRASHED				= "plugin-crashed";
	var DESTROYED					= "destroyed";
}

extern class WebViewElement extends Element
{
	var src:String;
	var autosize:String;
	var nodeintegration:Bool;
	var plugins:Bool;
	var preload:String;
	var httpreferrer:String;
	var useragent:String;
	var disablewebsecurity:Bool;
	
	function getUrl():String;
	function getTitle():String;
	function isLoading():Bool;
	function isWatingForResponse():Bool;
	function stop():Void;
	function reload():Void;
	function reloadIgnoringCache():Void;
	function canGoBack():Bool;
	function canGoForward():Bool;
	function canGoToOffset(offset:Int):Bool;
	function clearHistory():Void;
	function goBack():Void;
	function goForward():Void;
	function goToIndex(index:Int):Void;
	function goToOffset(offset:Int):Void;
	function isCrashed():Bool;
	function setUserAgent(userAgent:String):Void;
	function insertCSS(css:String):Void;
	function executeJavaScript(code:String):Void;
	function openDevTools():Void;
	function closeDevTools():Void;
	function isDevToolsOpened():Bool;
	function inspectElement(x:Int, y:Int):Void;
	function inspectServiceWorker():Void;
	function setAudioMuted(muted:Bool):Void;
	function isAudioMuted():Bool;
	function undo():Void;
	function redo():Void;
	function cut():Void;
	function copy():Void;
	function paste():Void;
	function pasteAndMatchStyle():Void;
	function delete():Void;
	function selectAll():Void;
	function unselect():Void;
	function replace(text:String):Void;
	function replaceMisspelling(text:String):Void;
	function send(channel:String, args:Rest<Dynamic>):Void;
	
	// same with WebContents
	function print(?options: { ?silent:Bool, ?printBackground:Bool } ):Void;
	function printToPDF(options: { ?marginsType:Int, ?printBackground:Bool, ?printSelectionOnly:Bool, ?landscape:Bool }, callback:ElectronFunction):Void;
}
