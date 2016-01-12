package speech.abstracts;
import speech.abstracts.User.UserType;
import ws.WsServer.WsSocket;

/**
 * 聴衆を表すクラス
 */
class Audience extends User
{
	/**
	 * 聴衆のコンストラクタ
	 * @param	pid	聴衆が属するプレゼンテーションの固有番号
	 * @param	ws 聴衆のWSセッション
	 */
	public function new(pid:Uuid, ws:WsSocket)
	{
		super(UserType.AUDIENCE, pid, ws);
	}
}
