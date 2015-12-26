package kurento.elements;

import js.Error;
import js.html.rtc.IceCandidate;
import js.Promise;
import kurento.core.abstracts.BaseRtpEndpoint;
import kurento.core.MediaPipeline;

typedef WebRtcEndpointOption = {
	var mediaPipeline:MediaPipeline;
	@:optional var useDataChannels:Bool;
}

extern class WebRtcEndpoint extends BaseRtpEndpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public properties
	function getStunServerAddress(?callback:Error->String->Void):Promise<String>;
	function setStunServerAddress(stunServerAddress:String, ?callback:Error->Void):Promise<Dynamic>;
	function getStunServerPort(?callback:Error->Int->Void):Promise<Int>;
	function setStunServerPort(stunServerPort:Int, ?callback:Error->Void):Promise<Dynamic>;
	function getTurnUrl(?callback:Error->String->Void):Promise<String>;
	function setTurnUrl(turnUrl:String, ?callback:Error->Void):Promise<Dynamic>;
	function addIceCandidate(candidate:IceCandidate, ?callback:Error->Void):Promise<Dynamic>;
	function gatherCandidates(?callback:Error->Void):Promise<Dynamic>;
}
