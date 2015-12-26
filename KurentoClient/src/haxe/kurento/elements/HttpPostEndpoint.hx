package kurento.elements;

import js.Error;
import js.Promise;
import kurento.core.MediaPipeline;
import kurento.elements.abstracts.HttpEndpoint;

typedef HttpPostEndpointOption = {
	var mediaPipeline:MediaPipeline;
	@:optional var disconnectoinTimeout:Int;
	@:optional var useEncodedMedia:Bool;
}

extern class HttpPostEndpoint extends HttpEndpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function getUrl(?callback:Error->String->Void):Promise<String>;
}
