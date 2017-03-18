const GameEvent = require('GameEvent');

var emptyFunc = function(event) {
    event.stopPropagation();
};
cc.Class({
    extends: cc.Component,

    properties: {
        optionNodes: {
            default: [],
            type: cc.Node
        },
        labels: {
            default: [],
            type: cc.Label
        },

        gameNode: {
            default: null,
            type: cc.Node
        },
        dialogueComp: null,
        poolMng: null
    },

    // use this for initialization
    onLoad: function() {
        this.game = this.gameNode.getComponent("Game");
    },

    onEnable: function() {
        this.node.on('touchstart', emptyFunc, this);
    },

    showOption: function(options, cb) {
        this.game.hideUI(['default'], true, false);
        this.options = options;
        //显示需要数量的选项
        for (var i = 0; i < this.optionNodes.length; i++) {
            if (i < options.length) {
                this.optionNodes[i].active = true;
                this.labels[i].string = options[i].label;
            } else
                this.optionNodes[i].active = false;
        }
        this.cb = cb;
    },

    option0: function() {
        var index = 0;
        this.execute(index);
    },

    option1: function() {
        var index = 1;
        this.execute(index);
    },

    option2: function() {
        var index = 2;
        this.execute(index);
    },

    option3: function() {
        var index = 3;
        this.execute(index);
    },

    execute: function(optionIndex) {
        let subEvent = this.options[optionIndex].subEvent
        let gameEvent = new GameEvent();
        gameEvent.setCallback(this.cb);
        if (this.cb instanceof GameEvent) {
            gameEvent.setTarget(this.cb.event.target);
            this.cb.setChild(gameEvent);
        }
        this.dialogueComp.updataDisplay();
        this.options = null;
        this.game.hideUI(['default'], false, false);
        gameEvent.startBySubEvent(subEvent);
        this.poolMng.put(this.node);
    },

    onDisable: function() {
        this.node.off('touchstart', emptyFunc, this);
    }
});