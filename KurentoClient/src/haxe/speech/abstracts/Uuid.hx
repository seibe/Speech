package speech.abstracts;

/**
 * 固有識別子を扱うクラス
 */
class Uuid
{
	private static var _nextId:Int = 0;
	
	/**
	 * 同一実行内で一意な識別子を生成する
	 * @return 生成された固有識別子
	 */
	public static function generate():Uuid
	{
		var temp = new Uuid(_nextId);
		_nextId++;
		return temp;
	}
	
	private var _id:Int;
	
	/**
	 * 固有識別子のコンストラクタ。外部からは呼び出せない
	 * @param	value	generate関数で生成した整数値
	 */
	private function new(value:Int)
	{
		_id = value;
	}
	
	public function toInt():Int {
		return _id;
	}
	
	public function toString():String {
		return '$_id';
	}
}
