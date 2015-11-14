package kurento.kurentoClient;
import js.Error;
import js.Promise;
import kurento.core.abstracts.MediaObject;

extern class MediaObjectCreator<T>
{
	function new(host:Dynamic, encodeCreate:Dynamic, encodeRpc:Dynamic, encodeTransaction:Dynamic, describe:Dynamic):Void;
	
	@:overload(function<T>(type:String, ?callback:Error->T->Void):Promise<T>{})
	function create<T>(type:String, params:Dynamic, ?callback:Error->T->Void):Promise<T>;
	
	function createInmediate(item:Dynamic):Dynamic;
}
