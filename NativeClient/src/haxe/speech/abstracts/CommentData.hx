package speech.abstracts;
import js.html.URL;
import speech.abstracts.common.CommentType;

typedef CommentData =
{
	type:CommentType,
	text:String,
	pageUrl:URL,
	?userId:Int,
	?name:String,
	?point:{ x:Float, y:Float, ?width:Float, ?height:Float }
}
