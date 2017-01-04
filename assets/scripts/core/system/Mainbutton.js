cc.Class({
    extends: cc.Component,

    properties: {
        gameNode: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function() {
        this.gameNode = this.gameNode || cc.find('Game')
        this.game = this.gameNode.getComponent("Game");
        this.eventManager = this.gameNode.getComponent("EventManager");
        this.node.on(cc.Node.EventType.TOUCH_START, function(event) {
            cc.log("mainbutton pressed");
            //先检测事件，前方有事件则不执行攻击
            this.game.player.checkEventThere();
            /*
            //攻击的地图，并且前方无事件时，执行攻击
            if (this.game.map.battle) {
                this.game.player.attack();
            }
            */
        }, this);
    },

});