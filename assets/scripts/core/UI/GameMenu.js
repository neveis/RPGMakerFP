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

    onEnable: function() {
        var posX;
        var posY;
        this.node.on('touchstart', function(event) {
            posX = event.touch.getLocationX();
            posY = event.touch.getLocationY();
        }, this);

        this.node.on('touchmove', function(event) {
            var px = event.touch.getLocationX();
            var py = event.touch.getLocationY();
            //横向
            if (posX - px > 75 && !this._isShown) {
                this.show(0);
            }
            if (px - posX > 75 && this._isShown) {
                this.hide(0);
            }
            //纵向
            if (posY - py > 75 && !this._isShown) {
                this.show(1);
            }
            if (py - posY > 75 && this._isShown) {
                this.hide(1);
            }
        }, this)
    },

    /**
     * direction: 0->horizontal, 1->vertical
     */
    show: function(direction) {
        //没有动画组件则直接隐藏
        if (this.animation) {
            if (direction) {
                this.animation.play('ShowMenuSlideV');
            } else {
                this.animation.play('ShowMenuSlideH');
            }
        } else {
            this.listNode.active = true;
        }
        this._isShown = true;
    },

    hide: function(direction) {
        if (this.animation) {
            if (direction) {
                this.animation.play('HideMenuSlideV');
            } else {
                this.animation.play('HideMenuSlideH');
            }
        } else {
            this.listNode.active = false;
        }
        this._isShown = false;
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