package speech.abstracts.common;

/**
 * コメント種別
 */
@:enum
abstract CommentType(String) to String from String
{
	var NORMAL = "normal";
	var QUESTION = "question";
	var STAMP_PLUS = "stamp_plus";
	var STAMP_CLAP = "stamp_clap";
	var STAMP_HATENA = "stamp_hatena";
	var STAMP_WARAI = "stamp_warai";
}
