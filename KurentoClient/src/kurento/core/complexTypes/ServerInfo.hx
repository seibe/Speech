package kurento.core.complexTypes;

extern class ServerInfo
{
	function new():Void;
	var version:String;
	var modules:ModuleInfo;
	var type:ServerType;
	var capabilties:String;
}
