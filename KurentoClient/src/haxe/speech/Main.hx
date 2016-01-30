package speech;

import haxe.Json;
import js.Error;
import js.node.Fs;
import js.node.Https;
import js.node.Path;
import js.node.Url;
import js.Promise;
import kurento.core.MediaPipeline;
import kurento.elements.WebRtcEndpoint;
import kurento.kurentoClient.KurentoClient;
import shortId.ShortId;
import speech.abstracts.Activity;
import speech.abstracts.Audience;
import speech.abstracts.ActivityType;
import speech.abstracts.CommentData;
import speech.abstracts.common.LogData;
import speech.abstracts.common.MessageType.ClientMessageType;
import speech.abstracts.common.MessageType.ServerMessageType;
import speech.abstracts.common.StreamTarget;
import speech.abstracts.Message;
import speech.abstracts.Presentation;
import speech.abstracts.Presenter;
import speech.abstracts.Stream;
import speech.abstracts.User;
import speech.abstracts.Uuid;
import ws.WsServer;

class Main 
{
	private static inline var IS_DEBUG:Bool = false;
	private static inline var WS_PORT:Int = 8081;
	private static inline var WS_PATH:String = "/speech";
	private static inline var MS_URI:String = "ws://kurento.seibe.jp:8888/kurento";
	private static inline var MV_DIR:String = "file:///var/www/kurento.seibe.jp/record";
	private static inline var MV_URI:String = "https://kurento.seibe.jp/record";
	private static inline var LOG_DIR:String = "/var/www/seibe.jp/speech/log";
	private static inline var LOG_URI:String = "https://seibe.jp/speech/log";
	private static inline var TLS_KEY:String = "/etc/letsencrypt/live/seibe.jp/privkey.pem";
	private static inline var TLS_CERT:String = "/etc/letsencrypt/live/seibe.jp/cert.pem";
	
	private var _server:WsServer;
	private var _w:Map<WsSocket, User>;
	private var _u:Map<Int, User>;
	private var _p:Map<Int, Presentation>;

	static function main() 
	{
		new Main();
	}
	
	public function new()
	{
		// 初期化
		_w = new Map<WsSocket, User>();
		_u = new Map<Int, User>();
		_p = new Map<Int, Presentation>();
		
		// サーバー待ち受け
		if (IS_DEBUG) {
			// デバッグ用WSサーバー立ち上げ
			_server = new WsServer({ port: WS_PORT, path: WS_PATH });
		} else {
			// HTTPSサーバー立ち上げ
			var server = untyped Https.createServer( {
				key: Fs.readFileSync(TLS_KEY),
				cert: Fs.readFileSync(TLS_CERT)
			}, function(req, res):Void {
				// ダミーリクエスト処理
				res.writeHead(200);
				res.end("All glory to WebSockets!\n");
			}).listen(WS_PORT);
			
			// WSSサーバー立ち上げ
			_server = new WsServer({ server: cast server, path: WS_PATH });
		}
		_server.on("connection", onConnect);
	}

	/* ------------------------------------- */
	
	private function onConnect(ws:WsSocket):Void
	{
		_w[ws] = null;
		
		ws.on("message", function(data:Dynamic, flags:WsSocketFlags):Void { onMessage(ws, data, flags); } );
		ws.on("close", function():Void { onClose(ws); } );
		ws.on("error", function(error:Dynamic):Void { onError(ws, error); } );
	}
	
