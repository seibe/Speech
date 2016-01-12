package speech.abstracts.common;

/**
 * サーバーからクライアントへのメッセージ種別
 */
@:enum
abstract ServerMessageType(String) to String from String
{
	// 共通
	var ACCEPT_STREAM	= "acceptStream"; //メディアサーバーへの接続完了通知
	var UPDATE_AUDIENCE = "updateAudience"; //参加人数の更新通知
	var ICE_CANDIDATE	= "iceCandidate";
	var COMMENT			= "onComment";
	var ERROR			= "onError";
	var FINISH			= "finish"; //プレゼンテーションの正常終了通知
	var WILL_STOP_STREAM= "willStopStream"; //映像配信の終了予告
	var STOP_STREAM		= "onStopStream"; //映像配信の終了通知
	
	// 発表者宛
	var ACCEPT_PRESENTER= "acceptPresenter";
	var CREATE_LOG		= "onCreateLog";
	
	// 聴衆宛
	var ACCEPT_AUDIENCE	= "acceptAudience";
	var CAN_CONNECT_STREAM = "canConnectStream";
	var UPDATE_SLIDE	= "onUpdateSlide";
}

/**
 * クライアントからサーバーへのメッセージ種別
 */
@:enum
abstract ClientMessageType(String) to String from String
{
	// 共通
	var ICE_CANDIDATE	= "iceCandidate";
	
	// 発表者から
	var JOIN_PRESENTER	= "joinPresenter";
	var LEAVE_PRESENTER = "leavePresenter";
	var UPDATE_SLIDE	= "updateSlide";
	var START_STREAM	= "startStream";
	var STOP_STREAM		= "stopStream";
	var START_POINTER	= "startPointer";
	var UPDATE_POINTER	= "updatePointer";
	var STOP_POINTER	= "stopPointer";
	var REQUEST_LOG		= "requestLog";
	
	// 聴衆から
	var JOIN_VIEWER		= "joinViewer";
	var LEAVE_VIEWER	= "leaveViewer";
	var CONNECT_STREAM	= "connectStream";
	var COMMENT			= "comment";
}
