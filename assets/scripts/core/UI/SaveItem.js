cc.Class({
    extends: cc.Component,

    properties: {
        saveSystem: null,
        index: 0,
        itemName: "",
        info: "",
        nameLabel: cc.Label,
        normal: cc.SpriteFrame,
        pressed: cc.SpriteFrame
    },

    // use this for initialization
    onLoad: function() {
        this.nameLabel.string = this.itemName;

        this.node.on(cc.Node.EventType.TOUCH_START, function(event) {
            this.setPressed();
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            this.isSelected();
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            this.setNormal();
        }, this);
    },

    isSelected: function() {
        this.setPressed();
        this.saveSystem.selectSaveItem(this, this.index, this.info);
    },

    setNormal: function() {
        this.getComponent(cc.Sprite).spriteFrame = this.normal;
    },

    setPressed: function() {
        this.getComponent(cc.Sprite).spriteFrame = this.pressed;
    }

});