	private function onMessage(ws:WsSocket, data:Dynamic, flags:WsSocketFlags):Void
	{
		var json = Json.parse(data);
		var type:ClientMessageType = json.type;
		var d:Dynamic = json.data;
		var u = _w[ws];
		
		switch (type)
		{
			case ClientMessageType.JOIN_PRESENTER:
				// プレゼンテーションの作成
				initPresentation(ws, d.title, d.slideUrl, d.name);
				
			case ClientMessageType.LEAVE_PRESENTER:
				// プレゼンテーションの終了
				if (u.type != UserType.PRESENTER) return;
				finalizePresentation(cast u);
				
			case ClientMessageType.JOIN_VIEWER:
				// 聴衆のプレゼンテーションへの参加
				joinPresentation(ws, d);
				
			case ClientMessageType.LEAVE_VIEWER:
				// 聴衆のプレゼンテーションからの離脱
				if (u.type != UserType.AUDIENCE) return;
				leavePresentation(cast u);
				
			case ClientMessageType.UPDATE_SLIDE:
				// 放送者がスライドを切り替える
				if (u.type != UserType.PRESENTER) return;
				updateSlideUrl(cast u, d);
				
			case ClientMessageType.START_STREAM:
				// 放送者が映像配信を始める
				if (u.type != UserType.PRESENTER) return;
				initStream(cast u, d.offer, d.target);
				
			case ClientMessageType.STOP_STREAM:
				// 放送者が映像配信を終える
				if (u.type != UserType.PRESENTER) return;
				finalizeStream(cast u);
				
			case ClientMessageType.START_POINTER:
				// ポインター配信を始める
				
			case ClientMessageType.UPDATE_POINTER:
				// ポインター一の更新
				
			case ClientMessageType.STOP_POINTER:
				// ポインター配信を終える
				
			case ClientMessageType.CONNECT_STREAM:
				// 聴衆の映像配信への接続
				if (u.type != UserType.AUDIENCE) return;
				connectStream(cast u, d);
				
			case ClientMessageType.DISCONNECT_STREAM:
				// 聴衆の映像配信の受信停止
				if (u.type != UserType.AUDIENCE) return;
				disconnectStream(cast u);
				
			case ClientMessageType.COMMENT:
				// コメントする
				comment(u, {
					type: d.type,
					text: d.text,
					pageUrl: d.pageUrl,
					userId: u.id,
					name: d.name,
					point: d.point
				});
				
			case ClientMessageType.ICE_CANDIDATE:
				// 経路情報を交換する
				addIceCandidate(u, d);
				
			case ClientMessageType.REQUEST_LOG:
				// ログを生成する
				if (u.type != UserType.PRESENTER) return;
				makeLog(cast u);
				
			default:
				trace("ws throw", json.type);
		}
	}
	
	private function onClose(ws:WsSocket):Void
	{
		var u = _w.get(ws);
		
		if (u != null) {
			u.socket = null;
			
			switch (u.type) {
				case UserType.AUDIENCE:
					if (!u.deleted) leavePresentation(cast u);
					var p = _p[u.presentationId.toInt()];
					if (p != null) broadcast(p, ServerMessageType.UPDATE_AUDIENCE, getNumAlive(p), true);
					
				case UserType.PRESENTER:
					if (!u.deleted) finalizePresentation(cast u);
			}
		}
		
		_w.remove(ws);
	}
	
	private function onError(ws:WsSocket, error:Dynamic):Void
	{
		trace("ws error", error);
	}
	
	/* ------------------------------------- */
	
	/**
	 * プレゼンテーションを作成する
	 * @param	ws 発表者のWebSocket接続
	 * @param	title 発表タイトル
	 * @param	url スライド資料のURL
	 */
	private function initPresentation(ws:WsSocket, title:String, url:String, ?name:String):Void
	{
		// 無効なスライドURLを弾く
		var urldata = Url.parse(url);
		if (urldata.protocol != "http:" && urldata.protocol != "https:") {
			trace('無効なURLが指定された: ${url}');
			return;
		}
		
		// プレゼンテーションの作成
		var p = new Presentation();
		_p[p.id.toInt()] = p;
		
		// 発表者の作成
		var u = new Presenter(p.id, ws);
		u.ipaddr = ws.upgradeReq.connection.remoteAddress;
		u.name = name;
		_u[u.id.toInt()] = u;
		_w[ws] = u;
		
		// 発表者の登録
		p.presenterId = u.id;
		p.title = title;
		p.slideUrls.push(url);
		
		// 記録の開始
		p.activities.push(new Activity(ActivityType.INITIALIZE));
		
		// 発表者承認の伝達
		ws.send( Message.generate(ServerMessageType.ACCEPT_PRESENTER, p.shortId) );
	}
	
