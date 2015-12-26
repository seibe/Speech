package kurento.kurentoClient;

import haxe.extern.Rest;
import haxe.extern.EitherType;
import js.Error;
import js.Promise;
import kurento.core.abstracts.MediaObject;
import kurento.core.abstracts.ServerManager;

typedef KurentoClientDict = {
	@:optional var failAfter:Int;
	@:optional var enableTransactions:Bool;
	@:optional var strict:Bool;
	@:optional var access_token:String;
	@:optional var max_retries:Int;
	@:optional var request_timeout:Int;
	@:optional var response_timeout:Int;
	@:optional var duplicates_timeout:Int;
}

@:native("kurento")
@:jsRequire('kurento-client')
extern class KurentoClient extends Promise<KurentoClient>
{
	static function getSingleton(ws_uri:String, ?options:KurentoClientDict, ?callback:Error->KurentoClient->Void):Promise<KurentoClient>;
	
	function new(ws_uri:String, ?options:KurentoClientDict, ?callback:Error->KurentoClient->Void):Void;
	
	function close():Void;
	function connect(media:EitherType<MediaObject, Array<MediaObject> >, ?callback:Error->Void):Promise<Dynamic>;
	
	function getMediaobjectById<T>(id:EitherType<String, Array<String> >, callback:Error->T->Void):Promise<T>;
	function getServerManager(callback:Error->ServerManager->Void):Promise<ServerManager>;
	
	// bind MediaObjectCreator
	@:overload(function<T>(type:String, ?callback:Error->T->Void):Promise<T>{})
	function create<T>(type:String, params:Dynamic, ?callback:Error->T->Void):Promise<T>;
}
