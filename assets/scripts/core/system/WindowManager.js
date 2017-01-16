cc.Class({
    extends: cc.Component,

    properties: {
        gameNode: {
            default: null,
            type: cc.Node
        },
        dialogueBoxPrefab: cc.Prefab,
        shopWindowPrefab: cc.Prefab,
        itemMsgPrefab: cc.Prefab,
        messagePrefab: cc.Prefab,
        optionBoxPrefab: cc.Prefab,
        blackScreenPrefab: cc.Prefab,
        loadingPrefab: cc.Prefab,
        SystemWinPrefab: cc.Prefab,
        SaveWindowPrefab: cc.Prefab,
        BagWindowPrefab: cc.Prefab
    },

    // use this for initialization
    onLoad: function() {
        this.dialogueBoxPool = new cc.NodePool();
        this.shopWindowPool = new cc.NodePool();
        this.itemMsgPool = new cc.NodePool();
        this.messagePool = new cc.NodePool();
        this.optionPool = new cc.NodePool();
        this.systemWinPool = new cc.NodePool();
        this.saveWinPool = new cc.NodePool();

        this.loadingPool = new cc.NodePool();
        this.loadingNode = null;

        this.blackScreenPool = new cc.NodePool();
        this.blackScreenPool.put(cc.instantiate(this.blackScreenPrefab));
        this.blackScreenNode = null;
    },

    showDialogueBox: function(dialogueMsg, actorTarget, cb) {
        //从对象池中取出空闲对象
        let dialogueNode = null;
        if (this.dialogueBoxPool.size() > 0) {
            dialogueNode = this.dialogueBoxPool.get();
        } else {
            dialogueNode = cc.instantiate(this.dialogueBoxPrefab);
        }
        let dialogueComp = dialogueNode.getComponent("DialogueBox");
        dialogueComp.gameNode = this.gameNode;
        dialogueComp.poolMng = this.dialogueBoxPool;
        this.gameNode.addChild(dialogueNode);
        dialogueComp.showMessage(dialogueMsg, actorTarget, cb);
        return dialogueComp;
    },

    showShopWindow: function(itemIdList, actorTarget, cb) {
        let shopNode = null;
        if (this.shopWindowPool.size() > 0) {
            shopNode = this.shopWindowPool.get();
        } else {
            shopNode = cc.instantiate(this.shopWindowPrefab);
        }
        let shopComp = shopNode.getComponent('Shop');
        shopComp.gameNode = this.gameNode;
        shopComp.poolMng = this.shopWindowPool;
        this.gameNode.addChild(shopNode);
        shopComp.showShop(itemIdList, actorTarget, cb);
    },

    showItemMsg: function(type, itemId, count, cb) {
        let itemMsgNode = null;
        if (this.itemMsgPool.size() > 0) {
            itemMsgNode = this.itemMsgPool.get();
        } else {
            itemMsgNode = cc.instantiate(this.itemMsgPrefab);
        }
        let itemMsgComp = itemMsgNode.getComponent('ItemMsg');
        itemMsgComp.gameNode = this.gameNode;
        itemMsgComp.poolMng = this.itemMsgPool;
        this.gameNode.addChild(itemMsgNode);
        itemMsgComp.showItemMsg(type, itemId, count, cb);
    },

    showMessage: function(message, cb) {
        let messageNode = null;
        if (this.messagePool.size() > 0) {
            messageNode = this.messagePool.get();
        } else {
            messageNode = cc.instantiate(this.messagePrefab);
        }
        let messageComp = messageNode.getComponent('MessageBox');
        messageComp.gameNode = this.gameNode;
        messageComp.poolMng = this.messagePool;
        this.gameNode.addChild(messageNode);
        messageComp.showMessage(message, cb);
    },

    showOption: function(message, target, options, cb) {
        let dialogueComp = this.showDialogueBox(message, target, null);
        let optionNode = null;
        if (this.optionPool.size() > 0) {
            optionNode = this.optionPool.get();
        } else {
            optionNode = cc.instantiate(this.optionBoxPrefab);
        }
        let optionComp = optionNode.getComponent('OptionBox');
        optionComp.gameNode = this.gameNode;
        optionComp.poolMng = this.optionPool;
        optionComp.dialogueComp = dialogueComp;
        this.gameNode.addChild(optionNode);
        optionComp.showOption(options, cb);
    },

    showSystemWindow: function() {
        let systemNode = null;
        if (this.systemWinPool.size() > 0) {
            systemNode = this.systemWinPool.get();
        } else {
            systemNode = cc.instantiate(this.SystemWinPrefab);
        }
        let systemComp = systemNode.getComponent('SystemWindow');
        systemComp._poolMng = this.systemWinPool;
        this.gameNode.addChild(systemNode);
    },

    showSaveWindow: function() {
        let saveNode = null;
        if (this.saveWinPool.size() > 0) {
            saveNode = this.saveWinPool.get();
        } else {
            saveNode = cc.instantiate(this.SaveWindowPrefab);
        }
        let saveComp = saveNode.getComponent('SaveSystem');
        saveComp._poolMng = this.saveWinPool;
        this.gameNode.addChild(saveNode);
    },

    showBagWindow: function() {
        let bagNode = cc.instantiate(this.BagWindowPrefab);
        this.gameNode.addChild(bagNode);
    },

    /**
     * !#zh
     * 淡入或淡出黑屏,搭配使用，否则黑屏时不能恢复。持续时间为0可快速恢复
     * fade in 指的是游戏画面
     * 黑幕出现时，需要记录节点，用于消失
     * @param {Boolean} fadeIn
     * @param {GameEvent} cb
     */
    fadeInOrOut: function(fadeIn, duration, cb) {
        if (!this.blackScreenNode) {
            if (this.blackScreenPool.size() > 0) {
                this.blackScreenNode = this.blackScreenPool.get();
            } else {
                this.blackScreenNode = cc.instantiate(this.blackScreenPrefab);
            }
            this.gameNode.addChild(this.blackScreenNode);
        }
        //fade in 指的是游戏画面淡入 也就是黑幕淡出
        if (fadeIn) {
            this.blackScreenNode.runAction(cc.sequence(
                cc.fadeOut(duration),
                cc.callFunc(function() {
                    this.blackScreenPool.put(this.blackScreenNode);
                    this.blackScreenNode = null;
                    if (cb) cb.next();
                }, this),
            ));
        } else {
            this.blackScreenNode.runAction(cc.sequence(
                cc.fadeIn(duration),
                cc.callFunc(function() { if (cb) cb.next() }),
            ));
        }
    },

    showLoading: function(show, cb) {
        if (show) {
            if (!this.loadingNode) {
                if (this.loadingPool.size() > 0) {
                    this.loadingNode = this.loadingPool.get();
                } else {
                    this.loadingNode = cc.instantiate(this.loadingPrefab);
                }
                this.gameNode.addChild(this.loadingNode);
            }
        } else {
            if (this.loadingNode) {
                this.loadingPool.put(this.loadingNode);
                this.loadingNode = null;
            }
        }
        if (cb) cb.next();
    }
});