	/**
	 * プレゼンテーションを終了する
	 * @param	id 対象となるプレゼンテーションのUuid
	 */
	private function finalizePresentation(u:Presenter):Void
	{
		// 発表の取得
		var p = _p[u.presentationId.toInt()];
		
		// 映像配信の終了
		if (u.stream != null) {
			finalizeStream(u);
		}
		
		// 発表者への終了通知
		u.deleted = true;
		if (u.socket != null) {
			u.socket.send(Message.generate(ServerMessageType.FINISH));
			u.socket.close();
			u.socket = null;
		}
		
		// 聴衆への終了通知
		for (aid in p.audienceIds) {
			var a = _u[aid.toInt()];
			a.deleted = true;
			if (a.socket != null) {
				a.socket.send(Message.generate(ServerMessageType.FINISH));
				a.socket.close();
				a.socket = null;
			}
		}
		
		// ユーザーの削除
		_u.remove(p.presenterId.toInt());
		for (aid in p.audienceIds) {
			_u.remove(aid.toInt());
		}
		
		// プレゼンテーションの削除
		_p.remove(p.id.toInt());
	}
	
	/**
	 * プレゼンテーションに参加する
	 * @param	ws　聴衆のWebSocket接続
	 * @param	shortId 発表の招待識別子。指定が無い場合は最も古い発表に参加する
	 */
	private function joinPresentation(ws:WsSocket, ?shortId:String):Void
	{
		var p:Presentation = null;
		
		// プレゼンテーションの検索
		if (shortId != null) {
			// 希望のプレゼンテーションがあれば参加する
			for (temp in _p) {
				if (temp.shortId == shortId) {
					p = temp;
					break;
				}
			}
			if (p == null) {
				// 希望のプレゼンテーションがない
				ws.send(Message.generate(ServerMessageType.ERROR, "発表が存在しません"));
				ws.close();
				return;
			}
		} else {
			if (p == null) {
				// 指定が無いので、とりあえず適当に参加する
				for (temp in _p) {
					p = temp;
					break;
				}
			}
			if (p == null) {
				// プレゼンテーションがひとつもない
				ws.send(Message.generate(ServerMessageType.ERROR, "現在発表は行われていません"));
				ws.close();
				return;
			}
		}
		
		// 聴衆の作成
		var a = new Audience(p.id, ws);
		a.ipaddr = ws.upgradeReq.connection.remoteAddress;
		_u[a.id.toInt()] = a;
		_w[ws] = a;
		
		// 聴衆の登録
		p.audienceIds.push(a.id);
		p.activities.push(new Activity(ActivityType.JOIN(p.audienceIds.length - 1)));
		
		// 参加承認の伝達
		ws.send( Message.generate(ServerMessageType.ACCEPT_AUDIENCE, {
			title: p.title,
			slideUrl: p.slideUrls[p.slideUrls.length - 1]
		}) );
		
		// 映像配信の通知（あれば）
		var u = _u[p.presenterId.toInt()];
		if (u.endpoint != null) {
			a.socket.send(Message.generate(ServerMessageType.CAN_CONNECT_STREAM));
		}
		
		// 参加人数の更新通知
		broadcast(p, ServerMessageType.UPDATE_AUDIENCE, getNumAlive(p), true);
	}
	
