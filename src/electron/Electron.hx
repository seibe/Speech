package electron;

import haxe.extern.Rest;

/* Process object .............................. */

typedef ElectronProcess =
{
	var type:String;
	var versions:Map<String, String>;
	var resourcesPath:String;
}


/* app module .................................. */

@:enum
abstract ElectronAppEventType(String) to String
{
	var WILL_FINISH_LAUNCHING			= "will-finish-launching";
	var READY							= "ready";
	var WINDOW_ALL_CLOSED				= "window-all-closed";
	var BEFORE_QUIT						= "before-quit";
	var WILL_QUIT						= "will-quit";
	var QUIT							= "quit";
	var OPEN_FILE						= "open-file";
	var OPEN_URL						= "open-url";
	var ACTIVATE_WITH_NO_OPEN_WINDOWS	= "activate-with-no-open-windows";
	var BROWSER_WINDOW_BLUR				= "browser-window-blur";
	var BROWSER_WINDOW_FOCUS			= "browser-window-focus";
	var SELECT_CERTIFICATE				= "select-certificate";
	var GPU_PROCESS_CRASHED				= "gpu-process-crashed";
}

typedef ElectronAppTask =
{
	@:optional var program:String;
	@:optional var arguments:String;
	@:optional var title:String;
	@:optional var description:String;
	@:optional var iconPath:String;
	@:optional var iconIndex:Int;
}

typedef ElectronAppCommandLine =
{
	function appendSwitch(command:String, ?value:Dynamic):Void;
	function appendArgument(value:Dynamic):Void;
}

typedef ElectronAppDock =
{
	function bounce(?type:String):Int;
	function cancelBounce(id:Int):Void;
	function setBadge(text:String):Void;
	function getBadge():String;
	function hide():Void;
	function show():Void;
	function setMenu(menu:ElectronMenu):Void;
}

typedef ElectronApp =
{
	> ElectronEventEmitter,
	
	function quit():Void;
	function getPath(name:String):Dynamic;
	function setPath(name:String, path:String):Void;
	function getVersion():String;
	function getName():String;
	function resolveProxy(url:String, callback:ElectronFunction):Void;
	function addRecentDocument(path:String):Void;
	function clearRecentDocuments():Void;
	function setUserTasks(tasks:Array<ElectronAppTask>):Void;
	
	var commandLine(default, null):ElectronAppCommandLine;
	var dock(default, null):ElectronAppDock;
}


/* auto-updater module ......................... */

typedef ElectronAutoUpdater =
{
	function setFeedUrl(url:String):Void;
	function checkForUpdates():Bool;
}


/* browser-window module ....................... */

@:enum
abstract ElectronWebContentsEventType(String) to String {
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
	var WILL_NAVIGATE				= "will-navigate";
	var CRASHED						= "crashed";
	var PLUGIN_CRASHED				= "plugin-crashed";
	var DESTROYED					= "destroyed";
}

@:enum
abstract ElectronBrowserWindowEventType(String) to String
{
	var PAGE_TITLE_UPDATED		= "page-title-updated";
	var CLOSE					= "close";
	var CLOSED					= "closed";
	var UNRESPONSIVE			= "unresponsive";
	var RESPONSIVE				= "responsive";
	var BLUR					= "blur";
	var FOCUS					= "focus";
	var MAXIMIZE				= "maximize";
	var UNMAXIMIZE				= "unmaximize";
	var RESTORE					= "restore";
	var RESIZE					= "resize";
	var MOVE					= "move";
	var MOVED					= "moved"; // available only on OS X
	var ENTER_FULL_SCREEN		= "enter-full-screen";
	var LEAVE_FULL_SCREEN		= "leave-full-screen";
	var ENTER_HTML_FULL_SCREEN	= "enter-html-full-screen";
	var LEAVE_HTML_FULL_SCREEN	= "leave-html-full-screen";
	var DEVTOOLS_OPENED			= "devtools-opened";
	var DEVTOOLS_CLOSED			= "devtools-closed";
	var DEVTOOLS_FOCUSED		= "devtools-focused";
	var APP_COMMAND				= "app-command";
}

