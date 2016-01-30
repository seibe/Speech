// Type definitions for kurentoUtils
// Definitions by: seibe
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module kurentoUtils {
    
    interface WebRtcPeerOption {
        localVideo?: HTMLVideoElement;
        remoteVideo?: HTMLVideoElement;
        videoStream?: MediaStream;
        audioStream?: MediaStream;
        mediaConstraints?: Object;
        connectionConstraints?: Object;
        peerConnection?: RTCPeerConnection;
        sendSource?: String;
        configuration?: Object;
        
        onstreamended?: Function;
        onicecandidate?: (icecandidate: RTCIceCandidate)=>void;
        oncandidategatheringdone?: Function;
    }
	
    class WebRtcPeer {
        addIceCandidate(iceCandidate:RTCIceCandidate, callback?:(ice: RTCIceCandidate)=>void):void;
        generateOffer(callback:(obj: Object, session: RTCSessionDescription)=>void):void;
        getLocalSessionDescriptor():RTCSessionDescription;
        getRemoteSessionDescriptor():RTCSessionDescription;
        showLocalVideo():void;
        processAnswer(sdpAnswer:RTCSessionDescription, callback?:Function):void;
        processOffer(sdpOffer:RTCSessionDescription, callback?:Function):void;
        dispose():void;
        
        static bufferizeCandidates(pc: RTCPeerConnection, onerror: Function):(str: string, callback: Function)=>void;
        static WebRtcPeerRecvonly(options: WebRtcPeerOption, callback: (error: any)=>void): WebRtcPeer;
        static WebRtcPeerSendonly(options: WebRtcPeerOption, callback: (error: any)=>void): WebRtcPeer;
        static WebRtcPeerSendrecv(options: WebRtcPeerOption, callback: (error: any)=>void): WebRtcPeer;
        
        signalingState: string;
        audioEnabled: boolean;
        videoEnabled: boolean;
	}
}
