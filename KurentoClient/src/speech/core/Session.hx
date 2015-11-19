package speech.core;
import haxe.Json;
import js.Error;
import js.html.rtc.IceCandidate;
import js.node.Path;
import js.Promise;
import kurento.core.MediaPipeline;
import kurento.elements.RecorderEndpoint;
import kurento.elements.WebRtcEndpoint;
import kurento.kurentoClient.KurentoClient;
import speech.core.Room.Response;
import ws.WsServer.WsSocket;
import ws.WsServer.WsSocketFlags;

class Session
{
	public var id:String;
	public var ws:WsSocket;
	public var room:Room;
	
	public var endpoint:WebRtcEndpoint;
	public var pipeline:MediaPipeline;
	public var recorder:RecorderEndpoint;
	public var recordPath:String;
	
	private static var _idCounter:Int = 0;
	private var _candidatesQueue:Array<Dynamic>;
	
	public static function getNextId():String
	{
		_idCounter++;
		return Std.string(_idCounter);
	}
	
	public function new(socket:WsSocket)
	{
		id = getNextId();
		ws = socket;
		room = null;
		endpoint = null;
		pipeline = null;
		recorder = null;
		recordPath = null;
		
		clearCandidatesQueue();
	}
	
	public function isPresenter():Bool
	{
		return room != null && room.presenter != null && room.presenter == this;
	}
	
	public function startStream(kurentoUrl:String, recordDir:String, sdpOffer:String):Void
	{
		clearCandidatesQueue();
			
		if (!isPresenter()) return;
		
		// 放送者につなげる
		// 1. create client
		KurentoClient.getSingleton(kurentoUrl)
			.then(function(client:KurentoClient):Promise<MediaPipeline> {
				// 2. create pipeline
				return client.create("MediaPipeline");
			})
			.catchError(function(error:Error):Promise<MediaPipeline> {
				// rejected 1
				trace(error);
				ws.send(Json.stringify({
					type: "onStopStream",
					data: error
				}));
				return null;
			})
			.then(function(pipe:MediaPipeline):Promise<Dynamic> {
				pipeline = pipe;
				// 3. create endpoints
				var p1 = pipeline.create("WebRtcEndpoint");
				// 4. create recoder
				recordPath = Path.join(recordDir, Std.string( Date.now().getTime() ) + ".webm");
				var p2 = pipeline.create("RecorderEndpoint", { uri: recordPath });
				return Promise.all([p1, p2]);
			})
			.then(function(endpoints:Array<Dynamic>):Promise<Dynamic> {
				endpoint = endpoints[0];
				recorder = endpoints[1];
				// 5. connect recorder
				return endpoint.connect(recorder);
			})
			.then(function(dummy:Dynamic):Promise<Dynamic> {
				recorder.record();
				exchangeCandidates();
				// 6. offer
				var p1 = endpoint.processOffer(sdpOffer);
				var p2 = endpoint.gatherCandidates();
				return Promise.all([p1, p2]);
			})
			.then(function(results:Array<Dynamic>):Promise<RecorderEndpoint> {
				var sdpAnswer:String = results[0];
				// finish!
				ws.send(Json.stringify({
					type: "acceptStream",
					data: sdpAnswer
				}));
				room.broadcast(Response.CAN_START_STREAM);
				return null;
			})
			.catchError(function(error:Error):Promise<MediaPipeline> {
				// rejected 2~6
				trace(error);
				stopStream();
				return null;
			});
	}
	
	public function connectStream(sdpOffer:String):Void
	{
		trace("connctStream", 1);
		if (room == null || room.presenter == null || room.presenter.pipeline == null) return;
		trace("connctStream", 2);
		pipeline = room.presenter.pipeline;
		var sdpAnswer = null;
		
		// 視聴者につなげる
		// 1. create endpoint
		pipeline.create("WebRtcEndpoint")
			.then(function(endpoint:WebRtcEndpoint):Promise<String> {
				trace("connctStream", 3);
				this.endpoint = endpoint;
				exchangeCandidates();
				// 2. offer
				return endpoint.processOffer(sdpOffer);
			})
			.then(function(answer:String):Promise<Dynamic> {
				trace("connctStream", 4);
				sdpAnswer = answer;
				// 3. connect endpoint
				return room.presenter.endpoint.connect(endpoint);
			})
			.then(function(dummy:Dynamic):Promise<Dynamic> {
				trace("connctStream", 5);
				// 4. and more
				return endpoint.gatherCandidates();
			})
			.then(function(dummy:Dynamic):Promise<Dynamic> {
				// finish!
				trace("startStream");
				ws.send(Json.stringify({
					type: "startStream",
					data: sdpAnswer
				}));
				return null;
			})
			.catchError(function(error:Error):Void {
				trace("connctStream", -1);
				// rejected 2~4
				trace(error);
				stopStream();
			});
	}
	
	public function stopStream():Void
	{
		if (isPresenter()) {
			room.broadcast(Response.STOP_STREAM);
			
			if (recorder != null) {
				recorder.stop();
				recorder.release();
				recorder = null;
				trace("stop recording");
			}
			if (pipeline != null) pipeline.release();
		}
		pipeline = null;
		
		if (endpoint != null) endpoint.release();
		endpoint = null;
		
		clearCandidatesQueue();
	}
	
	public function addIceCandidate(ic:Dynamic):Void
	{
		ic = untyped kurento.register.complexTypes.IceCandidate(ic);
		
		if (endpoint != null) {
			// sending candidate
			endpoint.addIceCandidate(ic);
		} else {
			// queueing candidate
			_candidatesQueue.push(ic);
		}
	}
	
	public function exchangeCandidates():Void
	{
		while (_candidatesQueue.length > 0) {
			var candidate = _candidatesQueue.shift();
			endpoint.addIceCandidate(cast candidate);
		}
		
		endpoint.on("OnIceCandidate", function(ic:IceCandidate):Void {
			var candidate = untyped kurento.register.complexTypes.IceCandidate(ic.candidate);
			ws.send(Json.stringify({
				type: "iceCandidate",
				candidate: candidate
			}));
		});
	}
	
	public function clearCandidatesQueue():Void
	{
		_candidatesQueue = new Array<Dynamic>();
	}
	
	public function destroy():Void
	{
		if (id == null) return;
		id = null;
		
		if (ws != null) ws.close();
		ws = null;
		
		if (room != null) {
			if (isPresenter()) {
				// 放送者が去り、部屋を閉じる
				room.destroy();
			} else {
				// 視聴者が去る
				room.viewerList.remove(this);
			}
		}
		room = null;
		
		if (recorder != null && isPresenter()) {
			recorder.stop();
			recorder.release();
		}
		recorder = null;
		recordPath == null;
		
		if (pipeline != null && isPresenter()) pipeline.release();
		pipeline = null;
		
		if (endpoint != null) endpoint.release();
		endpoint = null;
		
		_candidatesQueue = null;
	}
	
}