typedef ElectronWebContents =
{
	> ElectronEventEmitter,
	
	function loadUrl(url:String, ?options: { ?httpReferrer:String, ?userAgent:String } ):Void;
	function getUrl():String;
	function getTitle():String;
	function isLoading():Bool;
	function isWaitingForResponse():Bool;
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
	function hasServiceWorker(callback:ElectronFunction):Bool;
	function unregisterServiceWorker(callback:ElectronFunction):Bool;
	function print(?options: { ?silent:Bool, ?printBackground:Bool } ):Void;
	function printToPDF(options: { ?marginsType:Int, ?printBackground:Bool, ?printSelectionOnly:Bool, ?landscape:Bool }, callback:ElectronFunction):Void;
	function send(channel:String, args:Rest<Dynamic>):Void;
}


/* content-tracing module ...................... */

typedef ElectronContentTracing =
{
	function getCategories(callback:ElectronFunction):Void;
	function startRecording(categoryFilter:String, options:Int, callback:ElectronFunction):Void;
	function stopRecording(resultFilePath:String, callback:ElectronFunction):Void;
	function startMonitoring(categoryFilter:String, options:Int, callback:ElectronFunction):Void;
	function stopMonitoring(callback:ElectronFunction):Void;
	function captureMonitoringSnapshot(resultFilePath:String, callback:ElectronFunction):Void;
	function getTraceBufferUsage(callback:ElectronFunction):Void;
	function setWatchEventType(categoryName:String, EventTypeName:String, callback:ElectronFunction):Void;
	function cancelWatchEventType():Void;
}


/* dialog module ............................... */

@:enum
abstract ElectronDialogpProperty(String) to String
{
	var OPEN_FILE			= "openFile";
	var OPEN_DIRECTORY		= "openDirectory";
	var MULTI_SELECTIONS	= "multiSelections";
	var CREATE_DIRECTORY	= "createDirectory";
}

typedef ElectronDialogConfig =
{
	@optional var title:String;
	@optional var defaultPath:String;
	@optional var filters:Array<Dynamic>;
	@optional var properties:Array<String>;
}

typedef ElectronMessageBoxConfig =
{
	@optional var type:String;
	@optional var buttons:Array<String>;
	@optional var title:String;
	@optional var message:String;
	@optional var detail:String;
	@optional var icon:ElectronNativeImage;
}

typedef ElectronDialog =
{
	function showOpenDialog(?browserWindow:ElectronBrowserWindow, ?options:ElectronDialogConfig, ?callback:Array<String>->Void):Void;
	function showSaveDialog(?browserWindow:ElectronBrowserWindow, ?options:ElectronDialogConfig, ?callback:String->Void):Void;
	function showMessageBox(?browserWindow:ElectronBrowserWindow, ?options:ElectronMessageBoxConfig, ?callback:Dynamic->Void):Void;
	function showErrorBox(title:String, content:String):Void;
}


/* global-shortcut module ...................... */

typedef ElectronGlobalShortcut =
{
	function register(accelerator:ElectronAccelerator, callback:ElectronFunction):Void;
	function isRegistered(accelerator:ElectronAccelerator):Bool;
	function unregister(accelerator:ElectronAccelerator):Void;
	function unregisterAll():Void;
}


/* ipc module .................................. */

@:enum
abstract ElectronIpcEventType(String) to String
{
	var OPEN_FILE			= "openFile";
	var OPEN_DIRECTORY		= "openDirectory";
	var MULTI_SELECTIONS	= "multiSelections";
	var CREATE_DIRECTORY	= "createDirectory";
}

typedef ElectronIpcEvent =
{
	var returnValue(default, null):Dynamic;
	var sender(default, null):ElectronWebContents;
}

typedef ElectronIpc = 
{
	> ElectronEventEmitter,
	function send(channel:String, args:Rest<Dynamic>):Void;
	//function sendSync(channel:String, args:Rest<Dynamic>):Void; // should never use this API
	function sendToHost(channel:String, args:Rest<Dynamic>):Void;
}


/* power-monitor module ........................ */

typedef ElectronPowerMonitor = ElectronEventEmitter;


/* protocol module ............................. */

