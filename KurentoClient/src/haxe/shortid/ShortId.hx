package shortId;

@:jsRequire('shortid')
extern class ShortId
{
	static function generate():String;
	static function characters(string:String):Void;
	static function isValid(id:String):Bool;
	static function worker(integer:Int):Void;
	static function seed(integer:Int):Void;
}
