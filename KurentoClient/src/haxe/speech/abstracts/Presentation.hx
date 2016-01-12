package speech.abstracts;
import shortId.ShortId;
import speech.abstracts.User.UUuid;

/**
 * プレゼンテーションの固有番号を表すクラス
 */
typedef PUuid = Uuid;

/**
 * プレゼンテーションを表すクラス
 */
class Presentation
{
	/**
	 * プレゼンテーションの固有番号
	 * アプリ内で必ず一意でなければならない
	 */
	public var id(default, null):PUuid;
	
	/**
	 * プレゼンテーションの招待用識別子
	 */
	public var shortId(default, null):String;
	
	/**
	 * 発表者の固有番号
	 */
	public var presenterId:UUuid;
	
	/**
	 * 聴衆の固有番号リスト
	 */
	public var audienceIds:Array<UUuid>;
	
	/**
	 * 発表タイトル
	 * 未設定の場合はnull
	 */
	public var title:String;
	
	/**
	 * スライド資料のURLリスト。0番目は1ページ目を表す
	 */
	public var slideUrls:Array<String>;
	
	/**
	 * 配信映像のリスト
	 */
	public var streams:Array<Stream>;
	
	/**
	 * 活動のリスト
	 */
	public var activities:Array<Activity>;
	
	public function new()
	{
		id = Uuid.generate();
		shortId = ShortId.generate();
		presenterId = null;
		audienceIds = new Array<UUuid>();
		title = null;
		slideUrls = new Array<String>();
		streams = new Array<Stream>();
		activities = new Array<Activity>();
	}
}
