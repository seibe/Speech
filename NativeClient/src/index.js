var Speech;
(function (Speech) {
    Speech.CommentType = {
        NORMAL: "normal",
        QUESTION: "question",
        STAMP_PLUS: "stamp_plus",
        STAMP_CLAP: "stamp_clap",
        STAMP_HATENA: "stamp_hatena",
        STAMP_WARAI: "stamp_warai"
    };
})(Speech || (Speech = {}));
var Speech;
(function (Speech) {
    Speech.ServerMessageType = {
        ACCEPT_STREAM: "acceptStream",
        UPDATE_AUDIENCE: "updateAudience",
        ICE_CANDIDATE: "iceCandidate",
        COMMENT: "onComment",
        ERROR: "onError",
        FINISH: "finish",
        WILL_STOP_STREAM: "willStopStream",
        STOP_STREAM: "onStopStream",
        ACCEPT_PRESENTER: "acceptPresenter",
        CREATE_LOG: "onCreateLog",
        ACCEPT_AUDIENCE: "acceptAudience",
        CAN_CONNECT_STREAM: "canConnectStream",
        UPDATE_SLIDE: "onUpdateSlide",
        START_POINTER: "startPointer",
        UPDATE_POINTER: "updatePointer",
        STOP_POINTER: "stopPointer"
    };
    Speech.ClientMessageType = {
        ICE_CANDIDATE: "iceCandidate",
        JOIN_PRESENTER: "joinPresenter",
        LEAVE_PRESENTER: "leavePresenter",
        UPDATE_SLIDE: "updateSlide",
        START_STREAM: "startStream",
        STOP_STREAM: "stopStream",
        START_POINTER: "startPointer",
        UPDATE_POINTER: "updatePointer",
        STOP_POINTER: "stopPointer",
        REQUEST_LOG: "requestLog",
        JOIN_VIEWER: "joinViewer",
        LEAVE_VIEWER: "leaveViewer",
        CONNECT_STREAM: "connectStream",
        DISCONNECT_STREAM: "disconnectStream",
        COMMENT: "comment"
    };
})(Speech || (Speech = {}));
var Speech;
(function (Speech) {
    (function (DomScene) {
        DomScene[DomScene["SETUP"] = 0] = "SETUP";
        DomScene[DomScene["LIVE"] = 1] = "LIVE";
    })(Speech.DomScene || (Speech.DomScene = {}));
    var DomScene = Speech.DomScene;
    var DomManager = (function () {
        function DomManager() {
            this._elements = {};
            this._sceneId = null;
            this.searchElements(window.document.body);
            this.changeScene(DomScene.SETUP);
        }
        DomManager.prototype.getElement = function (id, sceneId, prefix) {
            sceneId = sceneId || this._sceneId;
            var key = prefix ? prefix + "-" + sceneId + "-" + id : sceneId + "-" + id;
            return this._elements[key];
        };
        DomManager.prototype.getInput = function (id, sceneId) {
            return (this.getElement(id, sceneId, "input"));
        };
        DomManager.prototype.getButton = function (id, sceneId) {
            return (this.getElement(id, sceneId, "button"));
        };
        DomManager.prototype.getSelect = function (id, sceneId) {
            return (this.getElement(id, sceneId, "select"));
        };
        DomManager.prototype.getVideo = function () {
            return (this._elements['live-video']);
        };
        DomManager.prototype.getWebView = function () {
            return (this._elements['live-slide']);
        };
        DomManager.prototype.getDialog = function () {
            return (this._elements['dialog-loading']);
        };
        DomManager.prototype.changeScene = function (scene) {
            switch (scene) {
                case DomScene.SETUP: {
                    this._sceneId = "setup";
                    this._elements['scene-setup'].classList.remove('hide');
                    this._elements['scene-live'].classList.add('hide');
                    break;
                }
                case DomScene.LIVE: {
                    this._sceneId = "live";
                    this._elements['scene-setup'].classList.add('hide');
                    this._elements['scene-live'].classList.remove('hide');
                    break;
                }
                default:
                    throw 'scene error';
            }
        };
        DomManager.prototype.setMediaSource = function (tracks) {
            var options = [];
            for (var _i = 0, tracks_1 = tracks; _i < tracks_1.length; _i++) {
                var track = tracks_1[_i];
                options.push("<option value=\"" + track.id + "\">" + track.label + "</option>");
            }
            options.push('<option value="">なし</option>');
            var select = this.getSelect("video", "setup");
            select.innerHTML = options.join("");
        };
        DomManager.prototype.searchElements = function (elem) {
            if (elem.id && elem.id.length > 0) {
                this._elements[elem.id] = elem;
            }
            var child = elem.firstElementChild;
            while (child) {
                this.searchElements(child);
                child = child.nextElementSibling;
            }
        };
        return DomManager;
    }());
    Speech.DomManager = DomManager;
})(Speech || (Speech = {}));
var Speech;
(function (Speech) {
    var WS_URL = "wss://seibe.jp:8081/speech";
    var IS_DEBUG = false;
    var State;
    (function (State) {
        State[State["SETUP"] = 0] = "SETUP";
        State[State["LIVE_BEFORE"] = 1] = "LIVE_BEFORE";
        State[State["LIVE"] = 2] = "LIVE";
        State[State["LIVE_AFTER"] = 3] = "LIVE_AFTER";
    })(State || (State = {}));
    var Main = (function () {
        function Main() {
            var _this = this;
            window.onload = function () { _this.init(); };
            window.onunload = function () { _this.finalize(); };
        }
        Main.prototype.init = function () {
            this._dom = new Speech.DomManager();
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
        };
        Main.prototype.finalize = function () {
            if (!this._ws) {
                this._ws.close();
                this._ws = null;
            }
        };
        Main.prototype.setState = function (nextState) {
            var _this = this;
            if (this._state == nextState)
                return;
            switch (this._state) {
                case State.SETUP: {
                    this._title = this._dom.getInput("title", "setup").value;
                    this._username = this._dom.getInput("presenter", "setup").value;
                    this._slideUrl = this._dom.getInput("slide-url", "setup").value;
                    this._videoSourceId = this._dom.getSelect("video", "setup").value;
                    this._dom.getButton("submit", "setup").removeEventListener("click", this);
                    break;
                }
                case State.LIVE_BEFORE: {
                    this._dom.getDialog().close();
                    break;
                }
                case State.LIVE: {
                    this.stopPointerCapture();
                    this.stopStream();
                    this.send(Speech.ClientMessageType.LEAVE_PRESENTER);
                    if (this._timer != null)
                        clearInterval(this._timer);
                    this._timer = null;
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
                    if (this._ws)
                        this._ws.close();
                    this._ws = null;
                    this._dom.getButton("finish").removeEventListener("click", this);
                    break;
                }
            }
            switch (nextState) {
                case State.SETUP: {
                    this._dom.changeScene(Speech.DomScene.SETUP);
                    var sources_1 = [];
                    MediaStreamTrack.getSources(function (tracks) {
                        for (var _i = 0, tracks_2 = tracks; _i < tracks_2.length; _i++) {
                            var track = tracks_2[_i];
                            if (track.kind == "video")
                                sources_1.push(track);
                        }
                        _this._dom.setMediaSource(sources_1);
                    });
                    this._dom.getButton("submit").addEventListener("click", this);
                    break;
                }
                case State.LIVE_BEFORE: {
                    this._dom.getDialog().showModal();
                    this._ws = new WebSocket(WS_URL);
                    this._ws.addEventListener("open", this.onWsConnect.bind(this));
                    this._ws.addEventListener("close", this.onWsClose.bind(this));
                    this._ws.addEventListener("message", this.onWsMessage.bind(this));
                    this._ws.addEventListener("error", this.onWsError.bind(this));
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
                    this._beginTime = (new Date()).getTime();
                    this._timer = setInterval(function () { _this.onUpdate(); }, 1000);
                    this._dom.changeScene(Speech.DomScene.LIVE);
                    this._slideView.focus();
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
        };
        Main.prototype.send = function (type, data) {
            if (!this._ws) {
                throw 'send error';
            }
            this.trace("send", type);
            this._ws.send(JSON.stringify({
                type: type,
                data: data
            }));
        };
        Main.prototype.stopPointerCapture = function () {
        };
        Main.prototype.stopStream = function () {
            if (!this._webRtcPeer)
                return;
            this.send(Speech.ClientMessageType.STOP_STREAM);
            this._webRtcPeer.dispose();
            this._webRtcPeer = null;
        };
        Main.prototype.addComment = function (text, name) {
            this._dom.getElement("comment-list", "live").insertAdjacentHTML("afterbegin", "<li class=\"discuss-comment new\"><img class=\"discuss-comment-image\" src=\"img/avatar.png\"><div class=\"discuss-comment-body\"><strong>" + name + "</strong><p>" + text + "</p></div></li>");
            document.querySelector(".discuss-comment.new").addEventListener("animationend", function (e) {
                if (e.animationName == "comment-move-in") {
                    var elem = e.target;
                    elem.classList.remove("new");
                }
            });
        };
        Main.prototype.addQuestion = function (text, name) {
            this._dom.getElement("question-list", "live").insertAdjacentHTML("beforeend", "<li class=\"discuss-comment\"><img class=\"discuss-comment-image\" src=\"img/avatar.png\"><div class=\"discuss-comment-body\"><strong>" + name + "</strong><p>" + text + "</p></div></li>");
            this._numQuestion++;
            this._dom.getElement("num-question", "live").innerText = this._numQuestion.toString();
        };
        Main.prototype.addStamp = function (src, alt) {
            var _this = this;
            for (var i = 0; i < 3; i++) {
                setTimeout(function () {
                    var left = i * 5 + 40 + Math.floor(Math.random() * 28);
                    _this._dom.getElement("atmos", "live").insertAdjacentHTML("afterbegin", "<img class=\"live-atmos-stamp\" alt=\"" + alt + "\" src=\"" + src + "\" style=\"left: " + left + "%\" />");
                    var stamp = document.getElementsByClassName("live-atmos-stamp").item(0);
                    setTimeout(function () { stamp.remove(); stamp = null; }, 4000);
                }, 500 * i);
            }
        };
        Main.prototype.htmlEscape = function (s) {
            return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
        };
        Main.prototype.handleEvent = function (e) {
            this.trace(e.type, e.currentTarget);
            switch (e.type) {
                case "resize": {
                    if (e.currentTarget == window)
                        this.onResize();
                    break;
                }
                case "keydown": {
                    if (e.currentTarget == this._slideView)
                        this.onChangeSlide();
                    if (e.currentTarget == window)
                        this.onKeyDown();
                    break;
                }
                case "wheel": {
                    if (e.currentTarget == this._slideView)
                        this.onChangeSlide();
                    break;
                }
                case "mouseup": {
                    if (e.currentTarget == this._slideView)
                        this.onChangeSlide();
                    break;
                }
                case "focus": {
                    if (e.currentTarget == this._slideView)
                        window.removeEventListener("keydown", this);
                    break;
                }
                case "blur": {
                    if (e.currentTarget == this._slideView)
                        window.addEventListener("keydown", this);
                    break;
                }
                case "click": {
                    if (e.currentTarget == this._dom.getButton("submit", "setup"))
                        this.onClickStart();
                    if (e.currentTarget == this._dom.getButton("finish", "live"))
                        this.onClickFinish();
                    break;
                }
            }
        };
        Main.prototype.onChangeSlide = function () {
            var _this = this;
            if (this._state != State.LIVE)
                return;
            setTimeout(function () {
                var url = _this._slideView.getURL();
                if (_this._prevUrl != url) {
                    _this.send(Speech.ClientMessageType.UPDATE_SLIDE, url);
                    _this._prevUrl = url;
                }
            }, 250);
        };
        Main.prototype.onClickStart = function () {
            var url = this._dom.getInput("slide-url").value;
            var title = this._dom.getInput("title").value;
            var checker = /https?:\/\/.+/;
            if (url.length == 0 || url.length == 0 || !checker.test(url)) {
                this._dom.getInput("slide-url").focus();
            }
            else {
                this.setState(State.LIVE_BEFORE);
            }
        };
        Main.prototype.onClickFinish = function () {
            switch (this._state) {
                case State.LIVE:
                    this.send(Speech.ClientMessageType.REQUEST_LOG);
                    break;
                case State.LIVE_AFTER:
                    this.setState(State.SETUP);
                    break;
                default:
                    throw 'finish event error';
            }
        };
        Main.prototype.onResize = function () {
            var playerHeight = window.innerHeight - 272;
            this._slideView.style.height = playerHeight + "px";
        };
        Main.prototype.onKeyDown = function () {
            this._slideView.focus();
        };
        Main.prototype.onUpdate = function () {
            var elapsedTime = new Date().getTime() - this._beginTime;
            var min = Math.floor(elapsedTime / 60000);
            var sec = Math.floor(elapsedTime / 1000) % 60;
            this._dom.getElement("elapsed-time", "live").innerText = (min < 10 ? "0" + min : "" + min) + ":" + (sec < 10 ? "0" + sec : "" + sec);
        };
        Main.prototype.onWsConnect = function (e) {
            var _this = this;
            this.send(Speech.ClientMessageType.JOIN_PRESENTER, {
                title: this._title,
                slideUrl: this._slideUrl,
                name: this._username
            });
            if (this._videoSourceId && this._videoSourceId.length > 0) {
                var videoElem_1 = this._dom.getVideo();
                navigator.getUserMedia({
                    video: { optional: [{ sourceId: this._videoSourceId }] },
                    audio: true
                }, function (stream) {
                    _this._webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly({
                        localVideo: videoElem_1,
                        videoStream: stream,
                        onicecandidate: function (candidate) { _this.send(Speech.ClientMessageType.ICE_CANDIDATE, candidate); }
                    }, function (error) {
                        if (error) {
                            _this.trace('webrtcpeer error', error);
                            _this.setState(State.SETUP);
                        }
                        _this._webRtcPeer.generateOffer(function (err, sdp) {
                            if (err)
                                _this.trace('generateoffer error', error);
                            _this.send(Speech.ClientMessageType.START_STREAM, {
                                offer: sdp,
                                target: "webcam"
                            });
                        });
                    });
                }, function (error) { _this.trace('getusermedia error', error.message); });
            }
        };
        Main.prototype.onWsClose = function (e) {
            this.trace("close websocket");
        };
        Main.prototype.onWsMessage = function (e) {
            var message = JSON.parse(e.data);
            var type = message.type;
            var data = message.data;
            this.trace("receive", type);
            switch (type) {
                case Speech.ServerMessageType.ACCEPT_STREAM: {
                    this._webRtcPeer.processAnswer(data);
                    break;
                }
                case Speech.ServerMessageType.UPDATE_AUDIENCE: {
                    this._dom.getElement("num-audience", "live").innerText = data.toString();
                    break;
                }
                case Speech.ServerMessageType.ICE_CANDIDATE: {
                    this._webRtcPeer.addIceCandidate(data);
                    break;
                }
                case Speech.ServerMessageType.COMMENT: {
                    var comment = data;
                    var name_1 = comment.name ? this.htmlEscape(comment.name) : "nanashi";
                    var text = this.htmlEscape(comment.text);
                    switch (comment.type) {
                        case Speech.CommentType.NORMAL: {
                            this.addComment(text, name_1);
                            break;
                        }
                        case Speech.CommentType.QUESTION: {
                            this.addComment(text, name_1);
                            this.addQuestion(text, name_1);
                            break;
                        }
                        case Speech.CommentType.STAMP_CLAP: {
                            this.addComment(text, name_1);
                            this.addStamp("img/icon_clap.png", "拍手");
                            break;
                        }
                        case Speech.CommentType.STAMP_HATENA: {
                            this.addComment(text, name_1);
                            this.addStamp("img/icon_hatena.png", "?");
                            break;
                        }
                        case Speech.CommentType.STAMP_PLUS: {
                            this.addComment(text, name_1);
                            this.addStamp("img/icon_plus.png", "+1");
                            break;
                        }
                        case Speech.CommentType.STAMP_WARAI: {
                            this.addComment(text, name_1);
                            this.addStamp("img/icon_www.png", "笑い");
                            break;
                        }
                    }
                    break;
                }
                case Speech.ServerMessageType.ERROR: {
                    this.trace("server error", data);
                    break;
                }
                case Speech.ServerMessageType.FINISH: {
                    this.addComment("配信は終了しました。再度終了ボタンを押すと設定画面に戻ります", "システムメッセージ");
                    break;
                }
                case Speech.ServerMessageType.STOP_STREAM: {
                    this.stopStream();
                    break;
                }
                case Speech.ServerMessageType.ACCEPT_PRESENTER: {
                    this._presentationShortId = data;
                    this.setState(State.LIVE);
                    break;
                }
                case Speech.ServerMessageType.CREATE_LOG: {
                    this.trace(data);
                    this.addComment("ログが生成されました: " + data, "システムメッセージ");
                    this.setState(State.LIVE_AFTER);
                    break;
                }
                default: {
                }
            }
        };
        Main.prototype.onWsError = function (e) {
            this.trace("websocket error", e.message);
        };
        Main.prototype.trace = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            if (IS_DEBUG)
                console.log(params);
        };
        return Main;
    }());
    Speech.Main = Main;
})(Speech || (Speech = {}));
var index = new Speech.Main();
//# sourceMappingURL=index.js.map