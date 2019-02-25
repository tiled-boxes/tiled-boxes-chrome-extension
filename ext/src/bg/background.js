class TiledBoxes {

    constructor() {
        this.settings = new Store("settings", {
            "connection-host": "localhost",
            "connection-port": "7348",
        });

        this.sendTabs = this.sendTabs.bind(this);
    }

    getUser() {
        return new Promise(function(resolve) {
            chrome.identity.getProfileUserInfo((profile)=>{
                resolve(profile);
            });
        });
    }

    getTab(tabId) {
        return new Promise(function(resolve) {
            chrome.tabs.get(tabId, (tab)=>{
                resolve(tab);
            });
        });
    }

    getLastFocusedWindows() {
        return new Promise(function(resolve) {
            chrome.windows.getLastFocused({populate: true}, (window)=>{
                resolve(window);
            });
        });
    }

    getTabs() {
        return new Promise(function(resolve) {
            const tabs = [];
            chrome.windows.getAll({populate: true}, (windows)=>{
                for (let i = 0; i < windows.length; i += 1) {
                    tabs.push(...windows[i].tabs);
                }
                resolve(tabs);
            });
        });
    }

    async sendIdentity() {
        this.socket.emit('input-ws', {
            action: 'google-chrome-identity',
            identity: this.email,
        });
        return true;
    }

    async sendTabs() {
        const tabs = await this.getTabs();
        this.socket.emit('input-ws', {
            action: 'google-chrome-tabs',
            identity: this.email,
            tabs: tabs
        });
        return true;
    }

    async subscribeTabsEvents() {
        chrome.tabs.onCreated.addListener(this.sendTabs);
        chrome.tabs.onUpdated.addListener(this.sendTabs);
        chrome.tabs.onMoved.addListener(this.sendTabs);
        chrome.tabs.onActivated.addListener(this.sendTabs);
        chrome.tabs.onHighlighted.addListener(this.sendTabs);
        chrome.tabs.onDetached.addListener(this.sendTabs);
        chrome.tabs.onAttached.addListener(this.sendTabs);
        chrome.tabs.onRemoved.addListener(this.sendTabs);
        chrome.tabs.onReplaced.addListener(this.sendTabs);
        return true;
    }

    async selectTab(tabId){
        const tab = await this.getTab(tabId);
        chrome.windows.update(tab.windowId, { focused: true });
        chrome.tabs.update(tabId, { active: true });
        return true;
    }

    async getLastFocusedTab(){
        const window = await this.getLastFocusedWindows();
        for ( let i = 0; i < window.tabs.length; i += 1 ) {
            if(window.tabs[i].active === true){
                return window.tabs[i];
            }
        }
        return false;
    }

    async newTab(){
        const window = await this.getLastFocusedWindows();
        chrome.tabs.create({
            windowId: window.id,
            active: true
        });
        return true;
    }

    async reloadTab(InputTabId){
        let tabId = InputTabId;
        if(tabId === 'current'){
            const tab = await this.getLastFocusedTab();
            if(tab) {
                tabId = tab.id;
            } else {
                return false;
            }
        }
        chrome.tabs.reload(tabId);
        return true;
    }

    async gobackTab(InputTabId){
        let tabId = InputTabId;
        if(tabId === 'current'){
            const tab = await this.getLastFocusedTab();
            if(tab) {
                tabId = tab.id;
            } else {
                return false;
            }
        }
        chrome.tabs.goBack(tabId);
        return true;
    }

    async goforwardTab(InputTabId){
        let tabId = InputTabId;
        if(tabId === 'current'){
            const tab = await this.getLastFocusedTab();
            if(tab) {
                tabId = tab.id;
            } else {
                return false;
            }
        }
        chrome.tabs.goForward(tabId);
        return true;
    }

    async removeTab(InputTabId){
        let tabId = InputTabId;
        if(tabId === 'current'){
            const tab = await this.getLastFocusedTab();
            if(tab) {
                tabId = tab.id;
            } else {
                return false;
            }
        }
        chrome.tabs.remove(tabId);
        return true;
    }

    async init() {
        this.userinfo = await this.getUser();
        this.email = this.userinfo.email;

        this.socket = io(
            'http://' + this.settings.get('connection-host') + ':' +  this.settings.get('connection-port')
        );

        this.socket.on('connect', async (msg) => {
            await this.sendIdentity();
            await this.sendTabs();
            return true;
        });

        this.socket.on('output-ws', (msg) => {
            if(msg.action === 'google-chrome-select-tab'){
                if(msg.identity === this.email){
                    this.selectTab(msg.tabId);
                }
            } else if(msg.action === 'google-chrome-reload-tab'){
                if(msg.identity === this.email){
                    this.reloadTab(msg.tabId);
                }
            } else if(msg.action === 'google-chrome-goback-tab'){
                if(msg.identity === this.email){
                    this.gobackTab(msg.tabId);
                }
            } else if(msg.action === 'google-chrome-goforward-tab'){
                if(msg.identity === this.email){
                    this.goforwardTab(msg.tabId);
                }
            } else if(msg.action === 'google-chrome-remove-tab'){
                if(msg.identity === this.email){
                    this.removeTab(msg.tabId);
                }
            } else if(msg.action === 'google-chrome-new-tab'){
                if(msg.identity === this.email){
                    this.newTab();
                }
            }
        });

        await this.subscribeTabsEvents();
        return true;
    }
}

const tiledBoxes = new TiledBoxes();
tiledBoxes.init();

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.pageAction.show(sender.tab.id);
        sendResponse();
    });
