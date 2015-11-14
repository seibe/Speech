package kurento.core.complexTypes;
import kurento.core.abstracts.MediaElement;

extern class ElementConnectionData
{
	var source:MediaElement;
	var sink:MediaElement;
	var type:MediaType;
	var sourceDescription:String;
	var sinkDescription:String;
	function new():Void;
}
