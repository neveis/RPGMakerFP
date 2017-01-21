const RPG = require('Global');
const Direction = RPG.Direction;
const GridPerStep = RPG.GridPerStep;
const MoveStep = RPG.MoveStep;
cc.Class({
    extends: cc.Component,

    properties: {
        detectionRange: 1,
        spriteParentNode: {
            default: null,
            type: cc.Node,
            tooltip: "范围贴图的父节点。如果父节点就为该节点，务必不要设置，否则会出错。"
        },
        realTime: {
            default: false,
            tooltip: "是否实时监测。否则通过事件控制，会存在一定延迟。"
        },
        triggerEventId: {
            default: '',
            tooltip: "当角色被发现时，需要触发的事件ID。实时选项开启才有效。"
        }
    },

    // use this for initialization
    onLoad: function() {
        this.gameNode = cc.find('Game');
        this.game = this.gameNode.getComponent('Game');
        this.cache = this.gameNode.getComponent('Cache');
        this.eventManager = this.gameNode.getComponent('EventManager');
        this.actor = this.node.getComponent("Actor");
        this.rangeNode = new cc.Node("Range");
        this.rangeNode.setAnchorPoint(0.5, 0);
        this.rangeNode.setPosition(16, 16);
        this.rangeNode.opacity = 110;

        let circleNode = new cc.Node('circle');
        this.circleSprite = circleNode.addComponent(cc.Sprite);
        circleNode.parent = this.rangeNode;

        this.rangeNode.parent = this.spriteParentNode || this.node;;
        this.sprite = this.rangeNode.addComponent(cc.Sprite);
    },

    onEnable: function() {
        this.rangeNode.active = true;
    },

    start: function() {
        this.actor.stealth = this;
        this.direction = this.actor.direction;
        this.sprite.spriteFrame = this.cache.getSectorRangeSprite(this.detectionRange.toString());
        this.circleSprite.spriteFrame = this.cache.getSectorRangeSprite("0");
        this.setRangeDirection(this.direction);
    },
    // called every frame, uncomment this function to activate update callback
    update: function(dt) {
        if (!this.game.loaded) return;
        this.setSpritePos();
        if (this.direction != this.actor.direction) {
            this.direction = this.actor.direction;
            this.setRangeDirection(this.direction);
        }
        if (this.realTime) {
            if (this.inDetectionRange(this.actor.actorId, this.game.playerId, this.detectionRange)) {
                this.eventManager.eventStart(this.triggerEventId);
            }
        }
    },

    //扇形
    inDetectionRange: function(selfId, targetId, range) {
        let self = this.game.scene.getActorTarget(selfId);
        let target = this.game.scene.getActorTarget(targetId);
        let deltaTilePos = cc.pSub(target.getRealTilePos(), self.getRealTilePos());
        deltaTilePos.x = deltaTilePos.x / GridPerStep;
        deltaTilePos.y = deltaTilePos.y / GridPerStep;
        let flag = false;
        switch (self.direction) {
            case Direction.Down:
                if ((-deltaTilePos.y <= range) && (Math.abs(deltaTilePos.x) < -deltaTilePos.y)) flag = true;
                break;
            case Direction.Up:
                if ((deltaTilePos.y <= range) && (Math.abs(deltaTilePos.x) < deltaTilePos.y)) flag = true;
                break;
            case Direction.Left:
                if ((-deltaTilePos.x <= range) && (Math.abs(deltaTilePos.y) < -deltaTilePos.x)) flag = true;
                break;
            case Direction.Right:
                if ((deltaTilePos.x <= range) && (Math.abs(deltaTilePos.y) < deltaTilePos.x)) flag = true;
                break;
        }

        return this.isAround(self.direction, deltaTilePos) || flag;
    },

    isAround: function(direction, deltaTilePos) {
        let flag = false;
        switch (direction) {
            case Direction.Down:
                if (Math.abs(deltaTilePos.x) === 1 && (deltaTilePos.y === 0 || deltaTilePos.y === -1)) flag = true;
                break;
            case Direction.Up:
                if (Math.abs(deltaTilePos.x) === 1 && (deltaTilePos.y === 0 || deltaTilePos.y === 1)) flag = true;
                break;
            case Direction.Left:
                if (Math.abs(deltaTilePos.y) === 1 && (deltaTilePos.x === 0 || deltaTilePos.x === -1)) flag = true;
                break;
            case Direction.Right:
                if (Math.abs(deltaTilePos.y) === 1 && (deltaTilePos.x === 0 || deltaTilePos.x === 1)) flag = true;
                break;
        }
        return flag;
    },

    //检测玩家是否在背后
    checkBehind: function() {
        let selfPos = this.actor.getRealTilePos();
        let playerPos = this.game.scene.getActorTarget(this.game.playerId).getRealTilePos();
        let deltaTilePos = cc.pSub(playerPos, selfPos);
        deltaTilePos.x = deltaTilePos.x / GridPerStep;
        deltaTilePos.y = deltaTilePos.y / GridPerStep;
        let flag = false;
        switch (this.actor.direction) {
            case Direction.Down:
                if (deltaTilePos.x === 0 && deltaTilePos.y === 1) flag = true;
                break;
            case Direction.Up:
                if (deltaTilePos.x === 0 && deltaTilePos.y === -1) flag = true;
                break;
            case Direction.Left:
                if (deltaTilePos.x === 1 && deltaTilePos.y === 0) flag = true;
                break;
            case Direction.Right:
                if (deltaTilePos.x === -1 && deltaTilePos.y === 0) flag = true;
                break;
        }
        return flag;
    },

    setRangeDirection: function(direction) {
        switch (direction) {
            case Direction.Up:
                this.rangeNode.rotation = 0;
                break;
            case Direction.Down:
                this.rangeNode.rotation = 180;
                break;
            case Direction.Left:
                this.rangeNode.rotation = 270;
                break;
            case Direction.Right:
                this.rangeNode.rotation = 90;
                break;
        }
    },

    setSpritePos: function() {
        if (this.spriteParentNode) {
            this.rangeNode.setPosition(cc.pAdd(this.node.getPosition(), cc.p(MoveStep / 2, MoveStep / 2)))
        }
    },

    onDisable: function() {
        this.rangeNode.active = false;
    }
});