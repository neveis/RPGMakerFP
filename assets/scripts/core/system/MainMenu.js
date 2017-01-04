cc.Class({
    extends: cc.Component,

    properties: {
        saveWin: cc.Prefab
    },

    // use this for initialization
    onLoad: function() {
        this.gameNode = cc.find("Game");
        this.game = this.gameNode.getComponent("Game");
    },

    showSaveWin: function() {
        var node = cc.instantiate(this.saveWin);
        var comp = node.getComponent("SaveSystem");
        comp.gameNode = this.gameNode;
        this.gameNode.addChild(node);
        comp.showSaveWin();
    },

    startGame: function() {
        //cc.director.loadScene("Opening");
        this.game.switchScene("1", 1, cc.p(384, 256), 6, true);
    },

    exitGame: function() {
        //cc.sys.localStorage.clear();
    }
});