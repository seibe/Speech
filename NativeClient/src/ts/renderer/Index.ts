/// <reference path="kurentoUtils.d.ts" />

module Speech
{
    declare var MediaStreamTrack: any;
    const WS_URL:string = "wss://seibe.jp:8081/speech";
    const IS_DEBUG = false;
    
    enum State {
        SETUP,
        LIVE_BEFORE,
        LIVE,
        LIVE_AFTER
    }
    
    export class Main
    {
        private _ws: WebSocket;
        private _dom: DomManager;
        private _state: State;
        private _timer: number;
        
        private _beginTime: number;
        private _prevUrl: string;
        private _numQuestion: number;
        private _title: string;
        private _username: string;
        private _slideUrl: string;
        private _videoSourceId: string;
        private _presentationShortId: string;
        
        private _slideView: HTMLWebViewElement;
        private _webRtcPeer: kurentoUtils.WebRtcPeer;
        
        constructor() {
            window.onload = () => { this.init(); };
            window.onunload = () => { this.finalize(); };
        }
        
        private init():void {
            this._dom = new DomManager();
            this._state = null;
            this._beginTime = -1;
            this._prevUrl = null;
            this._numQuestion = 0;
            this._title = null;
            this._username = null;
            this._slideUrl = null;
            this._videoSourceId = null;
            this._slideView = null;
            this._timer = null;
            
            this.setState(State.SETUP);
        }
        
        private finalize():void {
            if (!this._ws) {
                this._ws.close();
                this._ws = null;
            }
        }
        
        
        /* ---------------------------------
            State
        --------------------------------- */
        
        private setState(nextState: State):void {
            if (this._state == nextState) return;
            
            // シーンの終了
            switch (this._state) {
                case State.SETUP: {
                    // 入力フォームの値取得
                    this._title = this._dom.getInput("title", "setup").value;
                    this._username = this._dom.getInput("presenter", "setup").value;
                    this._slideUrl = this._dom.getInput("slide-url", "setup").value;
                    this._videoSourceId = this._dom.getSelect("video", "setup").value;
                    
                    // イベントリスナー解除
                    this._dom.getButton("submit", "setup").removeEventListener("click", this);
                    
                    break;
                }
                
                case State.LIVE_BEFORE: {
                    // ローディングを閉じる
                    this._dom.getDialog().close();
                    
                    break;
                }
                
                case State.LIVE: {
                    // 配信の終了
                    this.stopPointerCapture();
                    this.stopStream();
                    this.send(ClientMessageType.LEAVE_PRESENTER);
                    if (this._timer != null) clearInterval(this._timer);
                    this._timer = null;
                    
                    // イベントリスナー解除
                    window.removeEventListener("resize", this);
                    window.removeEventListener("keydown", this);
                    this._slideView.removeEventListener("keydown", this);
                    this._slideView.removeEventListener("wheel", this);
                    this._slideView.removeEventListener("mouseup", this);
                    this._slideView.removeEventListener("focus", this);
                    this._slideView.removeEventListener("blur", this);
                    this._dom.getButton("finish").removeEventListener("click", this);
                    
                    if (nextState == State.SETUP) {
                        this._ws.close();
                        this._ws = null;
                    }
                    
                    break;
                }
                
                case State.LIVE_AFTER: {
                    if (this._ws) this._ws.close();
                    this._ws = null;
                    
                    this._dom.getButton("finish").removeEventListener("click", this);
                    
                    break;
                }
            }
            
            // シーンの初期化
            switch (nextState) {
                case State.SETUP: {
                    // シーン遷移
                    this._dom.changeScene(DomScene.SETUP);
                    
                    // メディアソース反映
                    let sources: MediaStreamTrack[] = [];
                    MediaStreamTrack.getSources((tracks: MediaStreamTrack[]) => {
                        for (let track of tracks) {
                            if (track.kind == "video") sources.push(track);
                        }
                        this._dom.setMediaSource(sources);
                    });
                    
                    // イベント登録
                    this._dom.getButton("submit").addEventListener("click", this);
                    
                    break;
                }
                
                case State.LIVE_BEFORE: {
                    // ローディング表示
                    this._dom.getDialog().showModal();
                    
                    // WSサーバー接続
                    this._ws = new WebSocket(WS_URL);
                    this._ws.addEventListener("open", this.onWsConnect.bind(this));
                    this._ws.addEventListener("close", this.onWsClose.bind(this));
                    this._ws.addEventListener("message", this.onWsMessage.bind(this));
                    this._ws.addEventListener("error", this.onWsError.bind(this));
                    
                    // スライドビュー初期化
                    this._slideView = this._dom.getWebView();
                    this._slideView.src = this._slideUrl;
                    this._prevUrl = this._slideUrl;
                    this._numQuestion = 0;
                    this._dom.getElement("comment-list", "live").innerHTML = "";
                    this._dom.getElement("question-list", "live").innerHTML = "";
                    this._dom.getElement("num-question", "live").innerText = "0";
                    this._dom.getElement("num-audience", "live").innerText = "0";
                    
                    break;
                }
                
                case State.LIVE: {
                    // 開始時間初期化
                    this._beginTime = (new Date()).getTime();
                    this._timer = setInterval(() => { this.onUpdate(); }, 1000);
                    
                    // DOM表示切替
                    this._dom.changeScene(DomScene.LIVE);
                    this._slideView.focus();
                    
                    // イベントリスナー登録
                    window.addEventListener("resize", this.onResize);
                    this.onResize();
                    this._slideView.addEventListener("keydown", this);
                    this._slideView.addEventListener("wheel", this);
                    this._slideView.addEventListener("mouseup", this);
                    this._slideView.addEventListener("focus", this);
                    this._slideView.addEventListener("blur", this);
                    this._dom.getButton("finish").addEventListener("click", this);
                    
                    break;
                }
                
                case State.LIVE_AFTER: {
                    this._dom.getButton("finish").addEventListener("click", this);
                    break;
                }
                
                default: {
                    throw "State Error";
                }
            }
            
            this._state = nextState;
        }
        
        
        /* ---------------------------------
            private method
        --------------------------------- */
        
