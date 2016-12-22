cc.Class({
    extends: cc.Component,

    properties: {
        id: 0,
        icon: {
            default: null,
            type: cc.Sprite
        },
        itemName: {
            default: null,
            type: cc.Label
        },
        price: {
            default: null,
            type: cc.Label
        },
        //discription: "",
        //模拟按钮的图片
        normal: {
            default: null,
            type: cc.SpriteFrame
        },
        pressed: {
            default: null,
            type: cc.SpriteFrame
        },
    },

    // use this for initialization
    onLoad: function() {
        //this.itemInfo = {};
        this.node.on(cc.Node.EventType.TOUCH_START, function(event) {
            this.shop.node.emit("itemEvent", {
                self: this,
                state: 1,
            });
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            this.shop.node.emit("itemEvent", {
                self: this,
                state: 2,
            });

        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            this.shop.node.emit("itemEvent", {
                self: this,
                state: 3,
            });

        }, this);
    },

    setPressed: function() {
        this.node.getComponent(cc.Sprite).spriteFrame = this.pressed;
    },

    setNormal: function() {
        this.node.getComponent(cc.Sprite).spriteFrame = this.normal;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});