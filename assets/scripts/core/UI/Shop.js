var isEmptyObject = function(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
};

var emptyFunc = function(event) {
    event.stopPropagation();
};

cc.Class({
    extends: cc.Component,

    properties: {
        description: {
            default: null,
            type: cc.Label
        },

        money: {
            default: null,
            type: cc.Label
        },
        itemPrefab: {
            default: null,
            type: cc.Prefab
        },
        itemContent: {
            default: null,
            type: cc.Node
        },
        buyButton: {
            default: null,
            type: cc.Node
        },
        saleButton: {
            default: null,
            type: cc.Node
        },
        countNode: {
            default: null,
            type: cc.Node
        },
        countLabel: {
            default: null,
            type: cc.Label
        },
        mask: {
            default: null,
            type: cc.Node
        },
        confirmBox: {
            default: null,
            type: cc.Node
        },
        gameNode: {
            default: null,
            type: cc.Node
        },
        poolMng: null
    },

    // use this for initialization
    onLoad: function() {
        var self = this;
        this.gameNode = this.gameNode || cc.find('Game');
        this.game = this.gameNode.getComponent("Game");
        this.playerData = this.gameNode.getComponent("PlayerData");
        this.eventManager = this.gameNode.getComponent("EventManager");
        this.cache = this.gameNode.getComponent("Cache");

        this.preItem = null;
        this.currentItem = null;
        //点击次数
        this.touchTimes = 0;
        //所有的物品列表
        this.itemTable = {};
        //可买物品列表
        this.itemList = [];

        this.node.on("itemEvent", function(event) {

            switch (event.detail.state) {
                case 1:
                    event.detail.self.setPressed();
                    break;
                case 2:
                    this.preItem = this.currentItem;
                    this.currentItem = event.detail.self;
                    this.description.string = this.currentItem.itemInfo.description;
                    this.countLabel.string = this.playerData.checkItem(this.currentItem.id);
                    if (this.preItem != null) {
                        if (this.currentItem.id == this.preItem.id) {
                            this.touchTimes++;
                        } else {
                            this.preItem.setNormal();
                            this.touchTimes = 1;
                        }
                    } else
                        this.touchTimes = 1;
                    if (this.touchTimes == 2) {
                        this.mask.active = true;
                        //cc.find("debug").getComponent(cc.Label).string = "confirm box";
                        this.confirmBox.getComponent("ConfirmBox").showItem(
                            this.currentItem.id,
                            this.currentItem.icon.spriteFrame,
                            this.currentItem.itemInfo.name,
                            this.currentItem.itemInfo.price,
                            this.isBuy);
                        this.touchTimes = 0;
                    }
                    //cc.log(this.touchTimes);
                    //this.currentItem.setNormal();
                    break;
                case 3:
                    if (this.touchTimes == 0 ||
                        (this.touchTimes == 1 && event.detail.self.id != this.currentItem.id))
                        event.detail.self.setNormal();
                    //this.touchTimes = 0;
                    break;
            }
        }, this)

        this.node.on("buyconfirm", function(event) {
            //cc.find("debug").getComponent(cc.Label).string = "confirm";
            if (this.isBuy) {
                if (this.playerData.getMoney() >= event.detail.totalPrice) {
                    this.playerData.addItem(this.currentItem.id, event.detail.num);
                    this.playerData.setMoneyBy(-(event.detail.totalPrice))
                }
            } else {
                if (this.playerData.getItemCount(this.currentItem.id) >= event.detail.num) {
                    this.playerData.removeItem(this.currentItem.id, event.detail.num);
                    this.playerData.setMoneyBy(event.detail.totalPrice);

                }
            }
            this.money.string = this.playerData.getMoney() + " G";
            this.countLabel.string = this.playerData.getItemCount(this.currentItem.id);
            //cc.log(this.playerData.getMoney());
            //cc.log(this.playerData.items);
            //cc.find("debug").getComponent(cc.Label).string = "confirm over";
        }, this)
    },

    showShop: function(itemIdList, actorTarget, cb) {
        var self = this;

        this.game.hideUI(['default'], true, false);
        this.actor = actorTarget;
        if (this.actor != undefined) {
            this.actor.facePlayer();
        }
        this.itemIdList = itemIdList;
        this.money.string = this.playerData.getMoney() + " G";
        //读取道具列表
        if (isEmptyObject(this.itemTable)) {
            var fileName = "Global/Item";
            cc.loader.loadRes(fileName, function(err, jsonData) {
                if (err) {
                    cc.log(fileName, 'read error');
                    return;
                }
                cc.log("load item table");
                self.itemTable = jsonData;
                self.itemList = []; //清空列表
                for (var i = 0; i < self.itemIdList.length; i++) {
                    self.itemList[i] = jsonData[self.itemIdList[i].toString()];
                }
                cc.loader.releaseRes(fileName);
            });
        } else {
            self.itemList = []; //清空列表
            for (var i = 0; i < self.itemIdList.length; i++) {
                self.itemList[i] = self.itemTable[self.itemIdList[i].toString()];
            }
        }

        this.cb = cb;
    },

    buy: function() {
        this.isBuy = true;
        this.description.string = "";
        this.preItem = null;
        this.currentItem = null;
        if (this.itemContent.children.length) {
            this.cleanItemList()
        }
        for (var i = 0; i < this.itemList.length; i++) {
            this.createItem(this.itemList[i]);
        }
        if (!this.saleButton.getComponent(cc.Button).interactable)
            this.saleButton.getComponent(cc.Button).interactable = true;
        this.buyButton.getComponent(cc.Button).interactable = false;
        this.countNode.active = true;
        this.countLabel.string = "";
    },

    sale: function() {
        this.isBuy = false;
        this.description.string = "";
        this.preItem = null;
        this.currentItem = null;
        var items = this.playerData.getItems();
        var itemList = [];
        var i = 0;
        for (var key in items) {
            itemList[i] = this.itemTable[items[key].id];
            i++;
        }
        if (this.itemContent.children.length) {
            this.cleanItemList()
        }
        for (var i = 0; i < itemList.length; i++) {
            this.createItem(itemList[i]);
        }
        if (!this.buyButton.getComponent(cc.Button).interactable)
            this.buyButton.getComponent(cc.Button).interactable = true;
        this.saleButton.getComponent(cc.Button).interactable = false;
        this.countNode.active = true;
        this.countLabel.string = "";
    },

    cancel: function() {
        this.cleanItemList();
        this.description.string = "";
        this.buyButton.getComponent(cc.Button).interactable = true;
        this.saleButton.getComponent(cc.Button).interactable = true;

        this.countNode.active = false;
        this.game.hideUI(['default'], false, false);
        this.poolMng.put(this.node);
        if (this.actor != undefined)
            this.actor.faceDefault();
        if (this.cb) this.cb.next();
    },

    createItem: function(itemObj) {
        var itemNode = cc.instantiate(this.itemPrefab);
        var item = itemNode.getComponent('ShopItem');

        item.id = itemObj.id;
        item.itemName.string = itemObj.name;

        item.icon.spriteFrame = this.cache.getItemSprite(item.id.toString())
        if (this.isBuy)
            item.price.string = itemObj.price + "G";
        else
            item.price.string = (Math.round(itemObj.price * 0.6)) + "G";
        //itemComp.description = itemObj.description;
        //itemComp.descriptionLabel = this.description;
        item.shop = this;
        this.itemContent.addChild(itemNode); //加了Layout
        item.itemInfo = itemObj;
    },

    cleanItemList: function() {
        var itemListChildren = this.itemContent.children;
        for (var i = 0; i < itemListChildren.lenght; i++) {
            itemListChildren[i].destroy();
        }
        this.itemContent.removeAllChildren(true);
        //this.information.active = false;
        //this.description.string = "";
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});