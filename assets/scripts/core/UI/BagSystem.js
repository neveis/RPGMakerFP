var emptyFunc = function(event) {
    event.stopPropagation();
};

cc.Class({
    extends: cc.Component,

    properties: {
        gameNode: cc.Node,
        bagItemPrefab: cc.Prefab,
        statusPrefab: cc.Prefab,
        itemContent: cc.Node,
        actorContent: cc.Node,
        gold: cc.Label,
        descriptionLabel: cc.Label
    },

    // use this for initialization
    onLoad: function() {
        this.gameNode = this.gameNode || cc.find('Game');
        this.game = this.gameNode.getComponent("Game");
        this.playerData = this.gameNode.getComponent("PlayerData");
        this.actorManager = this.gameNode.getComponent("ActorManager");
        this.cache = this.game.getComponent('Cache');
        this.currentItem = null;
        this.preItem = null;
        this.descriptionLabel.string = "";
    },

    onEnable: function() {
        this.node.on('touchstart', emptyFunc, this);
        this.showBagBox();
    },

    showBagBox: function() {
        //this.node.active = true;
        var items = this.playerData.getItems();
        var itemIdList = Object.keys(items);
        this.gold.string = this.playerData.getMoney().toString() + " G";
        this.createItemList(itemIdList);
    },

    createItem: function(itemId) {
        var itemInfo = this.cache.getItemInfo(itemId);
        var itemNode = cc.instantiate(this.bagItemPrefab);
        var item = itemNode.getComponent("BagItem");
        item.bag = this;
        item.itemId = itemId;
        item.itemName = itemInfo.name;
        item.icon = this.cache.getItemSprite(itemId.toString())
        item.itemType = itemInfo.type;
        item.description = itemInfo.description;
        item.itemNum = this.playerData.getItemCount(itemId);
        return item;
    },

    createItemList: function(itemIdList) {
        var item;
        for (var i = 0; i < itemIdList.length; i++) {
            item = this.createItem(itemIdList[i])
            this.itemContent.addChild(item.node);
        }
    },

    clearItemList: function() {
        var list = this.itemContent.children;
        for (var i = 0; i < list.length; i++) {
            list[i].destroy();
        }
    },

    createActorList: function() {
        this.clearActorList();
        var idList = this.game.playerList;
        var actorNode;
        var actor;
        for (var i = 0; i < idList.length; i++) {
            actorNode = cc.instantiate(this.statusPrefab);
            actor = actorNode.getComponent("ActorStatus");
            var attributes = this.playerData.player[idList[i]].getAttributes(true);
            actor.handle = this;
            actor.actorId = idList[i];
            actor.actorName = this.actorManager.getTarget(idList[i]).npcName;
            actor.HPBar.point = attributes.HP;
            actor.HPBar.maxPoint = attributes.MaxHP;
            actor.MPBar.point = attributes.MP;
            actor.MPBar.maxPoint = attributes.MaxMP;
            this.actorContent.addChild(actorNode);
        }
    },

    clearActorList: function() {
        var list = this.actorContent.children;
        //描述标签不能删
        for (var i = 1; i < list.length; i++) {
            list[i].destroy();
        }
    },

    selectItem: function(item) {
        this.preItem = this.currentItem;
        if (this.preItem != null)
            if (this.preItem.itemId !== item.itemId)
                this.preItem.setNormal();
        this.currentItem = item;
        this.descriptionLabel.string = item.description;

        // //使用道具功能
        // if (item.itemType == 11) {
        //     this.createActorList();
        // } else {
        //     this.clearActorList();
        // }
    },

    selectButton: function(actor) {
        if (this.currentItem == null) return;
        var itemInfo = this.game.itemTable[this.currentItem.itemId];
        var effect = itemInfo.effect;
        for (var key in effect) {
            switch (key) {
                case "HP":
                    this.playerData.player[actor.actorId].loseHP(-effect[key]);
                    break;
                case "MP":
                    this.playerData.player[actor.actorId].loseMP(-effect[key]);
            }
        }

        //更新显示
        var attributes = this.playerData.player[actor.actorId].getAttributes(true);
        actor.HPBar.point = attributes.HP;
        actor.HPBar.maxPoint = attributes.MaxHP;
        actor.MPBar.point = attributes.MP;
        actor.MPBar.maxPoint = attributes.MaxMP;

        this.playerData.removeItem(this.currentItem.itemId, 1);
        var num = this.playerData.getItemCount(this.currentItem.itemId);
        if (num > 0) {
            this.currentItem.numberLabel.string = num.toString();
        } else {
            this.currentItem.node.destroy();
            this.currentItem = null;
        }
    },

    close: function() {
        //this.node.active = false;
        this.node.destroy();
    },

    onDisable: function() {
        this.node.off('touchstart', emptyFunc, this);
        this.currentItem = null;
        this.preItem = null;
        this.descriptionLabel.string = "";
        this.clearItemList();
        this.clearActorList();
    }

});