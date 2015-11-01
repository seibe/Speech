package speech;

import electron.Electron;
import electron.ElectronBrowserWindow;
import js.Node;

class Main 
{
	static function main() 
	{
		new Main();
	}
	
	public function new()
	{
		Electron.app.on(ElectronAppEventType.WINDOW_ALL_CLOSED, Electron.app.quit);
		Electron.app.on(ElectronAppEventType.READY, init);
	}
	
	private function init():Void
	{
		var win = new ElectronBrowserWindow( { width: 800, height: 664 } );
		win.loadUrl('file://' + Node.__dirname + '/index.html');
		win.on(ElectronBrowserWindowEventType.CLOSED, function():Void {
			win = null;
		});
	}
	
}