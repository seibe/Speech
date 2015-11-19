package kurentoUtils;
import haxe.Constraints.Function;
import js.html.MediaStream;
import js.html.rtc.IceCandidate;
import js.html.rtc.PeerConnection;
import js.html.rtc.SessionDescription;
import js.html.VideoElement;
import js.node.events.EventEmitter;

@:enum
abstract WebRtcPeerMode(String) to String
{
	var RECV = "recv";
	var SEND = "send";
	var SEND_RECV = "sendRecv";
}

typedef WebRtcPeerOption = {
	@:optional var localVideo:VideoElement;
	@:optional var remoteVideo:VideoElement;
	@:optional var videoStream:MediaStream;
	@:optional var audioStream:MediaStream;
	@:optional var mediaConstraints:Dynamic;
	@:optional var connectionConstraints:Dynamic;
	@:optional var peerConnection:PeerConnection;
	@:optional var sendSource:String;
	@:optional var configuration:Dynamic;
	
	@:optional var onstreamended:Function;
	@:optional var onicecandidate:IceCandidate->Void;
	@:optional var oncandidategatheringdone:Function;
}

@:native("kurentoUtils.WebRtcPeer")
extern class WebRtcPeer extends EventEmitter<WebRtcPeer>
{
	static function bufferizeCandidates(pc:PeerConnection, onerror:Function):String->Function->Void;
	static function WebRtcPeerRecvonly(options:WebRtcPeerOption, callback:Function):WebRtcPeer;
	static function WebRtcPeerSendonly(options:WebRtcPeerOption, callback:Function):WebRtcPeer;
	static function WebRtcPeerSendrecv(options:WebRtcPeerOption, callback:Function):WebRtcPeer;
	
	var signalingState:String;
	var audioEnabled:Bool;
	var videoEnabled:Bool;
	
	function new(mode:String, options:WebRtcPeerOption, ?callback:Function):Void;
	
	function addIceCandidate(iceCandidate:IceCandidate, ?callback:IceCandidate->Void):Void;
	function generateOffer(callback:Dynamic->SessionDescription->Void):Void;
	function getLocalSessionDescriptor():SessionDescription;
	function getRemoteSessionDescriptor():SessionDescription;
	function showLocalVideo():Void;
	function processAnswer(sdpAnswer:SessionDescription, ?callback:Function):Void;
	function processOffer(sdpOffer:SessionDescription, ?callback:Function):Void;
	function dispose():Void;
}
