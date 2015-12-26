package kurento.core.abstracts;

import js.Error;
import js.node.events.EventEmitter;
import js.Promise;
import kurento.core.complexTypes.Tag;
import kurento.core.MediaPipeline;

extern class MediaObject extends EventEmitter<MediaObject>
{
	static var constructorParams:Dynamic;
	static var events:Array<String>;
	
	// Public methods
	function addTag(key:String, value:String, ?callback:Error->Void):Promise<Dynamic>;
	function getTag(key:String, ?callback:Error->String->Void):Promise<String>;
	function getTags(?callback:Error->Tag->Void):Promise<Tag>;
	function removeTag(key:String, ?callback:Error->Void):Promise<Dynamic>;
	
	// Public properties
	function getChilds(?callback:Error->MediaObject->Void):Promise<MediaObject>;
	function getCreationTime(?callback:Error->Int->Void):Promise<Int>;
	function getMediaPipeline(?callback:Error->MediaPipeline->Void):Promise<MediaPipeline>;
	function getName(?callback:Error->String->Void):Promise<String>;
	function getParent(?callback:Error->MediaPipeline->Void):Promise<MediaPipeline>;
	function getSendTagsInEvents(?callback:Error->Bool->Void):Promise<Bool>;
	function setName(name:String, ?callback:Error->Tag->Void):Promise<Tag>;
	function setSendTagsInEvents(sendTagsInEvent:Bool, ?callback:Error->Tag->Void):Promise<Tag>;
	function release():Void;
}
