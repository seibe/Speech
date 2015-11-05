package electron;

@:native("MediaStreamTrack")
extern class MediaStreamTrack
{
	static function getSources(callback:Array<MediaStreamTrack>->Void):Void;
	
	var id:String;
	var label:String;
	var kind:String;
	var facing:Bool;
}
