var emptyFunc = function(event) {
    event.stopPropagation();
};
cc.Class({
    extends: cc.Component,

    properties: {
        gameNode: {
            default: null,
            type: cc.Node
        },
        messageLabel: {
            default: null,
            type: cc.Label
        },
        poolMng: null
    },
    onEnable: function() {
        this.node.on('touchstart', emptyFunc, this);
    },
    // use this for initialization
    onLoad: function() {
        this.game = this.gameNode.getComponent("Game");

        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            this.hide();
        }, this)
    },

    showMessage: function(message, cb) {
        this.game.hideUI(['default'], true, false);
        this.messageLabel.string = message;
        this.cb = cb
    },

    hide: function() {
        this.poolMng.put(this.node);
        this.game.hideUI(['default'], false, false);
        if (this.cb) this.cb.next();
    },

    onDisable: function() {
        this.node.off('touchstart', emptyFunc, this);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});