module Speech {
    
    export enum DomScene {
        SETUP,
        LIVE
    }
    
    export interface HTMLDialogElement extends HTMLElement {
        open: boolean,
        returnValue: string,
        close(): void,
        show(): void,
        showModal(): void
    }
    export interface HTMLWebViewElement extends HTMLIFrameElement {
        loadURL(url: string, options?: Object): void,
        getURL(): string,
        getTitle(): string,
        isLoading(): boolean,
        isWaitingForResponse(): boolean,
        stop(): void,
        reload(): void,
        reloadIgnoringCache(): void,
        canGoBack(): boolean,
        canGoForward(): boolean,
        canGoToOffset(offset: number): boolean,
        clearHistory(): void,
        goBack(): void,
        goForward(): void,
        goToIndex(index: number): void,
        goToOffset(offset: number): void,
        isCrashed(): boolean,
        setUserAgent(userAgent: string): void,
        getUserAgent(): string,
        insertCSS(css: string): void,
        executeJavaScript(code: string, userGesture?: boolean): void
        openDevTools(): void,
        closeDevTools(): void,
        isDevToolsOpened(): void,
        isDevToolsFocused(): void,
        inspectElement(x: number, y: number): void,
        inspectServiceWorker(): void,
        setAudioMuted(muted: boolean): void,
        isAudioMuted(): boolean,
        undo(): void,
        redo(): void,
        cut(): void,
        copy(): void,
        paste(): void,
        pasteAndMatchStyle(): void,
        delete(): void,
        selectAll(): void,
        unselect(): void,
        replace(text: string): void,
        replaceMisspelling(text: string): void,
        insertText(text: string): void,
        findInPage(text: string, options?: Object): void,
        stopFindInPage(action: string): void,
        print(options?: Object): void,
        printToPDF(options:Object, callback:Function): void,
        send(channel: string, ...args: Object[]): void,
        sendInputEvent(event: Object): void
    }
    
    export class DomManager
    {
        private _elements: { [key:string]:HTMLElement; }
        private _sceneId:string;
        
        constructor() {
            this._elements = {};
            this._sceneId = null;
            
            // init elements
            this.searchElements(window.document.body);
            
            // init scene
            this.changeScene(DomScene.SETUP);
        }
        
        /* ---------------------------------
            Element Getter
        --------------------------------- */
        
        getElement(id: string, sceneId?: string, prefix?: string): HTMLElement {
            sceneId = sceneId || this._sceneId;
            let key = prefix ? `${prefix}-${sceneId}-${id}` : `${sceneId}-${id}`;
            return this._elements[key];
        }
        
        getInput(id: string, sceneId?: string): HTMLInputElement {
            return <HTMLInputElement>(this.getElement(id, sceneId, "input"));
        }
        
        getButton(id: string, sceneId?: string): HTMLButtonElement {
            return <HTMLButtonElement>(this.getElement(id, sceneId, "button"));
        }
        
        getSelect(id: string, sceneId?: string): HTMLSelectElement {
            return <HTMLSelectElement>(this.getElement(id, sceneId, "select"));
        }
        
        getVideo(): HTMLVideoElement {
            return <HTMLVideoElement>(this._elements['live-video']);
        }
        
        getWebView(): HTMLWebViewElement {
            return <HTMLWebViewElement>(this._elements['live-slide']);
        }
        
        getDialog(): HTMLDialogElement {
            return <HTMLDialogElement>(this._elements['dialog-loading']);
        }
        
        
        /* ---------------------------------
            Scene Changer
        --------------------------------- */
        
        changeScene(scene: DomScene): void {
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
        }
        
        
        /* ---------------------------------
            init Selecter
        --------------------------------- */
        
        setMediaSource(tracks: MediaStreamTrack[]): void {
            let options: string[] = [];
            for (let track of tracks) {
                options.push(`<option value="${track.id}">${track.label}</option>`);
            }
            options.push('<option value="">なし</option>');
            
            let select = this.getSelect("video", "setup");
            select.innerHTML = options.join("");
        }
        
        
        /* ---------------------------------
            Private
        --------------------------------- */
        
        private searchElements(elem:HTMLElement): void {
            if (elem.id && elem.id.length > 0) {
                this._elements[elem.id] = elem;
            }
            
            let child = elem.firstElementChild;
            while (child) {
                this.searchElements(<HTMLElement>child);
                child = child.nextElementSibling;
            }
        }
    }
}
