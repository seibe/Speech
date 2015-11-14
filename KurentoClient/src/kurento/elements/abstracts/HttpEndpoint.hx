package kurento.elements.abstracts;

import js.Error;
import js.Promise;
import kurento.core.abstracts.SessionEndpoint;

extern class HttpEndpoint extends SessionEndpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function getUrl(?callback:Error->String->Void):Promise<String>;
}
