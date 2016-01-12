package speech.abstracts;
import shortId.ShortId;
import speech.abstracts.common.StreamTarget;

class Stream
{
	public var target:StreamTarget;
	public var filename:String;
	
	public function new(target:StreamTarget):Void
	{
		this.target = target;
		this.filename = ShortId.generate() + ".webm";
	}
}
