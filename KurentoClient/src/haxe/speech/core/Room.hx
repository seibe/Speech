package speech.core;
import haxe.Json;
import js.Error;
import js.Node;
import js.node.Crypto;
import js.node.crypto.Hash;
import js.node.Fs;
import shortId.ShortId;

enum Response {
	ENTER(userId:String, totalNum:Int);
	LEAVE(userId:String);
	END;
	UPDATE_SLIDE(slideUrl:String);
	COMMENT(name:String, text:String, slideUrl:String);
	CAN_START_STREAM();
	STOP_STREAM();
	ERROR(error:Dynamic);
}

class Room
{
	public var title:String;
	public var description:String;
	public var id:String;
	public var presenter:Session;
	public var viewerList:Array<Session>;
	public var slideUrl:String;
	
	public function new(title:String, desc:String, presenter:Session, slideUrl:String)
	{
		this.title = title;
		this.description = desc == null ? "" : desc;
		this.presenter = presenter;
		this.presenter.room = this;
		this.slideUrl = slideUrl;
		
		id = ShortId.generate();
		viewerList= new Array<Session>();
		
		var timestamp = Std.string(Date.now().getTime());
		Fs.writeFile(Node.__dirname + "/file/" + id + ".txt",
			timestamp + ",create,\r\n",
			onSave
		);
	}
	
	public function broadcast(resp:Response):Void
	{
		var obj:Dynamic = { };
		
		switch (resp)
		{
			case Response.UPDATE_SLIDE(slideUrl):
				obj.type = "onUpdateSlide";
				obj.data = slideUrl;
				save("change", slideUrl);
				
			case Response.COMMENT(name, text, url):
				obj.type = "onComment";
				obj.data = { name: name, text: text, slideUrl: url };
				save("comment", Json.stringify(obj.data));
				
			case Response.CAN_START_STREAM:
				obj.type = "canStartStream";
				save("startStream", presenter.recordPath);
				
			case Response.STOP_STREAM:
				obj.type = "onStopStream";
				save("stopStream");
				
			default:
				trace("broadcast error", resp);
		}
		
		obj.timestamp = Date.now().getTime();
		var data = Json.stringify(obj);
		
		presenter.ws.send(data);
		for (viewer in viewerList) viewer.ws.send(data);
	}
	
	public function destroy():Void
	{
		if (id == null) return;
		save("close");
		id = null;
		
		if (presenter != null) presenter.destroy();
		presenter = null;
		
		if (viewerList != null) {
			for (viewer in viewerList) viewer.destroy();
		}
		viewerList = null;
		
		title = null;
		presenter = null;
		slideUrl = null;
	}
	
	private function save(cmd:String, ?notes:String = ""):Void
	{
		var path = Node.__dirname + "/file/" + id + ".txt";
		var timestamp = Std.string(Date.now().getTime());
		var data = timestamp + "," + cmd + "," + notes;
		
		Fs.appendFile(path, timestamp + "," + data + "\r\n", onSave);
	}
	
	private function onSave(err:Error):Void
	{
		if (err != null) trace("save error", err);
	}
	
}
