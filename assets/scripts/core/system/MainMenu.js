cc.Class({
    extends: cc.Component,

    properties: {
        saveWin: cc.Prefab
    },

    // use this for initialization
    onLoad: function() {
        this.gameNode = cc.find("Game");
        this.game = this.gameNode.getComponent("Game");
        this.windowManager = this.gameNode.getComponent("WindowManager");
    },

    showSaveWin: function() {
        this.windowManager.showSaveWindow();
    },

    startGame: function() {
        //cc.director.loadScene("Opening");
        //淡出，需要自行编写事件淡入，或注释不使用
        //this.windowManager.fadeInOrOut(false, 1, null);
        this.scheduleOnce(function() {
            //this.game.switchScene("1", 1, cc.p(384, 256), 6, true);
            //this.game.switchScene("2", 1, cc.p(640, 288), 2, true);
            //this.game.switchScene("3", 1, cc.p(1536, 288), 4, true);
            //this.game.switchScene("4", 1, cc.p(736, 0), 8, true);
            this.game.switchScene("100", 1, cc.p(768, 0), 8, true);
        }, 0.5);
    },

    exitGame: function() {
        //cc.sys.localStorage.clear();
    }
});