	/**
	 * プレゼンテーションから離脱する
	 * @param	a 対象となる聴衆
	 */
	private function leavePresentation(a:Audience):Void
	{
		// 発表の取得
		var p = _p[a.presentationId.toInt()];
		
		// 映像受信の停止
		if (a.endpoint != null) {
			disconnectStream(a);
		}
		
		// 発表からの離脱、切断
		if (a.socket != null) {
			a.deleted = true;
			a.socket.close();
			a.socket = null;
		}
		
		// 記録
		var index = p.audienceIds.indexOf(a.id);
		p.activities.push(new Activity(ActivityType.LEAVE(index)));
	}
	
	/**
	 * スライド資料のページを変更する
	 * @param	u 発表者
	 * @param	url 遷移先のページURL
	 */
	private function updateSlideUrl(u:Presenter, url:String):Void
	{
		// 無効なスライドURLを弾く
		var urldata = Url.parse(url);
		if (urldata.protocol != "http:" && urldata.protocol != "https:") {
			trace('無効なURLが指定された: ${url}');
			return;
		}
		
		// 発表の取得
		var p = _p[u.presentationId.toInt()];
		
		// 新出のURLであれば登録する
		var index = p.slideUrls.indexOf(url);
		if (index < 0) {
			p.slideUrls.push(url);
			index = p.slideUrls.length - 1;
		}
		
		// 記録
		p.activities.push(new Activity(ActivityType.UPDATE_SLIDE(index)));
		
		// 聴衆へのURL通知
		broadcast(p, ServerMessageType.UPDATE_SLIDE, url);
	}
	
	/**
	 * 発表者による映像配信を開始する
	 * @param	u 発表者
	 * @param	sdpOffer SDPオファー
	 */
	private function initStream(u:Presenter, sdpOffer:String, target:StreamTarget):Void
	{
		// 発表の取得
		var p = _p[u.presentationId.toInt()];
		
		// 経路情報キューの初期化
		u.candidatesQueue = new Array<Dynamic>();
		
		// 発表者とメディアサーバーを繋げる
		// 1. Kurentoクライアントの作成
		KurentoClient.getSingleton(MS_URI)
			.then(function(client:KurentoClient):Promise<MediaPipeline> {
				// 2. パイプラインの作成
				if (u.socket == null || client == null) return Promise.reject();
				return client.create("MediaPipeline");
			})
			.catchError(function(error:Error):Promise<MediaPipeline> {
				// エラー処理(1)
				trace(error);
				if (u.socket != null) {
					u.socket.send(Message.generate(ServerMessageType.ERROR, error));
				}
				finalizeStream(u);
				return null;
			})
			.then(function(pipeline:MediaPipeline):Promise<Dynamic> {
				if (u.socket == null || pipeline == null) return Promise.reject();
				u.pipeline = pipeline;
				// 3. エンドポイントの作成
				var p1 = pipeline.create("WebRtcEndpoint");
				// 4. レコーダーの作成
				u.stream = new Stream(target);
				var p2 = pipeline.create("RecorderEndpoint", {
					uri: Path.join(MV_DIR, u.stream.filename)
				});
				return Promise.all([p1, p2]);
			})
			.then(function(endpoints:Array<Dynamic>):Promise<Dynamic> {
				if (u.socket == null || u.pipeline == null) return Promise.reject();
				u.endpoint = endpoints[0];
				u.recorder = endpoints[1];
				if (u.endpoint == null || u.recorder == null) return Promise.reject();
				// 5. レコーダーへの接続
				return u.endpoint.connect(u.recorder);
			})
			.then(function(dummy:Dynamic):Promise<Dynamic> {
				if (u.socket == null || u.pipeline == null) return Promise.reject();
				if (u.endpoint == null || u.recorder == null) return Promise.reject();
				// 6. 録画の開始
				u.recorder.record();
				// 7. 接続・経路情報の交換
				exchangeCandidates(u);
				var p1 = u.endpoint.processOffer(sdpOffer);
				var p2 = u.endpoint.gatherCandidates();
				return Promise.all([p1, p2]);
			})
			.then(function(results:Array<Dynamic>):Promise<Dynamic> {
				if (u.socket == null || u.pipeline == null) return Promise.reject();
				var sdpAnswer = results[0];
				// 記録
				p.streams.push(u.stream);
				p.activities.push(new Activity(ActivityType.STREAM_BEGIN(p.streams.length - 1)));
				// 発表者への接続処理の完了通知
				u.socket.send(Message.generate(ServerMessageType.ACCEPT_STREAM, sdpAnswer));
				// 聴衆への接続可能通知
				broadcast(p, ServerMessageType.CAN_CONNECT_STREAM);
				return null;
			})
			.catchError(function(error:Error):Promise<MediaPipeline> {
				// エラー処理(2-7)
				trace(error);
				if (u.socket != null) {
					u.socket.send(Message.generate(ServerMessageType.ERROR, error));
				}
				finalizeStream(u);
				return null;
			});
	}
	
