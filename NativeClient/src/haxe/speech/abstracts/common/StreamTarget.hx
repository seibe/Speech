package speech.abstracts.common;

/**
 * 配信映像の録画対象
 */
@:enum
abstract StreamTarget(String) to String from String
{
	var WEBCAM = "webcam";
	var DESKTOP = "desktop";
}
