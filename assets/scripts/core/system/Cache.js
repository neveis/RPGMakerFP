const ActionParse = require('ActionParse');

cc.Class({
    extends: cc.Component,

    properties: {
        emotionAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        itemAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        avatarAtlas: cc.SpriteAtlas,
        sectorAtlas: cc.SpriteAtlas,
        itemJson: {
            default: null,
            url: cc.RawAsset
        },
        actorActionJson: {
            default: null,
            url: cc.RawAsset
        }
    },

    // use this for initialization
    onLoad: function() {
        this.releaseResList = [];
        this.balloonClip = [];
        this.itemTable = {};
        this.actorAction = {};
        var self = this;


        //读取道具列表到缓存中
        //因为是必须读取文件，使用预加载
        if (this.itemJson) {
            this.itemTable = cc.loader.getRes(this.itemJson);
        }
        // var fileName = "Global/Item";
        // cc.loader.loadRes(fileName, function(err, jsonData) {
        //     if (err) {
        //         cc.log(fileName, 'read error');
        //         return;
        //     }
        //     cc.log("load item table");
        //     self.itemTable = jsonData;
        //     cc.loader.releaseRes(fileName);
        // });
        if (this.actorActionJson) {
            this.actorAction = cc.loader.getRes(this.actorActionJson);
        }
    },

    getEmotionAtlas: function() {
        return this.emotionAtlas;
    },

    getItemSprite: function(itemId) {
        var name = "IconSet_" + itemId;
        var spriteFrame = this.itemAtlas.getSpriteFrame(name);
        if (spriteFrame != null && spriteFrame != undefined)
            return spriteFrame;
        else
            return null;
    },

    getAvatar: function(actorId) {
        var name = actorId.toString();
        if (!this.avatarAtlas) return;
        var spriteFrame = this.avatarAtlas.getSpriteFrame(name);
        return (spriteFrame == null ? null : spriteFrame);

    },

    getSectorRangeSprite: function(range) {
        if (!this.sectorAtlas) return;
        let spriteFrame = this.sectorAtlas.getSpriteFrame(range);
        return (spriteFrame == null ? null : spriteFrame);
    },

    getItemInfo: function(itemId) {
        return this.itemTable[itemId];
    },

    getAction: function(actionTag) {
        var actionConfig = this.actorAction[actionTag];
        var action;
        if (actionConfig) {
            action = ActionParse(actionConfig);
        }
        return action;
    },

    releaseRes: function() {
        for (let i = 0; i < this.releaseResList.length; i++) {
            cc.loader.releaseRes(this.releaseResList[i]);
        }
        this.releaseResList = [];
    }
});