package electron;
import electron.Electron;

extern class ElectronNativeImage extends String
{
	static function createEmpty():ElectronNativeImage;
	static function createFromPath(path:String):ElectronNativeImage;
	static function createFromBuffer(buffer:ElectronBuffer, ?scaleFactor:Float):ElectronNativeImage;
	static function createFromDataUrl(dataUrl:String):ElectronNativeImage;
	
	function toPng():ElectronBuffer;
	function toJpeg(quality:Int):ElectronBuffer;
	function toDataUrl():String;
	function isEmpty():Bool;
	function getSize():Dynamic;
	function setTemplateImage(option:Bool):Void;
}