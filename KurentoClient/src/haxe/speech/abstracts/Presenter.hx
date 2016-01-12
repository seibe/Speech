package speech.abstracts;
import kurento.elements.RecorderEndpoint;
import speech.abstracts.User.UserType;
import ws.WsServer.WsSocket;

/**
 * 発表者を表すクラス
 */
class Presenter extends User
{
	/**
	 * メディアサーバーの録画先情報
	 * 非録画時はnullとなる
	 */
	public var recorder:RecorderEndpoint;
	
	/**
	 * 配信映像の情報
	 * 非配信時はnullとなる
	 */
	public var stream:Stream;
	
	/**
	 * 発表者のコンストラクタ
	 * @param	pid	発表者が属するプレゼンテーションの固有番号
	 * @param	ws 発表者のWSセッション
	 */
	public function new(pid:Uuid, ws:WsSocket)
	{
		super(UserType.PRESENTER, pid, ws);
		recorder = null;
		stream = null;
	}
}