typedef ElectronProtocol =
{
	function registerProtocol(scheme:String, handler:Dynamic->Void):Void;
	function unregisterProtocol(scheme:String):Void;
	function registerStandardSchemes(value:Array<String>):Void;
	function isHandledProtocol(scheme:String):Bool;
	function interceptProtocol(scheme:String, handler:Dynamic->Void):Void;
	function uninterceptProtocol(scheme:String):Void;
	function RequestFileJob(path:String):Void;
	function RequestStringJob(options:{
		var data:ElectronBuffer;
		@optional var mimeType:String;
		@optional var encoding:String;
	}):Void;
	function RequestHttpJob(options: {
		var url:String;
		@optional var method:String;
		@optional var referrer:String;
	}):Void;
	function RequestErrorJob(code:Int):Void;
}


/* tray module ./////////....................... */

@:enum
abstract ElectronTrayEventType(String) to String
{
	var CLICKED			= "clicked";
	var DOUBLE_CLICKED	= "double-clicked";
	var BALLOON_SHOW	= "balloon-show";
	var BALLOON_CLICKED	= "balloon-clicked";
	var BALLOON_CLOSED	= "balloon-closed";
}


/* remote module ............................... */

typedef ElectronRemote =
{
	function require(module:String):Dynamic;
	function getCurrentWindow():ElectronBrowserWindow;
	function getCurrentWebContents():ElectronWebContents;
	function getGlobal(name:String):Dynamic;
	
	var process(default, null):ElectronProcess;
}


/* web-frame module ............................ */

typedef ElectronWebFrame =
{
	function setZoomFactor(factor:Float):Void;
	function getZoomFactor():Float;
	function setZoomLevel(level:Float):Void;
	function getZoomLevel():Float;
	function setSpellCheckProvider(language:String, autoCorrectWord:Bool, provider: { spellCheck:ElectronFunction } ):Void;
	function registerUrlSchemeAsSecure(scheme:String):Void;
}


/* clipboard module ............................ */

typedef ElectronClipboard =
{
	function readText(?type:String):String;
	function writeText(text:String, ?type:String):Void;
	function readHtml(?type:String):Dynamic;
	function readImage(?type:String):ElectronNativeImage;
	function writeImage(image:ElectronNativeImage, ?type:String):Void;
	function clear(?type:String):Void;
	function availableFormats(?type:String):Array<Dynamic>;
	//function has(data:String, ?type:String):Bool; // be removed in future
	//function read(data:String, ?type:String):Dynamic; // be removed in future
}


/* crash-reporter module ....................... */

typedef ElectronCrashReporter =
{
	function start(options: {
		@optional var productName:String;
		@optional var companyName:String;
		@optional var submitUrl:String;
		@optional var autoSubmit:Bool;
		@optional var ignoreSystemCrashHandler:Bool;
		@optional var extra:Dynamic;
	}):Void;
	function getLastCrashReport():Dynamic;
	function getUploadedReports():Dynamic;
}


/* screen module ............................... */

@:enum
abstract ElectronScreenEventType(String) to String
{
	var DISPLAY_ADDED			= "display-added";
	var DISPLAY_REMOVED			= "display-removed";
	var DISPLAY_METRICS_CHANGED	= "display-metrics-changed";
}

typedef ElectronScreen =
{
	> ElectronEventEmitter,
	
	function getCursorScreenPoint():{x:Int, y:Int};
	function getPrimaryDisplay():Dynamic;
	function getAllDisplays():Array<Dynamic>;
	function getDisplayNearestPoint(point: { x:Int, y:Int } ):Dynamic;
	function getDisplayMatching(rect: { x:Int, y:Int, width:Int, height:Int } ):Dynamic;
}


/* shell module ................................ */

typedef ElectronShell =
{
	function showItemInFolder(fullPath:String):Void;
	function openItem(fullPath:String):Void;
	function openExternal(url:String):Void;
	function moveItemToTrash(fullPath:String):Void;
	function beep():Void;
}


/* others ...................................... */

typedef ElectronFunction = Dynamic;
typedef ElectronAccelerator = String;
typedef ElectronEventEmitter = {
	function addListener(event:String, fn:ElectronFunction):Dynamic;
	function on(event:String, fn:ElectronFunction):Dynamic;
	function once(event:String, fn:ElectronFunction):Void;
	function removeListener(event:String, listener:ElectronFunction):Void;
	function removeAllListeners(event:String):Void;
	function listeners(event:String):Array<ElectronFunction>;
	function setMaxListeners(m:Int):Void;
	function emit(event:String, ?args:Rest<Dynamic>):Void;
}
//typedef ElectronBuffer = NodeBuffer;
typedef ElectronBuffer = Dynamic;


