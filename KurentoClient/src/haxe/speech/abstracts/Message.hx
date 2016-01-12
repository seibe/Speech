package speech.abstracts;
import haxe.Json;
import speech.abstracts.common.MessageType.ServerMessageType;

/**
 * WebSocketで通信するメッセージデータを生成するクラス
 */
class Message
{
	public static function generate(type:ServerMessageType, ?data:Dynamic):String
	{
		return Json.stringify({
			type: type,
			data: data,
			timestamp: Date.now().getTime()
		});
	}
}
