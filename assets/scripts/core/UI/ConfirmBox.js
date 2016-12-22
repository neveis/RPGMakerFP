var emptyFunc = function(event) {
    event.stopPropagation();
};
cc.Class({
    extends: cc.Component,

    properties: {
        icon: {
            default: null,
            type: cc.Sprite
        },
        itemName: {
            default: null,
            type: cc.Label
        },
        priceLabel: {
            default: null,
            type: cc.Label
        },
        countLabel: {
            default: null,
            type: cc.Label
        },
        shopNode: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function() {
        this.gameNode = cc.find("Game");
        this.playerData = this.gameNode.getComponent("PlayerData");
        this.count = 1;
    },

    showItem: function(id, iconSprite, name, price, isBuy) {
        this.node.parent.on('touchstart', emptyFunc, this);
        this.isBuy = isBuy;
        this.itemId = id;
        this.icon.spriteFrame = iconSprite;
        this.itemName.string = name;
        if (isBuy)
            this.price = price;
        else
            this.price = Math.round(price * 0.6)
        this.count = 1;
        this.totalPrice = this.price * this.count;
        this.priceLabel.string = this.totalPrice.toString();
        this.countLabel.string = this.count.toString();
    },

    add: function() {
        if (this.isBuy) {
            if (this.count < 99 &&
                (this.count + 1) * this.price <= this.playerData.getMoney())
                this.count++;
        } else {
            if (this.count < 99 &&
                this.count < this.playerData.getItemCount(this.itemId))
                this.count++;
        }

        this.countLabel.string = this.count.toString();
        this.totalPrice = this.price * this.count;
        this.priceLabel.string = this.totalPrice.toString();
    },

    sub: function() {
        if (this.count > 0)
            this.count--;
        this.countLabel.string = this.count.toString();
        this.totalPrice = this.price * this.count;
        this.priceLabel.string = this.totalPrice.toString();
    },

    confirm: function() {
        this.shopNode.emit("buyconfirm", {
            num: this.count,
            totalPrice: this.totalPrice
        });
        this.node.parent.off('touchstart', emptyFunc, this);
        this.node.parent.active = false;
    },

    cancel: function() {
        this.node.parent.off('touchstart', emptyFunc, this);
        this.node.parent.active = false;
    }
});