	/**
	 * 発表者による映像配信を終了する
	 * @param	u 発表者
	 */
	private function finalizeStream(u:Presenter):Void
	{
		// 発表の取得
		var p = _p[u.presentationId.toInt()];
		
		// 映像配信の終了予告
		broadcast(p, ServerMessageType.WILL_STOP_STREAM, null, true);
		
		// 記録
		var index = p.streams.indexOf(u.stream);
		p.activities.push(new Activity(ActivityType.STREAM_END(index)));
		
		// 発表者・メディアサーバー間の接続解消
		try {
			if (u.recorder != null) {
				u.recorder.stop();
				u.recorder.release();
			}
			if (u.pipeline != null) u.pipeline.release();
			if (u.endpoint != null) u.endpoint.release();
		} catch (e:Error) {
			trace(e);
		}
		u.stream = null;
		u.candidatesQueue = null;
		u.recorder = null;
		u.pipeline = null;
		u.endpoint = null;
		u.socket.send(Message.generate(ServerMessageType.STOP_STREAM));
		
		// 聴衆・メディアサーバー間の接続解消
		for (aid in p.audienceIds) {
			var a = _u[aid.toInt()];
			disconnectStream(cast a);
		}
	}
	
	/**
	 * 映像配信に聴衆を接続する
	 * @param	a 聴衆
	 * @param	sdpOffer SDPオファー
	 */
	private function connectStream(a:Audience, sdpOffer:String):Void
	{
		// 発表の取得
		var p = _p[a.presentationId.toInt()];
		var u = _u[p.presenterId.toInt()];
		
		// 配信中でなければ中断する
		if (u.endpoint == null || u.pipeline == null) {
			a.socket.send(Message.generate(ServerMessageType.ERROR, "映像配信がないです"));
			return;
		}
		
		// 1. エンドポイントの作成
		var sdpAnswer = null;
		a.pipeline = u.pipeline;
		a.pipeline.create("WebRtcEndpoint")
			.then(function(endpoint:WebRtcEndpoint):Promise<String> {
				if (a.socket == null || a.pipeline == null) return Promise.reject();
				a.endpoint = endpoint;
				exchangeCandidates(u);
				// 2. SDPオファー
				return endpoint.processOffer(sdpOffer);
			})
			.then(function(answer:String):Promise<Dynamic> {
				if (a.socket == null || a.pipeline == null) return Promise.reject();
				sdpAnswer = answer;
				// 3. エンドポイント間の接続
				return u.endpoint.connect(a.endpoint);
			})
			.then(function(dummy:Dynamic):Promise<Dynamic> {
				if (a.socket == null || a.pipeline == null) return Promise.reject();
				// 4. 経路の選択
				return a.endpoint.gatherCandidates();
			})
			.then(function(dummy:Dynamic):Promise<Dynamic> {
				if (a.socket == null || a.pipeline == null) return Promise.reject();
				// 接続完了通知
				a.socket.send(Message.generate(ServerMessageType.ACCEPT_STREAM, sdpAnswer));
				return null;
			})
			.catchError(function(error:Error):Void {
				// エラー処理
				trace(error);
				a.socket.send(Message.generate(ServerMessageType.ERROR, error));
			});
	}
	
