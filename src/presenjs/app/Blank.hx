package presenjs.app;
import js.Browser;
import js.html.ButtonElement;
import js.html.InputElement;

class Blank
{
	static function main() 
	{
		new Blank();
	}
	
	public function new()
	{
		Browser.window.onload = init;
	}
	
	private function init():Void
	{
		var txt:InputElement = cast Browser.document.getElementById("blank-form-input");
		var btn:ButtonElement = cast Browser.document.getElementById("blank-form-submit");
		
		btn.addEventListener("click", function(e:Dynamic):Void {
			btn.disabled = true;
			
			// 1. スライドURLを検証する
			var reg:EReg = ~/https?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/;
			
			if (reg.match(txt.value)) {
				// 2. スライドを読み込む（遷移する）
				Browser.location.href = txt.value;
			} else {
				btn.disabled = false;
			}
		});
	}
	
}