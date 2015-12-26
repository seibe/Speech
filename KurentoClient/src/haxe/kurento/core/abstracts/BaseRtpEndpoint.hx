package kurento.core.abstracts;

import js.Error;
import js.Promise;
import kurento.core.complexTypes.ConnectionState;
import kurento.core.complexTypes.MediaState;
import kurento.core.complexTypes.RembParams;

extern class BaseRtpEndpoint extends SdpEndpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public properties
	function getConnectionState(?callback:Error->ConnectionState->Void):Promise<ConnectionState>;
	function getMaxVideoSendBandwidth(?callback:Error->Int->Void):Promise<Int>;
	function setMaxVideoSendBandwidth(maxVideoSendBandwidth:Int, ?callback:Error->Void):Promise<Dynamic>;
	function getMediaState(?callback:Error->MediaState->Void):Promise<MediaState>;
	function getMinVideoRecvBandwidth(?callback:Error->Int->Void):Promise<Int>;
	function setMinVideoRecvBandwidth(minVideoRecvBandwidth:Int, ?callback:Error->Void):Promise<Dynamic>;
	function getMinVideoSendBandwidth(?callback:Error->Int->Void):Promise<Int>;
	function setMinVideoSendBandwidth(minVideoSendBandwidth:Int, ?callback:Error->Void):Promise<Dynamic>;
	function getRembParams(?callback:Error->RembParams->Void):Promise<RembParams>;
	function setRembParams(rembParams:RembParams, ?callback:Error->Void):Promise<Dynamic>;
}
