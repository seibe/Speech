package speech.abstracts.common;

typedef LogDataPresenter = {
	name:String,
	?twitter:String,
	?google:String,
	?github:String
}
typedef LogDataAudience = {
	index:Int,
	name:String,
	?twitter:String,
}
typedef LogDataUrl = {
	index:Int,
	url:String
}
typedef LogDataAttachment = {
	index:Int,
	type:String,
	url:String,
	?name:String,
}
typedef LogDataPoint = {
	x:Float,
	y:Float,
	?width:Float,
	?height:Float
}
typedef LogDataComment = {
	text:String,
	user_name:String,
	comment_type:String
}
typedef LogDataActivity = {
	index:Int,
	time:Float,
	type:String,
	?comment:LogDataComment,
	?point:LogDataPoint,
	?slide_index:Int,
	?audience_index:Int,
	?attachment_index:Int,
	?activity_index:Int
}

typedef LogData =
{
	title:String,
	?description:String,
	time_begin:Float,
	time_end:Float,
	presenter:LogDataPresenter,
	audience:Array<LogDataAudience>,
	slide:Array<LogDataUrl>,
	attachment:Array<LogDataAttachment>,
	activity:Array<LogDataActivity>
}