        private send(type: string, data?: Object): void {
            if (!this._ws) {
                throw 'send error';
            }
            
            this.trace("send", type);
            this._ws.send(JSON.stringify({
                type: type,
                data: data
            }));
        }
        
        private stopPointerCapture(): void {
            /*
            let button = this._dom.getButton("action-pointer", "live");
            if (button.dataset['active']) {
                button.innerText = "レーザーポインタ";
                this._slideView.classList.remove("readonly");
                window.removeEventListener("mousemove", this.onMovePointer);
                button.dataset['active'] = null;
                this.send(ClientMessageType.STOP_POINTER);
            }
            */
        }
        
        private stopStream(): void {
            if (!this._webRtcPeer) return;
            
            this.send(ClientMessageType.STOP_STREAM);
            this._webRtcPeer.dispose();
            this._webRtcPeer = null;
        }
        
        private addComment(text: string, name: string): void {
            this._dom.getElement("comment-list", "live").insertAdjacentHTML("afterbegin", `<li class="discuss-comment new"><img class="discuss-comment-image" src="img/avatar.png"><div class="discuss-comment-body"><strong>${name}</strong><p>${text}</p></div></li>`);
            document.querySelector(".discuss-comment.new").addEventListener("animationend", (e: AnimationEvent) => {
                if (e.animationName == "comment-move-in") {
                    let elem = <HTMLElement>e.target;
                    elem.classList.remove("new");
                }
            });
        }
        
        private addQuestion(text: string, name: string): void {
            this._dom.getElement("question-list", "live").insertAdjacentHTML("beforeend", `<li class="discuss-comment"><img class="discuss-comment-image" src="img/avatar.png"><div class="discuss-comment-body"><strong>${name}</strong><p>${text}</p></div></li>`);
		    
            this._numQuestion++;
            this._dom.getElement("num-question", "live").innerText = this._numQuestion.toString();
        }
        
