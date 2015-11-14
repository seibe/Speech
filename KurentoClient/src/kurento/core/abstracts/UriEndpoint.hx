package kurento.core.abstracts;

import js.Error;
import js.Promise;

extern class UriEndpoint extends Endpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function pause(?callback:Error->Void):Promise<Dynamic>;
	function stop(?callback:Error->Void):Promise<Dynamic>;
	
	// Public properties
	function getUri(?callback:Error->String->Void):Promise<String>;
}
