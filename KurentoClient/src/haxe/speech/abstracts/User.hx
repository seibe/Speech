package speech.abstracts;
import kurento.core.MediaPipeline;
import kurento.elements.WebRtcEndpoint;
import speech.abstracts.Presentation.PUuid;
import ws.WsServer.WsSocket;

/**
 * ユーザーの固有番号を表すクラス
 */
typedef UUuid = Uuid;

/**
 * ユーザーの種類を表す列挙型
 */
enum UserType {
	PRESENTER;
	AUDIENCE;
}

/**
 * ユーザーを表すクラス
 */
class User
{
	/**
	 * ユーザーの固有番号
	 * アプリ内で必ず一意でなければならない
	 */
	public var id(default, null):UUuid;
	
	/**
	 * ユーザーが属する発表番号
	 */
	public var presentationId(default, null):PUuid;
	
	/**
	 * ユーザーの種別
	 */
	public var type(default, null):UserType;
	
	/**
	 * ユーザーが既に削除対象となっているか否か
	 */
	public var deleted:Bool;
	
	/**
	 * ユーザーが任意に設定可能な表示名
	 * 未設定の場合はnullとなる
	 */
	public var name:String;
	
	/**
	 * ユーザーと接続するWSセッション
	 * 切断後はnullとなる
	 */
	public var socket:WsSocket;
	
	/**
	 * メディアサーバーへの経路情報
	 * 非接続試行時はnullとなる
	 */
	public var candidatesQueue:Array<Dynamic>;
	
	/**
	 * メディアサーバーとの接続情報
	 * 未接続および切断後はnullとなる
	 */
	public var pipeline:MediaPipeline;
	
	/**
	 * メディアサーバーの終端情報
	 * 未接続および切断後はnullとなる
	 */
	public var endpoint:WebRtcEndpoint;
	
	/**
	 * ユーザーのコンストラクタ
	 * @param	utype ユーザー種別
	 * @param	pid ユーザーが属するプレゼンテーションの固有番号
	 */
	private function new(utype:UserType, pid:Uuid, ws:WsSocket)
	{
		id = Uuid.generate();
		presentationId = pid;
		type = utype;
		deleted = false;
		name = null;
		socket = ws;
		candidatesQueue = null;
		pipeline = null;
		endpoint = null;
	}
}
