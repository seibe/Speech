/// <reference path="..\..\typings\main.d.ts" />

module SpeechElectron
{
    const electron = require('electron');
    const app = electron.app;
    const BrowserWindow = electron.BrowserWindow;
    
    export class Main
    {
        constructor() {
            app.on('window-all-closed', app.quit);
            app.on('ready', this.init);
        }
        
        private init() {
            let win = new BrowserWindow({
                width: 1280,
                height: 720,
                minWidth: 600,
                minHeight: 400,
                acceptFirstMouse: true,
                titleBarStyle: 'hidden'
            });
            win.setMenuBarVisibility(false);
            win.loadURL('file://' + __dirname + '/index.html');
            win.on('closed', ()=> {
                win = null;
            });
        }
    }
}

let main = new SpeechElectron.Main();