        private addStamp(src: string, alt: string): void {
            for (var i = 0; i < 3; i++) {
                setTimeout(() => {
                    let left = i * 5 + 40 + Math.floor(Math.random() * 28);
                    this._dom.getElement("atmos", "live").insertAdjacentHTML("afterbegin", `<img class="live-atmos-stamp" alt="${alt}" src="${src}" style="left: ${left}%" />`);
                    let stamp = document.getElementsByClassName("live-atmos-stamp").item(0);
                    setTimeout(() => { stamp.remove(); stamp = null; }, 4000);
                }, 500 * i);
            }
        }
        
        private htmlEscape(s: string): string {
            return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
        }
        
        
        /* ---------------------------------
            Event
        --------------------------------- */
        
        handleEvent(e: Event) {
            this.trace(e.type, e.currentTarget);
            
            switch(e.type) {
                case "resize": {
                    if (e.currentTarget == window) this.onResize();
                    break;
                }
                
                case "keydown": {
                    if (e.currentTarget == this._slideView) this.onChangeSlide();
                    if (e.currentTarget == window) this.onKeyDown();
                    break;
                }
                
                case "wheel": {
                    if (e.currentTarget == this._slideView) this.onChangeSlide();
                    break;
                }
                
                case "mouseup": {
                    if (e.currentTarget == this._slideView) this.onChangeSlide();
                    break;
                }
                
                case "focus": {
                    if (e.currentTarget == this._slideView) window.removeEventListener("keydown", this);
                    break;
                }
                
                case "blur": {
                    if (e.currentTarget == this._slideView) window.addEventListener("keydown", this);
                    break;
                }
                
                case "click": {
                    if (e.currentTarget == this._dom.getButton("submit", "setup")) this.onClickStart();
                    if (e.currentTarget == this._dom.getButton("finish", "live")) this.onClickFinish();
                    break;
                }
            }
        }
        
        private onChangeSlide() {
            if (this._state != State.LIVE) return;
		
            setTimeout(() => {
                // 前回とURLが異なっていればページ移動したと看做す
                var url = this._slideView.getURL();
                if (this._prevUrl != url) {
                    this.send(ClientMessageType.UPDATE_SLIDE, url);
                    this._prevUrl = url;
                }
            }, 250);
        }
        
        private onClickStart() {
            let url = this._dom.getInput("slide-url").value;
            let title = this._dom.getInput("title").value;
            let checker = /https?:\/\/.+/;
            if (url.length == 0 || url.length == 0 || !checker.test(url)) {
                this._dom.getInput("slide-url").focus();
            } else {
                this.setState(State.LIVE_BEFORE);
            }
        }
        
        private onClickFinish() {
            switch (this._state) {
                case State.LIVE:
                    this.send(ClientMessageType.REQUEST_LOG);
                    break;
                
                case State.LIVE_AFTER:
                    this.setState(State.SETUP);
                    break;
                    
                default:
                    throw 'finish event error';
            }
        }
        
        private onResize() {
            let playerHeight = window.innerHeight - 272;
            this._slideView.style.height = `${playerHeight}px`;
        }
        
        private onKeyDown() {
            this._slideView.focus();
        }
        
        private onUpdate() {
            let elapsedTime = new Date().getTime() - this._beginTime;
            let min = Math.floor(elapsedTime / 60000);
            let sec = Math.floor(elapsedTime / 1000) % 60;
            this._dom.getElement("elapsed-time", "live").innerText = (min < 10 ? `0${min}` : `${min}`) + ":" + (sec < 10 ? `0${sec}` : `${sec}`);
        }
        
        /* ---------------------------------
            WebSocket Event
        --------------------------------- */
        
