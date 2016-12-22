var emptyFunc = function(event) {
    event.stopPropagation();
};
cc.Class({
    extends: cc.Component,

    properties: {
        gain: {
            default: null,
            type: cc.Label
        },
        icon: {
            default: null,
            type: cc.Sprite
        },
        nameLabel: {
            default: null,
            type: cc.Label
        },
        countLabel: {
            default: null,
            type: cc.Label
        },
        gameNode: {
            default: null,
            type: cc.Node
        },
        poolMng: null
    },
    onEnable: function() {
        this.node.on('touchstart', emptyFunc, this);
    },
    // use this for initialization
    onLoad: function() {
        this.game = this.gameNode.getComponent("Game");
        this.cache = this.game.getComponent('Cache');
        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            this.hide();
        }, this)
    },
    onDisable: function() {
        this.node.off('touchstart', emptyFunc, this);
    },

    showItemMsg: function(type, itemId, count, cb) {
        let itemName,
            itemInfo,
            itemIcon,
            countStr;
        this.game.hideUI(['default'], true, false);
        switch (type) {
            case 0:
                itemName = '金钱';
                countStr = Math.abs(count) + " G"; //金钱数量
                break;
            case 1:
                itemInfo = this.cache.getItemInfo(itemId);
                itemName = itemInfo.name;
                itemIcon = this.cache.getItemSprite(itemId);
                countStr = "X " + Math.abs(count); //物品数量
                break;
        }
        let gainStr;
        if (count > 0) {
            gainStr = '获得:';
        } else {
            gainStr = '失去:';
        }

        this.icon.spriteFrame = itemIcon;
        this.nameLabel.string = itemName;
        this.gain.string = gainStr;
        this.countLabel.string = countStr;
        this.cb = cb;
    },

    hide: function() {
        this.poolMng.put(this.node);
        this.game.hideUI(['default'], false, false);
        if (this.cb) this.cb.next();

    },
});