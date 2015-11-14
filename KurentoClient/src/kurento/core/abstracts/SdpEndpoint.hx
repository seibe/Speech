package kurento.core.abstracts;

import js.Error;
import js.Promise;

extern class SdpEndpoint extends SessionEndpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function generateOffer(?callback:Error->String->Void):Promise<String>;
	function getLocalSessionDescriptor(?callback:Error->String->Void):Promise<String>;
	function getRemoteSessionDescriptor(?callback:Error->String->Void):Promise<String>;
	function processAnswer(answer:String, ?callback:Error->String->Void):Promise<String>;
	function processOffer(offer:String, ?callback:Error->String->Void):Promise<String>;
	
	// Public properties
	function getMaxVideoRecvBandwidth(?callback:Error->Int->Void):Promise<Int>;
	function setMaxVideoRecvBandwidth(maxVideoRecvBandwidth:Int, ?callback:Error->Void):Promise<Dynamic>;
}