        private onWsConnect(e: Event) {
            // 部屋を作成する
            this.send(ClientMessageType.JOIN_PRESENTER, {
                title: this._title,
                slideUrl: this._slideUrl,
                name: this._username
            });
            
            // 映像配信の初期化
            if (this._videoSourceId && this._videoSourceId.length > 0) {
                // WebCamの登録
                let videoElem = this._dom.getVideo();
                
                navigator.getUserMedia({
                    video: {optional: [{sourceId: this._videoSourceId}]},
                    audio: true
                }, (stream) => {
                    this._webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly({
                        localVideo: videoElem,
                        videoStream: stream,
                        onicecandidate: (candidate) => { this.send(ClientMessageType.ICE_CANDIDATE, candidate); }
                    }, (error) => {
                        if (error) {
                            this.trace('webrtcpeer error', error);
                            this.setState(State.SETUP);
                        }
                        this._webRtcPeer.generateOffer((err:any, sdp:RTCSessionDescription) => {
                            if (err) this.trace('generateoffer error', error);
                            this.send(ClientMessageType.START_STREAM, {
                                offer: sdp,
                                target: "webcam"
                            });
                        });
                    });
                }, (error) => { this.trace('getusermedia error', error.message); } );
            }
        }
        
        private onWsClose(e: CloseEvent) {
            this.trace("close websocket");
        }
        
        private onWsMessage(e: MessageEvent) {
            let message = JSON.parse(e.data);
            let type: string = message.type;
            let data: any = message.data;
            this.trace("receive", type);
            
            switch (type) {
                case ServerMessageType.ACCEPT_STREAM:{
                    this._webRtcPeer.processAnswer(<RTCSessionDescription>data);
                    break;
                }
                
                case ServerMessageType.UPDATE_AUDIENCE:{
                    this._dom.getElement("num-audience", "live").innerText = (<number>data).toString();
                    break;
                }
                
                case ServerMessageType.ICE_CANDIDATE:{
                    this._webRtcPeer.addIceCandidate(<RTCIceCandidate>data);
                    break;
                }
                
                case ServerMessageType.COMMENT:{
                    let comment = <Comment>data;
                    let name = comment.name ? this.htmlEscape(comment.name) : "nanashi";
                    let text = this.htmlEscape(comment.text);
                    switch (comment.type) {
                        case CommentType.NORMAL: {
                            this.addComment(text, name);
                            break;
                        }
                        case CommentType.QUESTION: {
                            this.addComment(text, name);
                            this.addQuestion(text, name);
                            break;
                        }
                        case CommentType.STAMP_CLAP: {
                            this.addComment(text, name);
                            this.addStamp("img/icon_clap.png", "拍手");
                            break;
                        }
                        case CommentType.STAMP_HATENA: {
                            this.addComment(text, name);
                            this.addStamp("img/icon_hatena.png", "?");
                            break;
                        }
                        case CommentType.STAMP_PLUS: {
                            this.addComment(text, name);
                            this.addStamp("img/icon_plus.png", "+1");
                            break;
                        }
                        case CommentType.STAMP_WARAI: {
                            this.addComment(text, name);
                            this.addStamp("img/icon_www.png", "笑い");
                            break;
                        }
                    }
                    break;
                }
                
                case ServerMessageType.ERROR:{
                    this.trace("server error", data);
                    break;
                }
                
                case ServerMessageType.FINISH:{
                    // this.setState(State.SETUP);
                    this.addComment("配信は終了しました。再度終了ボタンを押すと設定画面に戻ります", "システムメッセージ");
                    break;
                }
                
                case ServerMessageType.STOP_STREAM:{
                    this.stopStream();
                    break;
                }
                
                case ServerMessageType.ACCEPT_PRESENTER:{
                    this._presentationShortId = <string>data;
                    this.setState(State.LIVE);
                    break;
                }
                
                case ServerMessageType.CREATE_LOG:{
                    this.trace(data);
                    this.addComment("ログが生成されました: " + data, "システムメッセージ");
                    this.setState(State.LIVE_AFTER);
                    break;
                }
                
                default:{
                    //this.trace("unknown message", message);
                }
            }
        }
        
        private onWsError(e: ErrorEvent) {
            this.trace("websocket error", e.message);
        }
        
        private trace(...params: any[]): void {
            if (IS_DEBUG) console.log(params);
        }
    }
}

let index = new Speech.Main();
