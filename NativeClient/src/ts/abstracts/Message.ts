module Speech {
    
    export const ServerMessageType = {
        // 共通
        ACCEPT_STREAM:      "acceptStream",
        UPDATE_AUDIENCE:    "updateAudience", //参加人数の更新通知
        ICE_CANDIDATE:      "iceCandidate",
        COMMENT:            "onComment",
        ERROR:              "onError",
        FINISH:             "finish", //プレゼンテーションの正常終了通知
        WILL_STOP_STREAM:   "willStopStream", //映像配信の終了予告
        STOP_STREAM:        "onStopStream", //映像配信の終了通知
        
        // 発表者宛
        ACCEPT_PRESENTER:   "acceptPresenter",
        CREATE_LOG:         "onCreateLog",
        
        // 聴衆宛
        ACCEPT_AUDIENCE:    "acceptAudience",
        CAN_CONNECT_STREAM: "canConnectStream",
        UPDATE_SLIDE:       "onUpdateSlide",
        START_POINTER:      "startPointer",
        UPDATE_POINTER:     "updatePointer",
        STOP_POINTER:       "stopPointer"
    }
    
    export const ClientMessageType = {
        // 共通
        ICE_CANDIDATE:      "iceCandidate",
        
        // 発表者から
        JOIN_PRESENTER:     "joinPresenter",
        LEAVE_PRESENTER:    "leavePresenter",
        UPDATE_SLIDE:       "updateSlide",
        START_STREAM:       "startStream",
        STOP_STREAM:        "stopStream",
        START_POINTER:      "startPointer",
        UPDATE_POINTER:     "updatePointer",
        STOP_POINTER:       "stopPointer",
        REQUEST_LOG:        "requestLog",
        
        // 聴衆から
        JOIN_VIEWER:        "joinViewer",
        LEAVE_VIEWER:       "leaveViewer",
        CONNECT_STREAM:     "connectStream",
        DISCONNECT_STREAM:  "disconnectStream",
        COMMENT:            "comment"
    }
    
    export interface Message {
        type: string,
        data?: any
    }
    
}
