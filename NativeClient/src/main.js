var SpeechElectron;
(function (SpeechElectron) {
    var electron = require('electron');
    var app = electron.app;
    var BrowserWindow = electron.BrowserWindow;
    var Main = (function () {
        function Main() {
            app.on('window-all-closed', app.quit);
            app.on('ready', this.init);
        }
        Main.prototype.init = function () {
            var win = new BrowserWindow({
                width: 1280,
                height: 720,
                minWidth: 600,
                minHeight: 400,
                acceptFirstMouse: true,
                titleBarStyle: 'hidden'
            });
            win.setMenuBarVisibility(false);
            win.loadURL('file://' + __dirname + '/index.html');
            win.on('closed', function () {
                win = null;
            });
        };
        return Main;
    }());
    SpeechElectron.Main = Main;
})(SpeechElectron || (SpeechElectron = {}));
var main = new SpeechElectron.Main();
//# sourceMappingURL=Main.js.map