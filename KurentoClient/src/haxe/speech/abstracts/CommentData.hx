package speech.abstracts;
import js.html.URL;
import speech.abstracts.common.CommentType;
import speech.abstracts.User.UUuid;

typedef CommentData =
{
	type:CommentType,
	text:String,
	pageUrl:String,
	userId:UUuid,
	?name:String,
	?point:{ x:Float, y:Float, ?width:Float, ?height:Float }
}
