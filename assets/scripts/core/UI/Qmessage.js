cc.Class({
    extends: cc.Component,

    properties: {
        messageLabel: cc.RichText,
        animation: cc.Animation
    },

    // use this for initialization
    onLoad: function() {

    },

    onEnable: function() {
        this.animation.play("Qmessage");
    },

    close: function() {
        this.node.destroy();
    },
});