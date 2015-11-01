package electron;

import electron.Electron;

typedef ElectronMenuItemConfig =
{
	label:String,
	?click:ElectronFunction,
	?selector:String,
	?type:String,
	?sublabel:String,
	?accelerator:ElectronAccelerator,
	?icon:ElectronNativeImage,
	?enabled:Bool,
	?visible:Bool,
	?checked:Bool,
	?submenu:ElectronMenu,
	?id:String,
	?position:String
}

@:jsRequire('menu-item')
extern class ElectronMenuItem
{
	function new(options:ElectronMenuItemConfig);
}