/* Electron helper ............................. */

class Electron
{
	// Modules for the main
	public static var app(get, null):ElectronApp;
	public static var autoUpdater(get, null):ElectronAutoUpdater;
	public static var contentTracing(get, null):ElectronContentTracing;
	public static var dialog(get, null):ElectronDialog;
	public static var globalShortcut(get, null):ElectronGlobalShortcut;
	public static var ipc(get, null):ElectronIpc;
	public static var powerMonitor(get, null):ElectronPowerMonitor;
	public static var protocol(get, null):ElectronProtocol;
	
	// Modules for the renderer process
	public static var remote(get, null):ElectronRemote;
	public static var remoteApp(get, null):ElectronApp;
	public static var remoteAutoUpdater(get, null):ElectronAutoUpdater;
	public static var remoteContentTracing(get, null):ElectronContentTracing;
	public static var remoteDialog(get, null):ElectronDialog;
	public static var remoteGlobalShortcut(get, null):ElectronGlobalShortcut;
	public static var remoteIpc(get, null):ElectronIpc;
	public static var remotePowerMonitor(get, null):ElectronPowerMonitor;
	public static var remoteProtocol(get, null):ElectronProtocol;
	public static var remoteClipboard(get, null):ElectronClipboard;
	public static var remoteCrashReporter(get, null):ElectronCrashReporter;
	public static var remoteScreen(get, null):ElectronScreen;
	public static var remoteShell(get, null):ElectronShell;
	public static var webFrame(get, null):ElectronWebFrame;
	
	// Modules for both processes
	public static var clipboard(get, null):ElectronClipboard;
	public static var crashReporter(get, null):ElectronCrashReporter;
	public static var screen(get, null):ElectronScreen;
	public static var shell(get, null):ElectronShell;
	
	// require methods
	public static var require(default, null):String->Dynamic = untyped __js__('require');
	public static var remoteRequire(default, null):String->Dynamic = untyped __js__('require("remote").require');
	
	static inline function get_app():ElectronApp return require("app");
	static inline function get_autoUpdater():ElectronAutoUpdater return require("auto-updater");
	static inline function get_contentTracing():ElectronContentTracing return require("content-tracing");
	static inline function get_dialog():ElectronDialog return require("dialog");
	static inline function get_globalShortcut():ElectronGlobalShortcut return require("global-shortcut");
	static inline function get_ipc():ElectronIpc return require("ipc");
	static inline function get_powerMonitor():ElectronPowerMonitor return require("power-monitor");
	static inline function get_protocol():ElectronProtocol return require("protocol");
	static inline function get_remote():ElectronRemote return require("remote");
	static inline function get_remoteApp():ElectronApp return remoteRequire("app");
	static inline function get_remoteAutoUpdater():ElectronAutoUpdater return remoteRequire("auto-updater");
	static inline function get_remoteContentTracing():ElectronContentTracing return remoteRequire("content-tracing");
	static inline function get_remoteDialog():ElectronDialog return remoteRequire("dialog");
	static inline function get_remoteGlobalShortcut():ElectronGlobalShortcut return remoteRequire("global-shortcut");
	static inline function get_remoteIpc():ElectronIpc return remoteRequire("ipc");
	static inline function get_remotePowerMonitor():ElectronPowerMonitor return remoteRequire("power-monitor");
	static inline function get_remoteProtocol():ElectronProtocol return remoteRequire("protocol");
	static inline function get_remoteClipboard():ElectronClipboard return remoteRequire("clipboard");
	static inline function get_remoteCrashReporter():ElectronCrashReporter return remoteRequire("crash-reporter");
	static inline function get_remoteScreen():ElectronScreen return remoteRequire("screen");
	static inline function get_remoteShell():ElectronShell return remoteRequire("shell");
	static inline function get_webFrame():ElectronWebFrame return require("web-frame");
	static inline function get_clipboard():ElectronClipboard return require("clipboard");
	static inline function get_crashReporter():ElectronCrashReporter return require("crash-reporter");
	static inline function get_screen():ElectronScreen return require("screen");
	static inline function get_shell():ElectronShell return require("shell");
}