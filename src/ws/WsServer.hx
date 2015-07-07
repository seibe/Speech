package ws;
import js.Node.NodeHttpServer;
import js.Node.NodeHttpServerReq;

@:enum
abstract WsSocketState(String) to String
{
	var CONNECTING	= "connecting";
	var OPEN		= "open";
	var CLOSING		= "closing";
	var CLOSED		= "closed";
}

@:enum
abstract WsSocketEventType(String) to String
{
	var OPEN = "open";
	var ERROR = "error";
	var CLOSE = "close";
	var MESSAGE = "message";
	var PING = "ping";
	var PONG = "pong";
}

@:enum
abstract WsServerEventType(String) to String
{
	var ERROR = "error";
	var HEADERS = "headers";
	var CONNECTION = "connection";
}

typedef WsSocketFlags =
{
	var masked:Bool;
	var buffer:Dynamic;
	var binary:Bool;
}

typedef WsSocket =
{
	var bytesReceived:Dynamic;
	var readyState:String;
	var protocolVersion:Dynamic;
	// var url:Dynamic; *only for client
	var supports:Dynamic;
	//var onopen(null,default):Dynamic; *only for client
	var onerror(null,default):Dynamic;
	var onclose(null,default):Dynamic;
	var onmessage(null,default):Dynamic;
	function close(?code:Dynamic, ?data:Dynamic):Void;
	function pause():Void;
	function ping(?data:Dynamic, ?options:Dynamic, ?dontFailWhenClosed:Dynamic):Void;
	function pong(?data:Dynamic, ?options:Dynamic, ?dontFailWhenClosed:Dynamic):Void;
	function resume():Void;
	function send(data:Dynamic, ?options:Dynamic, ?callback:Dynamic):Void;
	function stream(?options:Dynamic, ?callback:Dynamic):Void;
	function terminate():Void;
	
	// extends EventEmitter
	function addListener(event:String,fn:Dynamic):Dynamic;
	function on(event:String,fn:Dynamic):Dynamic;
	function once(event:String,fn:Dynamic):Void;
	function removeListener(event:String,listener:Dynamic):Void;
	function removeAllListeners(event:String):Void;
	function listeners(event:String):Array<Dynamic>;
	function setMaxListeners(m:Int):Void;
	function emit(event:String,?arg1:Dynamic,?arg2:Dynamic,?arg3:Dynamic):Void;
}

typedef WsServerConfig =
{
	@:optional var host:String;
	@:optional var port:Int;
	@:optional var server:NodeHttpServer;
	@:optional var verifyClient:Dynamic;
	@:optional var handleProtocols:Dynamic;
	@:optional var path:String;
	@:optional var noServer:Bool;
	@:optional var disableHixie:Bool;
	@:optional var clientTracking:Bool;
}

@:jsRequire('ws', 'Server')
extern class WsServer
{
    function new(?options:WsServerConfig, ?callback:Dynamic):Void;
	
	var clients:Array<WsSocket>;
	
	function close():Void;
	function handleUpgrade(request:NodeHttpServerReq, ?socket:Dynamic, ?upgradeHead:Dynamic, ?callback:Dynamic):Void;
	
	// extends EventEmitter
	function addListener(event:String, listener:Dynamic):Dynamic;
	function on(event:String, listener:Dynamic):Dynamic;
	function once(event:String, listener:Dynamic):Void;
	function removeListener(event:String, listener:Dynamic):Void;
	function removeAllListeners(event:String):Void;
	function listeners(event:String):Array<Dynamic>;
	function setMaxListeners(m:Int):Void;
	function emit(event:String, args:haxe.extern.Rest<Dynamic>):Void;
	function broadcast(data:Dynamic):Void;
}
