package electron;

import js.html.HtmlElement;

@:native("js.html.DialogElement")
extern class DialogElement extends HtmlElement
{
	var open:Bool;
	var returnValue:String;
	function show(?anchor:Dynamic):Void;
	function showModal(?anchor:Dynamic):Void;
	function close(?returnValue:String):Void;
}