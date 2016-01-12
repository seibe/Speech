package speech.abstracts;

/**
 * プレゼンテーション内での活動種別
 */
enum ActivityType {
	INITIALIZE; //発表者が記録を開始した
	FINALIZE; //発表者が記録を終了した
	JOIN(index:Int); //聴衆が参加した
	LEAVE(index:Int); //聴衆が離脱した
	UPDATE_SLIDE(index:Int); //スライド資料のページを更新した
	STREAM_BEGIN(index:Int); //映像配信を始めた
	STREAM_END(index:Int); //映像配信を終えた
	COMMENT(data:CommentData); //コメントした
}
