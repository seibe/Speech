package speech.manager;
import electron.MediaStreamTrack;
import js.Browser;
import js.Error;
import js.html.LocalMediaStream;

class MediaManager
{
	private var _trackList:Array<MediaStreamTrack>;
	
	public function new() 
	{
		_trackList = new Array<MediaStreamTrack>();
	}
	
	public function getTrackList(callback:Array<MediaStreamTrack>->Void):Void
	{
		MediaStreamTrack.getSources(function(data:Array<MediaStreamTrack>):Void {
			_trackList = data.copy();
			callback(data);
		});
	}
	
	public function getUserMedia(videoId:String, audioId:String, success:LocalMediaStream->Void, error:Error->Void):Void
	{
		var reqVideo = videoId != null && videoId.length > 0;
		var reqAudio = audioId != null && audioId.length > 0;
		
		if (reqVideo && reqAudio) {
			// video and audio
			untyped Browser.navigator.webkitGetUserMedia( {
				video: { optional: [ { sourceId: videoId } ] },
				audio: { optional: [ { sourceId: audioId } ] }
			}, success, error);
		}
		else if (reqVideo) {
			// video only
			untyped Browser.navigator.webkitGetUserMedia( {
				video: { optional: [ { sourceId: videoId } ] }
			}, success, error);
		}
		else if (reqAudio) {
			// audio only
			untyped Browser.navigator.webkitGetUserMedia( {
				video: false,
				audio: { optional: [ { sourceId: audioId } ] }
			}, success, error);
		}
	}
}