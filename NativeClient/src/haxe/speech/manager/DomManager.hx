package speech.manager;

import electron.DialogElement;
import electron.WebViewElement;
import haxe.Constraints.Function;
import js.Browser;
import js.html.ButtonElement;
import js.html.Element;
import js.html.InputElement;
import js.html.SelectElement;
import js.html.VideoElement;
import electron.MediaStreamTrack;

class DomManager
{
	private var _idMap:Map<String, Element>;
	private var _sceneMap:Map<String, Element>;
	private var _nowScene:String;

	public function new() 
	{
		// init element list
		_idMap = new Map<String, Element>();
		setElementList(Browser.document.body);
		
		// init scene
		_sceneMap = new Map<String, Element>();
		_sceneMap["setup"] = getScene("setup");
		_sceneMap["live"] = getScene("live");
		changeScene("setup");
	}
	
	/* ------------------------------------------------------
	 *  Public Functions
	 * ----------------------------------------------------*/
	
	/**
	* Get a DOMElement by ID
	* @param id Id of the element
	* @param ?sceneId Id of the scene
	*/
	public function get(id:String, ?sceneId:String):Element return _get(id, sceneId);
	
	/**
	* Get a ButtonTagElement by ID
	* @param id Id of the element
	*/
	public function getButton(id:String, ?sceneId:String):ButtonElement return cast _get(id, sceneId, "button");
	
	/**
	* Get a InputTagElement by ID
	* @param id Id of the element
	*/
	public function getInput(id:String, ?sceneId:String):InputElement return cast _get(id, sceneId, "input");
	
	/**
	* Get a SelectTagElement by ID
	* @param id Id of the element
	*/
	public function getSelect(id:String, ?sceneId:String):SelectElement return cast _get(id, sceneId, "select");
	
	/**
	* Get a DialogTagElement by ID
	* @param id Id of the element
	*/
	public function getDialog(id:String, ?sceneId:String):DialogElement return cast _idMap["dialog-" + id];
	
	/**
	* Get a SceneElement by ID
	* @param id Id of the element
	*/
	public function getScene(id:String):Element return _idMap["scene-" + id];
	
	/**
	* Get a DOMElement by querySelector
	* @param selectors querySelector
	*/
	public function query(selectors:String):Element
	{
		return Browser.document.querySelector(selectors);
	}
	
	/**
	* Scene change function
	* @param scene the scene name
	*/
	public function changeScene(id:String, ?callback:Function):Void
	{
		if (_sceneMap[id] == null) return;
		_nowScene = id;
		
		for (key in _sceneMap.keys()) {
			trace(key);
			if (key == id) _sceneMap[key].classList.remove("hide");
			else _sceneMap[key].classList.add("hide");
		}
		
		if (callback != null) callback();
	}
	
	/**
	* Set track list for a select tag
	* @param src new webview element's src property
	*/
	public function setMediaSource(id:String, trackList:Array<MediaStreamTrack>):Void
	{
		var optionHtml:Array<String> = new Array<String>();
		optionHtml.push('<option value="">None</option>');
		for (track in trackList) {
			optionHtml.push('<option value="' + track.id + '">' + track.label + '</option>');
		}
		setOptions(id, optionHtml);
	}
	
	/**
	* Set slide source for player
	* @param src slide url
	* @return webview
	*/
	public function initPlayer(src:String):WebViewElement
	{
		get("player-main", "live").innerHTML = "";
		
		addMedia('<webview class="player-webview" id="live-slideview" src="' + src + '" autosize="on" disablewebsecurity></webview>', true);
		_idMap["live-slideview"] = Browser.document.getElementById("live-slideview");
		
		return cast _idMap["live-slideview"];
	}
	
	/**
	* Add new webview for player
	* @param src new webview element's src property
	*/
	public function addWebView(src:String):Void
	{
		addMedia('<webview class="player-webview" src="' + src + '" autosize="on" disablewebsecurity></webview>');
	}
	
	/**
	* Add new webview for player
	* @param src new webview element's src property
	*/
	public function addVideo(name:String, ?src:String, ?posterSrc:String):Void
	{
		var id = _getId(name, "live", "video");
		
		addMedia('<video class="player-video" id="' + id + '" autoplay></video>');
		var video:VideoElement = cast Browser.document.getElementById(id);
		if (src != null) video.src = src;
		if (posterSrc != null) video.poster = posterSrc;
		_idMap[id] = video;
	}
	
	/* ------------------------------------------------------
	 *  Private Functions
	 * ----------------------------------------------------*/
	
	private function _getId(id:String, ?sceneId:String, ?prefix:String):String
	{
		var array = new Array<String>();
		if (prefix != null) array.push(prefix);
		array.push(sceneId == null ? _nowScene : sceneId);
		array.push(id);
		return array.join("-");
	}
	
	private function _get(id:String, ?sceneId:String, ?prefix:String):Element
	{
		return _idMap[_getId(id, sceneId, prefix)];
	}
	
	private function _remove(id:String, ?sceneId:String, ?prefix:String):Void
	{
		var _id = _getId(id, sceneId, prefix);
		var elem = _idMap[_id];
		elem.remove();
		_idMap.remove(_id);
	}
	
	private function addMedia(innerHTML:String, forceActive:Bool = false):Void
	{
		var player = get("player-main", "live");
		var i = Std.string(player.childElementCount);
		
		var list = Browser.document.createLIElement();
		list.classList.add("player-main-item");
		list.innerHTML = '<input type="checkbox" id="player-main-item-' + i + '" /><div><button>×</button><label for="player-main-item-' + i + '">-</label></div>';
		
		var div = list.getElementsByTagName("div")[0];
		div.insertAdjacentHTML("afterbegin", innerHTML);
		
		if (player.childElementCount == 0 || forceActive) {
			var others = Browser.document.getElementsByClassName("player-main-item");
			for (elem in others) elem.classList.remove("active");
			list.classList.add("active");
		}
		
		player.appendChild(list);
	}
	
	private function setOptions(selectId:String, optionHtml:Array<String>):Void
	{
		var select = getSelect(selectId);
		select.innerHTML = optionHtml.join("");
	}
	
	private function setElementList(elem:Element):Void
	{
		if (elem.id != null && elem.id.length > 0) {
			_idMap[elem.id] = elem;
			trace(elem.id);
		}
		
		var child = elem.firstElementChild;
		while (child != null) {
			setElementList(child);
			child = child.nextElementSibling;
		}
	}
}
