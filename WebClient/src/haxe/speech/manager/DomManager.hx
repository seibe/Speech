package speech.manager;

import haxe.Constraints.Function;
import js.Browser;
import js.html.ButtonElement;
import js.html.Element;
import js.html.IFrameElement;
import js.html.InputElement;
import js.html.LIElement;
import js.html.SelectElement;
import js.html.VideoElement;
import speech.abstracts.DialogElement;

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
	* Get a OutputElement by ID
	* @param id Id of the element
	*/
	public function getOutput(id:String, ?sceneId:String):Element return cast _get(id, sceneId, "output");
	
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
	 * Get the SlideElement(IFrameElement)
	 * @return id Id of the element
	 */
	public function getSlide():IFrameElement return cast _idMap["live-slide"];
	
	/**
	 * Get the VideoElement
	 * @return id Id of the element
	 */
	public function getVideo():VideoElement return cast _idMap["live-video"];
	
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
			if (key == id) _sceneMap[key].classList.remove("hide");
			else _sceneMap[key].classList.add("hide");
		}
		
		if (callback != null) callback();
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
	
	private function setOptions(selectId:String, optionHtml:Array<String>):Void
	{
		var select = getSelect(selectId);
		select.innerHTML = optionHtml.join("");
	}
	
	private function setElementList(elem:Element):Void
	{
		if (elem.id != null && elem.id.length > 0) {
			_idMap[elem.id] = elem;
			//trace(elem.id);
		}
		
		var child = elem.firstElementChild;
		while (child != null) {
			setElementList(child);
			child = child.nextElementSibling;
		}
	}
}
