package speech.abstracts;
import speech.abstracts.ActivityType;

/**
 * プレゼンテーション内での活動を表すクラス
 */
class Activity
{
	/**
	 * タイムスタンプ
	 */
	public var time:Float;
	
	/**
	 * 種別
	 */
	public var type:ActivityType;
	
	public function new(actType:ActivityType)
	{
		time = Date.now().getTime();
		type = actType;
	}
}
