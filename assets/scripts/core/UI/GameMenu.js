cc.Class({
    extends: cc.Component,

    properties: {
        _isShown: false,
        animation: cc.Animation,
        listNode: cc.Node
    },

    onLoad: function() {
        this.gameNode = cc.find("Game");
        this.game = this.gameNode.getComponent("Game");
        this.windowManager = this.gameNode.getComponent('WindowManager');
    },

    clickHandleBar: function() {
        if (this._isShown) {
            if (this.animation) {
                this.animation.play('HideMenu');
            } else {
                this.listNode.active = false;
            }
        } else {
            if (this.animation) {
                this.animation.play('ShowMenu');
            } else {
                this.listNode.active = true;
            }
        }
        this._isShown = !this._isShown;
    },

    showBag: function() {
        this.windowManager.showBagWindow();
    },

    showTask: function() {
        this.windowManager.showTaskWindow();
    },

    showSaveWindow: function() {
        this.windowManager.showSaveWindow();
    },

    showSystemWindow: function() {
        this.windowManager.showSystemWindow();
    },

});