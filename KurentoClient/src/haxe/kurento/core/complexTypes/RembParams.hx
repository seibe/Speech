package kurento.core.complexTypes;

extern class RembParams
{
	var packetsRecvIntervalTop:Int;
	var exponentialFactor:Float;
	var linealFactorMin:Int;
	var linealFactorGrade:Float;
	var decrementFactor:Float;
	var thresholdFactor:Float;
	var upLosses:Int;
	var rembOnConnect:Int;
	function new():Void;
}
