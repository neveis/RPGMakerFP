cc.Class({
    extends: cc.Component,

    properties: {
        balloonAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        itemAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        avatarAtlas: cc.SpriteAtlas
    },

    // use this for initialization
    onLoad: function() {
        this.balloonClip = [];
        //this.createBalloonClip();
        this.itemTable = {};
        var self = this;
        //读取道具列表到缓存中
        var fileName = "Global/Item";
        cc.loader.loadRes(fileName, function(err, jsonData) {
            if (err) {
                cc.log(fileName, 'read error');
                return;
            }
            cc.log("load item table");
            self.itemTable = jsonData;
            cc.loader.releaseRes(fileName);
        });
    },

    createBalloonClip: function() {
        var frame;
        for (var i = 0; i < 10; i++) {
            frame = [];
            for (var j = 1; j < 9; j++) {
                if (i == 0)
                    var spriteName = "balloon_0" + j.toString();
                else
                    var spriteName = "balloon_" + (i * 8 + j).toString();
                frame.push(this.balloonAtlas.getSpriteFrame(spriteName));
            }
            this.balloonClip.push(cc.AnimationClip.createWithSpriteFrames(frame, 4));
        }
        //cc.log("ballon",this.balloonClip);
    },
    getBalloonClip: function(balloonIndex) {
        return this.balloonClip[balloonIndex];
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
        var spriteFrame = this.avatarAtlas.getSpriteFrame(name);
        return (spriteFrame == null ? null : spriteFrame);

    },

    getItemInfo: function(itemId) {
        return this.itemTable[itemId];
    },

});