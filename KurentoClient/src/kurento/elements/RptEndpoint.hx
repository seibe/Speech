package kurento.elements;

import kurento.core.abstracts.SdpEndpoint;
import kurento.core.MediaPipeline;

typedef RtpEndpointOption = {
	var mediaPipeline:MediaPipeline;
}

extern class RptEndpoint extends SdpEndpoint
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
}
