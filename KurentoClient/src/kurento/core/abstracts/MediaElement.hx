package kurento.core.abstracts;

import js.Error;
import js.Promise;
import kurento.core.complexTypes.AudioCaps;
import kurento.core.complexTypes.ElementConnectionData;
import kurento.core.complexTypes.MediaType;
import kurento.core.complexTypes.Stats;
import kurento.core.complexTypes.VideoCaps;

extern class MediaElement extends MediaObject
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function connect(sink:MediaElement, ?mediaType:MediaType, ?sourceMediaDescription:String, ?sinkMediaDescription:String, ?callback:Error->Void):Promise<Dynamic>;
	function disconnect(sink:MediaElement, ?mediaType:MediaType, ?sourceMediaDescription:String, ?sinkMediaDescription:String, ?callback:Error->Void):Promise<Dynamic>;
	function getGstreamerDot(?details:Dynamic, ?callback:Error->String->Void):Promise<String>;
	function getSinkConnections(?mediaType:MediaType, ?description:String, ?callback:Error->ElementConnectionData->Void):Promise<ElementConnectionData>;
	function getSourceConnections(?mediaType:MediaType, ?description:String, ?callback:Error->ElementConnectionData->Void):Promise<ElementConnectionData>;
	function getStats(?mediaType:MediaType, ?callback:Error->{ str:String, stats:Stats }->Void):Promise<{ str:String, stats:Stats }>;
	function setAudioFormat(caps:AudioCaps, ?callback:Error->Void):Promise<Dynamic>;
	function setOutputBitrate(bitrate:Int, ?callback:Error->Void):Promise<Dynamic>;
	function setVideoFormat(caps:VideoCaps, ?callback:Error->Void):Promise<Dynamic>;
	
	// Public properties
	function getMaxOuputBitrate(?callback:Error->Int->Void):Promise<Int>;
	function setMaxOuputBitrate(maxOuputBitrate:Int, ?callback:Error->Void):Promise<Dynamic>;
	function getMinOuputBitrate(?callback:Error->Int->Void):Promise<Int>;
	function setMinOuputBitrate(minOuputBitrate:Int, ?callback:Error->Void):Promise<Dynamic>;
}
