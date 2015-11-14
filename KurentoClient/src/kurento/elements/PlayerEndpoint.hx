package kurento.elements;

import js.Error;
import js.Promise;
import kurento.core.abstracts.UriEndpoint;
import kurento.core.MediaPipeline;

typedef PlayerEndpointOption = {
	var mediaPipeline:MediaPipeline;
	var uri:String;
	@:optional var useEncodedMedia:Bool;
}

extern class PlayerEndpoint extends UriEndpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function play(?callback:Error->Void):Promise<Dynamic>;
}