	/**
	 * 映像配信から聴衆を切断する
	 * @param	a 聴衆
	 */
	private function disconnectStream(a:Audience):Void
	{
		// 聴衆・メディアサーバー間の接続解消
		try {
			if (a.endpoint != null) a.endpoint.release();
		} catch (e:Error) {
			trace(e);
		}
		a.candidatesQueue = null;
		a.pipeline = null;
		a.endpoint = null;
		
		// 映像配信の終了通知
		if (a.socket != null) {
			a.socket.send(Message.generate(ServerMessageType.STOP_STREAM));
		}
	}
	
	/**
	 * コメントする
	 * @param	u 参加者
	 * @param	d コメント情報
	 */
	private function comment(u:User, d:CommentData):Void
	{
		// 発表の取得
		var p = _p[u.presentationId.toInt()];
		
		// 記録
		p.activities.push(new Activity(ActivityType.COMMENT(d)));
		
		// コメントのブロードキャスト
		broadcast(p, ServerMessageType.COMMENT, d, true);
	}
	
	private function startPointer(u:Presenter):Void
	{
		var p = _p[u.presentationId.toInt()];
		
		broadcast(p, ServerMessageType.START_POINTER);
	}
	
	private function updatePointer(u:Presenter, d:{x:Float, y:Float}):Void
	{
		var p = _p[u.presentationId.toInt()];
		
		broadcast(p, ServerMessageType.UPDATE_POINTER, d);
	}
	
	private function stopPointer(u:Presenter):Void
	{
		var p = _p[u.presentationId.toInt()];
		
		broadcast(p, ServerMessageType.STOP_POINTER);
	}
	
	/**
	 * ログを生成する
	 * @param	u 発表者
	 */
	private function makeLog(u:Presenter):Void
	{
		// 発表の取得
		var p = _p[u.presentationId.toInt()];
		
		// 映像配信の終了
		if (u.stream != null) finalizeStream(u);
		
		// 記録の終了
		p.activities.push(new Activity(ActivityType.FINALIZE));
		
		// ログの生成
		var log:LogData = {
			title: p.title,
			time_begin: p.activities[0].time,
			time_end: p.activities[p.activities.length - 1].time,
			presenter: { ipaddr: u.ipaddr, name: u.name },
			audience: [],
			slide: [],
			attachment: [],
			activity: []
		};
		for (i in 0...p.audienceIds.length) {
			var a = _u[p.audienceIds[i].toInt()];
			log.audience.push( { index: i, ipaddr: a.ipaddr , name: a.name } );
		}
		for (i in 0...p.slideUrls.length) {
			var url = Std.string(p.slideUrls[i]);
			log.slide.push( { index: i, url: url } );
		}
		for (i in 0...p.streams.length) {
			var url = Path.join(MV_URI, p.streams[i].filename);
			log.attachment.push( { index: i, type: "video/webm", url: url, name: p.streams[i].target } );
		}
		for (i in 0...p.activities.length) {
			var act = p.activities[i];
			switch (act.type) {
				case ActivityType.INITIALIZE:
					// 記録を開始した
					log.activity.push( { index: i, time: act.time, type: "begin" } );
					
				case ActivityType.FINALIZE:
					// 記録を終了した
					log.activity.push( { index: i, time: act.time, type: "end" } );
					
				case ActivityType.JOIN(index):
					// 聴衆が参加した
					log.activity.push( { index: i, time: act.time, type: "join", audience_index: index } );
					
				case ActivityType.LEAVE(index):
					// 聴衆が離脱した
					log.activity.push( { index: i, time: act.time, type: "leave", audience_index: index } );
					
				case ActivityType.UPDATE_SLIDE(index):
					// スライド資料のページを更新した
					log.activity.push( { index: i, time: act.time, type: "update_slide", slide_index: index } );
					
				case ActivityType.STREAM_BEGIN(index):
					// 映像配信を始めた
					log.activity.push( { index: i, time: act.time, type: "begin_stream", attachment_index: index } );
					
				case ActivityType.STREAM_END(index):
					// 映像配信を終えた
					log.activity.push( { index: i, time: act.time, type: "end_stream", attachment_index: index } );
					
				case ActivityType.COMMENT(data):
					// コメントした
					var slideIndex = p.slideUrls.indexOf(data.pageUrl);
					var audienceIndex = p.audienceIds.indexOf(data.userId);
					log.activity.push( { index: i, time: act.time, type: "comment", slide_index: slideIndex, comment: {
						text: data.text,
						user_name: data.name,
						comment_type: Std.string(data.type)
					}, point: data.point, audience_index: audienceIndex } );
					
			}
		}
		
		// ログの保存
		var filename = ShortId.generate() + ".json";
		var filepath = Path.join(LOG_DIR, filename);
		Fs.appendFileSync(filepath, Json.stringify(log));
		
		// ログの送信
		if (u.socket != null) {
			var url = Path.join(LOG_URI, filename);
			u.socket.send(Message.generate(ServerMessageType.CREATE_LOG, url));
		}
	}
	
