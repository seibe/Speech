package kurento.core;

import js.Error;
import js.Promise;
import kurento.core.abstracts.MediaElement;
import kurento.core.abstracts.MediaObject;
import kurento.core.complexTypes.GstreamerDotDetails;

extern class MediaPipeline extends MediaObject
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function getGstreamerDot(?details:GstreamerDotDetails, ?callback:Error->String->Void):Promise<String>;
	function connect(pairElements:Array<MediaElement>, ?callback:Error->Void):Promise<Dynamic>;
	
	// Public properties
	function getLatencyStats(?callback:Error->Bool->Void):Promise<Bool>;
	function setLatencyStats(latencyStats:Bool, ?callback:Error->Void):Promise<Dynamic>;
	
	// bind MediaObjectCreater
	@:overload(function<T>(type:String, ?callback:Error->T->Void):Promise<T>{})
	function create<T>(type:String, params:Dynamic, ?callback:Error->T->Void):Promise<T>;
	
	// bind TransactionsManager
	function beginTransaction():Dynamic;
	function endTransaction():Dynamic;
	
	@:native("transaction")
	function Transaction():Dynamic;
}
