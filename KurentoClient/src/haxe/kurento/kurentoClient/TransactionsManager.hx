package kurento.kurentoClient;

extern class TransactionsManager
{
	function new(host:Dynamic, commit:Dynamic):Void;
	
	function beginTransaction():Dynamic;
	function endTransaction():Dynamic;
	
	@:native("transaction")
	function Transaction():Dynamic;
}