	/**
	 * メディアサーバーに経路情報を追加する
	 * @param	u 参加者
	 * @param	candidate 経路情報
	 */
	private function addIceCandidate(u:User, candidate:Dynamic):Void
	{
		candidate = untyped kurento.register.complexTypes.IceCandidate(candidate);
		
		// 接続情報の追加
		if (u.endpoint != null) {
			u.endpoint.addIceCandidate(candidate);
		} else {
			if (u.candidatesQueue == null) u.candidatesQueue = new Array<Dynamic>();
			u.candidatesQueue.push(candidate);
		}
	}
	
	/**
	 * メディアサーバーと経路情報を交換する
	 * @param	u 参加者
	 */
	private function exchangeCandidates(u:User):Void
	{
		while (u.candidatesQueue.length > 0) {
			var candidate = u.candidatesQueue.shift();
			u.endpoint.addIceCandidate(candidate);
		}
		u.endpoint.on("OnIceCandidate", function(e:Dynamic):Void {
			var candidate = untyped kurento.register.complexTypes.IceCandidate(e.candidate);
			u.socket.send(Message.generate(ServerMessageType.ICE_CANDIDATE, candidate));
		});
	}
	
	/**
	 * プレゼンテーションに属するすべてのユーザーにメッセージを送信する
	 * @param	p 対象のプレゼンテーション
	 * @param	type メッセージ種別
	 * @param	data メッセージデータ
	 * @param	withPresenter 送信先に発表者を含むか否か
	 */
	private function broadcast(p:Presentation, type:ServerMessageType, ?data:Dynamic, ?withPresenter:Bool = false):Void
	{
		// 発表者への送信
		if (withPresenter) {
			var u = _u[p.presenterId.toInt()];
			if (u.socket != null) {
				u.socket.send(Message.generate(type, data));
			}
		}
		
		// 聴衆への送信
		for (aid in p.audienceIds) {
			var a = _u[aid.toInt()];
			if (a.socket != null) {
				a.socket.send(Message.generate(type, data));
			}
		}
	}
	
	/**
	 * 現在有効な聴衆の人数を返す
	 * @param	p 対象となるプレゼンテーション
	 * @return 接続中の聴衆人数
	 */
	private function getNumAlive(p:Presentation):Int
	{
		var num = 0;
		
		for (aid in p.audienceIds) {
			var a = _u[aid.toInt()];
			if (a.socket != null) num++;
		}
		
		return num;
	}
	
}
