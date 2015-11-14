package kurento.core.abstracts;

import js.Error;
import js.Promise;
import kurento.core.complexTypes.ServerInfo;

extern class ServerManager extends MediaObject
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function getKmd(moduleName:String, ?callback:Error->String->Void):Promise<String>;
	
	// Public properties
	function getInfo(?callback:Error->ServerInfo->Void):Promise<ServerInfo>;
	function getMetadata(?callback:Error->String->Void):Promise<String>;
	function getPipelines(?callback:Error->MediaPipeline->Void):Promise<MediaPipeline>;
	function getSessions(?callback:Error->String->Void):Promise<String>;
}
