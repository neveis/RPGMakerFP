cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        itemId: "",
        icon: {
            default: null,
            type: cc.SpriteFrame
        },
        itemName: "",
        itemNum: 0,
        description: "",
        iconSprite: {
            default: null,
            type: cc.Sprite
        },
        nameLabel: {
            default: null,
            type: cc.Label
        },
        bag: null,
        numberLabel: {
            default: null,
            type: cc.Label
        },
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
    onLoad: function () {
        this.nameLabel.string = this.itemName;
        this.numberLabel.string = this.itemNum.toString();
        this.iconSprite.spriteFrame = this.icon;

        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.setPressed();
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.isSelected();
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.setNormal();
        }, this);

    },

    isSelected: function () {
        this.setPressed();
        this.bag.selectItem(this);
    },

    setNormal: function () {
        this.getComponent(cc.Sprite).spriteFrame = this.normal;
    },

    setPressed: function () {
        this.getComponent(cc.Sprite).spriteFrame = this.pressed;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
