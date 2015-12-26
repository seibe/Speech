package kurento.elements;

import js.Error;
import js.Promise;
import kurento.core.abstracts.UriEndpoint;
import kurento.core.MediaPipeline;

typedef RecorderEndpointOption = {
	var mediaPipeline:MediaPipeline;
	var uri:String;
	@:optional var mediaProfile:Dynamic;
	@:optional var stopOnEndOfStream:Bool;
}

extern class RecorderEndpoint extends UriEndpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function record(?callback:Error->Void):Promise<Dynamic>;
}
