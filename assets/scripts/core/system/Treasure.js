const GameEvent = require('GameEvent');

cc.Class({
    extends: cc.Component,

    properties: {
        treasureId: "",
        once: true,
        isChest: true,
        chestAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        mapNode: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function() {
        this.mapNode = this.mapNode || cc.find('Canvas/Map');
        this.map = this.mapNode.getComponent('Map');
        this.gameNode = cc.find("Game");
        this.game = this.gameNode.getComponent("Game");
        this.eventManager = this.gameNode.getComponent("EventManager");
        this.animation = this.node.getComponent(cc.Animation);

        //初始化开启箱子动画
        if (this.isChest) {
            var frame = [];
            for (let i = 1; i < 5; i++) {
                let spriteFrameName = "0" + i;
                frame.push(this.chestAtlas.getSpriteFrame(spriteFrameName));
            }
            let clip = cc.AnimationClip.createWithSpriteFrames(frame, 8);
            this.animation.addClip(clip, "Treasure");
        }
    },

    start: function() {
        if (this.isChest)
            this.map.setTileBlock(this.getTilePos());
        if (this.inTreasureList(this.treasureId)) {
            if (this.isChest) {
                this.node.getComponent(cc.Sprite).spriteFrame = this.chestAtlas.getSpriteFrame("04");
            } else {
                this.animation.stop();
                this.node.active = false;
            }
            return;
        }
        this.registerEvent();
    },

    registerEvent: function() {
        var self = this;
        var filePath = 'Scene/' + self.map.mapId + '/Treasure';
        cc.loader.loadRes(filePath, function(err, jsonData) {
            if (err) {
                cc.log("Doesn't find : ", filePath);
                return;
            }

            let event = jsonData[self.treasureId];
            if (!event) return;
            event.target = self;
            let eventId = self.eventManager.generateEventId(self.map.mapId, self.getRealTilePos());
            self.eventManager.createEvent(eventId, event);
        });
    },

    removeEvent: function() {
        this.eventManager.removeEvent(this.eventManager.generateEventId(this.map.mapId, this.getRealTilePos()));
    },

    getPos: function() {
        return cc.p(Math.round(this.node.x), Math.round(this.node.y));
    },
    getPosX: function() {
        return Math.round(this.node.x);
    },
    getPosY: function() {
        return Math.round(this.node.y);
    },
    getTilePos: function() {
        var x = Math.round(this.getPosX() / this.map.tileSize.width);
        var y = Math.round(this.getPosY() / this.map.tileSize.height);
        y = this.map.mapTileSize.height - y - 1; //坐标系不同,需要转换
        return cc.p(x, y);
    },

    /**
     * 以左下角为原点的Tile坐标（遗留问题）
     */
    getRealTilePosY: function() {
        var y = Math.round(this.getPosY() / this.map.tileSize.height);
        return y;
    },

    getRealTilePos: function() {
        return cc.p(this.getTilePos().x, this.getRealTilePosY());
    },

    inTreasureList: function(treasureId) {
        for (let i = 0; i < this.game.treasureList.length; i++) {
            if (treasureId === this.game.treasureList[i])
                return true;
        }
        return false;
    },

    getTreasure: function(gainEvent, cb) {
        this.removeEvent();
        if (this.once) {
            this.game.treasureList.push(this.treasureId);
        }
        if (this.isChest) {
            this.animation.play("Treasure");
        } else {
            this.animation.stop();
            this.node.active = false;
        }
        let gameEvent = new GameEvent();
        gameEvent.setCallback(cb);
        gameEvent.startBySubEvent(gainEvent);
    },

    onDisable: function() {
        if (this.isChest)
            this.map.removeTileBlock(this.getTilePos());
        this.removeEvent()
    },

    onDestroy: function() {
        if (this.isChest)
            this.map.removeTileBlock(this.getTilePos());
    }

});