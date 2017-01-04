var RPG = require("Global");
var Direction = RPG.Direction;
var GridPerStep = RPG.GridPerStep;
var MoveStep = RPG.MoveStep;
var MoveTime = RPG.MoveTime;
var ActorOffset = RPG.ActorOffset;
var AtlasIndex = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
var ClipName = ["down", "left", "right", "up"]
var PlayerMoveClipName = ["downLeft", "downRight", "leftLeft", "leftRight", "rightRight", "rightLeft", "upLeft", "upRight"];
cc.Class({
    extends: cc.Component,

    properties: {
        actorId: '',
        actorName: '',
        actorAvatar: {
            default: null,
            type: cc.Sprite
        },
        actorAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        isPlayer: false,
        dynamic: false,
        counter: [cc.Integer],
        mapNode: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function() {

    },

    _initActor: function() {
        this.mapNode = this.mapNode || cc.find('Canvas/Map');
        if (!this.mapNode) {
            console.log('cannot find map node');
            return;
        }
        this.map = this.mapNode.getComponent("Map");
        this.aStar = this.mapNode.getComponent("AStar");

        this.gameNode = cc.find("Game");
        this.game = this.gameNode.getComponent("Game");
        this.eventManager = this.gameNode.getComponent("EventManager");
        //this.cache = this.gameNode.getComponent("Cache");

        this.defaultSprite = this.node.getComponent(cc.Sprite).spriteFrame;
        this.anim = this.node.getComponent(cc.Animation);
        if (!this.anim) {
            this.anim = this.node.addComponent(cc.Animation);
        }

        //矫正位置,保证在格点上
        this.setPos(cc.p(Math.round(this.node.x / MoveStep) * MoveStep, Math.round(this.node.y / MoveStep) * MoveStep));
        this.realTilePos = this.getTilePos();

        //创建行走动画
        this.createAnimationClip();

        //创建表情动画
        this.emotionNode = this.createEmotion();

        this.event = null;
        this.initialized = true;
    },


    //onEnable在start之前运行
    /**
     * 人物重新显示要重新注册事件
     */
    onEnable: function() {
        //如果还未进行初始化，不能进行事件注册等。
        if (!this.initialized) return;

        this.registerEvent();
    },


    /**
     * 创建事件对象
     */
    initEvent: function(eventObj) {
        if (!eventObj) return;
        this.event = eventObj;
        this.event.target = this;
    },

    /**
     * 注册事件
     */
    registerEvent: function() {
        this.map.setTileBlock(this.getTilePos());

        if (!this.event) return;
        let eventId = this.eventManager.generateEventId(this.map.mapId, this.getTilePos());
        this.eventManager.createEvent(eventId, this.event);

        //事件在相邻的位置
        for (let i = 0; i < this.counter.length; i++) {
            let triggerPos;
            switch (this.counter[i]) {
                case 2:
                    triggerPos = cc.p(self.getTilePosX(), self.getTilePosY() + GridPerStep);
                    break;
                case 4:
                    triggerPos = cc.p(self.getTilePosX() - GridPerStep, self.getTilePosY());
                    break;
                case 6:
                    triggerPos = cc.p(self.getTilePosX() + GridPerStep, self.getTilePosY());
                    break;
                case 8:
                    triggerPos = cc.p(self.getTilePosX(), self.getTilePosY() - GridPerStep);
                    break;
            }
            let eventId = this.eventManager.generateEventId(this.map.mapId, triggerPos);
            this.eventManager.createEvent(eventId, this.event);
        }
    },

    /**
     * 移除事件
     */
    removeEvent: function() {
        this.map.removeTileBlock(this.getTilePos());

        if (!this.event) return;
        let eventId = this.eventManager.generateEventId(this.map.mapId, this.getTilePos());
        this.eventManager.removeEvent(eventId);

        //事件在相邻的位置
        for (let i = 0; i < this.counter.length; i++) {
            let triggerPos;
            switch (this.counter[i]) {
                case 2:
                    triggerPos = cc.p(self.getTilePosX(), self.getTilePosY() + GridPerStep);
                    break;
                case 4:
                    triggerPos = cc.p(self.getTilePosX() - GridPerStep, self.getTilePosY());
                    break;
                case 6:
                    triggerPos = cc.p(self.getTilePosX() + GridPerStep, self.getTilePosY());
                    break;
                case 8:
                    triggerPos = cc.p(self.getTilePosX(), self.getTilePosY() - GridPerStep);
                    break;
            }
            let eventId = this.eventManager.generateEventId(this.map.mapId, triggerPos);
            this.eventManager.removeEvent(eventId);
        }

    },

    setPos: function(pos, direction) {
        //激活状态才有事件
        if (this.node.active) {
            this.removeEvent();
            this.realTilePos = this.getTilePos();
        }
        this.node.x = pos.x;
        this.node.y = pos.y + ActorOffset;
        this.node.setLocalZOrder(this.getTilePosY());
        if (direction != null) {
            var actorSprite = this.node.getComponent(cc.Sprite);
            switch (direction) {
                case Direction.Down:
                    actorSprite.spriteFrame = this.actorAtlas.getSpriteFrame("02");
                    break;
                case Direction.Up:
                    actorSprite.spriteFrame = this.actorAtlas.getSpriteFrame("11");
                    break;
                case Direction.Left:
                    actorSprite.spriteFrame = this.actorAtlas.getSpriteFrame("05");
                    break;
                case Direction.Right:
                    actorSprite.spriteFrame = this.actorAtlas.getSpriteFrame("08");
                    break;
            }
        }
        if (this.node.active)
            this.registerEvent();
    },

    getPos: function() {
        return cc.p(Math.round(this.node.x), Math.round(this.node.y - ActorOffset));
    },
    getPosX: function() {
        return Math.round(this.node.x);
    },
    getPosY: function() {
        return Math.round(this.node.y - ActorOffset);
    },
    getTilePos: function() {
        var x = Math.round(this.getPosX() / this.map.tileSize.width);
        var y = Math.round(this.getPosY() / this.map.tileSize.height);
        y = this.map.mapTileSize.height - y - 1; //坐标系不同,需要转换
        return cc.p(x, y);
    },
    getTilePosX: function() {
        var x = Math.round(this.getPosX() / this.map.tileSize.width);
        return x;
    },
    getTilePosY: function() {
        var y = Math.round(this.getPosY() / this.map.tileSize.height);
        y = this.map.mapTileSize.height - y - 1; //坐标系不同,需要转换
        return y;
    },
    getForwardPos: function(direction) {
        let destPos = this.getPos();
        switch (direction) {
            case Direction.Down:
                destPos.y -= MoveStep;
                break;
            case Direction.Up:
                destPos.y += MoveStep;
                break;
            case Direction.Left:
                destPos.x -= MoveStep;
                break;
            case Direction.Right:
                destPos.x += MoveStep;
                break;
        }
        return destPos;
    },
    /**
     * !#zh
     * 将像素坐标转换为Tile坐标。注意像素坐标原地在左下角，而Tile坐标在左上角
     * @param {Object} posInPixel
     * @return {Object} Tile坐标
     */
    PosPixelToTile: function(posInPixel) {
        var x = Math.round(posInPixel.x / this.map.tileSize.width);
        var y = Math.round(posInPixel.y / this.map.tileSize.height);
        y = this.map.mapTileSize.height - y - 1; //坐标系不同,需要转换
        return cc.p(x, y);
    },
    createAnimationClip: function() {
        var frame;
        for (var i = 0; i < 4; i++) {
            frame = [];
            for (var j = 1; j < 4; j++) {
                frame.push(this.actorAtlas.getSpriteFrame(AtlasIndex[i * 3 + j - 1]))
            }
            frame.push(this.actorAtlas.getSpriteFrame(AtlasIndex[i * 3 + 2 - 1]))
            var clip = cc.AnimationClip.createWithSpriteFrames(frame, 8);
            this.anim.addClip(clip, ClipName[i]);
        }
        if (this.isPlayer) {
            for (var i = 0; i < 4; i++) {
                //左
                frame = [];
                frame.push(this.actorAtlas.getSpriteFrame(AtlasIndex[i * 3 + 1 - 1]));
                frame.push(this.actorAtlas.getSpriteFrame(AtlasIndex[i * 3 + 1]));
                var clip = cc.AnimationClip.createWithSpriteFrames(frame, 8);
                this.anim.addClip(clip, PlayerMoveClipName[2 * i]);
                //右
                frame = [];
                frame.push(this.actorAtlas.getSpriteFrame(AtlasIndex[i * 3 + 1 + 1]));
                frame.push(this.actorAtlas.getSpriteFrame(AtlasIndex[i * 3 + 1]));
                clip = cc.AnimationClip.createWithSpriteFrames(frame, 8);
                this.anim.addClip(clip, PlayerMoveClipName[2 * i + 1]);
            }
        }
    },

    /**
     * 创建显示表情的节点
     */
    createEmotion: function() {
        let emotionNode = new cc.Node('Emotion');
        emotionNode.addComponent(cc.Sprite);
        let animation = emotionNode.addComponent(cc.Animation);
        emotionNode.setAnchorPoint(0, 0);
        emotionNode.setPosition(0, this.node.height)
        emotionNode.active = false;
        let emotionFX = emotionNode.addComponent('EmotionFX');
        emotionFX.createAnimationClip();
        this.node.addChild(emotionNode);

        return emotionNode;
    },

    facePlayer: function() {
        var actorSprite = this.node.getComponent(cc.Sprite);
        //与玩家方向相反
        switch (this.game.player.direction) {
            case Direction.Down:
                actorSprite.spriteFrame = this.actorAtlas.getSpriteFrame("11");
                break;
            case Direction.Up:
                actorSprite.spriteFrame = this.actorAtlas.getSpriteFrame("02");
                break;
            case Direction.Left:
                actorSprite.spriteFrame = this.actorAtlas.getSpriteFrame("08");
                break;
            case Direction.Right:
                actorSprite.spriteFrame = this.actorAtlas.getSpriteFrame("05");
                break;
        }

    },
    faceDefault: function() {
        this.node.getComponent(cc.Sprite).spriteFrame = this.defaultSprite;
    },


    /**
     * !#zh
     * 设置玩家位置
     * @param {cc.p} newPos 坐标
     * @param {Direction} direction 朝向 
     */
    setPlayerPos: function(newPos, direction) {
        this.setPos(cc.p(newPos.x, newPos.y));
        this.direction = direction;

        this.map.setMapPos(newPos);

        this.playerStop(direction);
    },

    playerMove: function(direction) {
        if (this.isMoving()) return;
        let destPos = this.getForwardPos(direction);
        if (direction == Direction.None) {
            return;
        }
        this.direction = direction;
        if (this.checkEventThereTouch(direction)) {
            return;
        } else {
            if (this.map.tryToMove(destPos)) {
                //console.log('move');
                this.playerMoveAnimation(direction);
                this.playerMoveAction(direction);
                this.map.moveMap(direction, destPos);
            } else {
                this.playerStop(direction)
            }
        }
    },

    /**
     * 设置朝向以及矫正贴图
     */
    playerStop: function(direction) {
        //this.anim.stop();
        //this.player.stopAllActions();
        var playerAtlas = this.actorAtlas;
        switch (direction) {
            case Direction.Down:
                this.node.getComponent(cc.Sprite).spriteFrame = playerAtlas.getSpriteFrame('02');
                break;
            case Direction.Up:
                this.node.getComponent(cc.Sprite).spriteFrame = playerAtlas.getSpriteFrame('11');
                break;
            case Direction.Left:
                this.node.getComponent(cc.Sprite).spriteFrame = playerAtlas.getSpriteFrame('05');
                break;
            case Direction.Right:
                this.node.getComponent(cc.Sprite).spriteFrame = playerAtlas.getSpriteFrame('08');
                break;
        }
    },

    /**
     * 移动动画
     */
    playerMoveAnimation: function(direction) {
        let left, right;
        switch (direction) {
            case Direction.Down:
                left = "downLeft";
                right = "downRight";
                break;
            case Direction.Up:
                left = "upLeft";
                right = "upRight";
                break;
            case Direction.Left:
                left = "leftLeft";
                right = "leftRight";
                break;
            case Direction.Right:
                left = "rightLeft";
                right = "rightRight";
                break;
        }
        if (this.isLeft) {
            this.anim.play(left);
        } else {
            this.anim.play(right)
        }
        this.isLeft = !this.isLeft;
    },

    /**
     * 移动动画
     */
    playerMoveAction: function(direction) {
        let pos;
        switch (direction) {
            case Direction.Down:
                pos = cc.p(0, -MoveStep);
                break;
            case Direction.Up:
                pos = cc.p(0, MoveStep);
                break;
            case Direction.Left:
                pos = cc.p(-MoveStep, 0);
                break;
            case Direction.Right:
                pos = cc.p(MoveStep, 0);
                break;
        }
        this.map.removeTileBlock(this.getTilePos());
        //let destPos = this.map._getTilePos(cc.pAdd(this.getPos(), pos));
        let destPos = this.PosPixelToTile(this.getForwardPos(direction));
        this.map.setTileBlock(destPos);
        this.realTilePos = destPos;
        this.node.setLocalZOrder(destPos.y);
        //移动结束后，要检查是否有事件需要触发
        this.node.runAction(cc.sequence(cc.moveBy(MoveTime, pos),
            cc.callFunc(this.checkEventHere, this)))

    },

    isMoving: function() {
        return (this.anim.getAnimationState('downLeft').isPlaying ||
            this.anim.getAnimationState('downRight').isPlaying ||
            this.anim.getAnimationState('leftLeft').isPlaying ||
            this.anim.getAnimationState('leftRight').isPlaying ||
            this.anim.getAnimationState('rightRight').isPlaying ||
            this.anim.getAnimationState('rightLeft').isPlaying ||
            this.anim.getAnimationState('upLeft').isPlaying ||
            this.anim.getAnimationState('upRight').isPlaying
        );
    },

    /**
     * 确认键触发
     */
    checkEventThere: function() {
        let PosInTile = this.PosPixelToTile(this.getForwardPos(this.direction))
        let eventId = this.eventManager.getEventId(this.map.mapId, PosInTile);
        if (this.eventManager.checkEventById(eventId, 1)) {
            //start event
            this.eventManager.eventStart(eventId);
        }
    },
    /**
     * !#zh
     * 检查当前位置是否有事件，在移动后调用
     */
    checkEventHere: function() {
        let PosInTile = this.getTilePos();
        let eventId = this.eventManager.getEventId(this.map.mapId, PosInTile);
        if (this.eventManager.checkEventById(eventId, 2)) {
            this.eventManager.eventStart(eventId);
        }
    },
    /**
     * 移动接触前检查
     */
    checkEventThereTouch: function() {
        let PosInTile = this.PosPixelToTile(this.getForwardPos(this.direction))
        let eventId = this.eventManager.getEventId(this.map.mapId, PosInTile);
        if (this.eventManager.checkEventById(eventId, 3)) {
            this.playerStop();
            this.eventManager.eventStart(eventId);
            return true;
        }
        return false;
    },

    move: function(step, direction, speed, wait, cb) {
        this.removeEvent();
        let deltaPos;
        switch (direction) {
            case Direction.Down:
                deltaPos = cc.v2(0, -step * MoveStep);
                break;
            case Direction.Up:
                deltaPos = cc.v2(0, step * MoveStep);
                break;
            case Direction.Left:
                deltaPos = cc.v2(-step * MoveStep, 0);
                break;
            case Direction.Right:
                deltaPos = cc.v2(step * MoveStep, 0);
                break;
        }
        //两种情况，移动结束后再运行下一个事件 或者 移动的同时运行下一个事件。
        if (wait) {
            this.node.runAction(cc.sequence(
                cc.spawn(
                    cc.callFunc(this.startAnim, this, { direction: direction, speed: speed }),
                    cc.moveBy(MoveTime * step / speed, deltaPos)),
                cc.spawn(
                    cc.callFunc(this.stopAnim, this, direction),
                    cc.callFunc(this.registerEvent, this),
                    cc.callFunc(function() { if (cb) cb.next() })
                )
            ));
        } else {
            this.node.runAction(cc.sequence(
                cc.spawn(
                    cc.callFunc(this.startAnim, this, { direction: direction, speed: speed }),
                    cc.moveBy(MoveTime * step / speed, deltaPos)),
                cc.spawn(
                    cc.callFunc(this.stopAnim, this, direction),
                    cc.callFunc(this.registerEvent, this))
            ));
            if (cb) cb.next()
        }
    },

    moveByAStar: function(destPos, direction, speed, wait, cb) {
        this.node.stopAllActions();

        let startPos = this.getTilePos();
        destPos = this.map._getTilePos(destPos);
        let paths = this.aStar.moveToward(startPos, destPos);
        let floorLayer = this.mapNode.getComponent('cc.TiledMap').getLayer("floor");
        if (!paths.length) {
            cc.log("cannot find path");
            if (cb) cb.next();
            return;
        }
        let pos;
        let deltaPos;
        let oldDirection = 0;
        let newDirection = 0;
        let sequence = [];
        for (let i = 1; i < paths.length; i++) {
            deltaPos = cc.pSub(paths[i], paths[i - 1]);
            oldDirection = newDirection;
            cc.log(paths[i]);
            if (deltaPos.x == GridPerStep) {
                newDirection = Direction.Right;
                pos = cc.p(MoveStep, 0);
            } else if (deltaPos.x == -GridPerStep) {
                newDirection = Direction.Left;
                pos = cc.p(-MoveStep, 0);
            }
            if (deltaPos.y == GridPerStep) {
                newDirection = Direction.Down;
                pos = cc.p(0, -MoveStep);
            } else if (deltaPos.y == -GridPerStep) {
                newDirection = Direction.Up;
                pos = cc.p(0, MoveStep);
            }
            if (newDirection != oldDirection) {
                //转向，动画要改变
                sequence.push(cc.spawn(
                    cc.moveBy(MoveTime / speed, pos),
                    cc.callFunc(this.startAnim, this, { direction: newDirection, speed: speed })
                ));
            } else {
                sequence.push(cc.moveBy(MoveTime / speed, pos));
            }
        }
        sequence.push(cc.spawn(
            cc.callFunc(this.stopAnim, this, direction),
            cc.callFunc(this.registerEvent, this)));

        this.removeEvent();
        if (wait) {
            sequence.push(cc.callFunc(function() { if (cb) cb.next() }))
            this.node.runAction(cc.sequence(sequence));
        } else {
            this.node.runAction(cc.sequence(sequence));
            if (cb) cb.next();
        }
    },

    startAnim: function(target, data) {
        this.anim.stop();
        var direction = data.direction;
        var speed = data.speed;
        var clipName
        switch (direction) {
            case Direction.Down:
                clipName = "down";
                break;
            case Direction.Left:
                clipName = "left";
                break;
            case Direction.Right:
                clipName = "right";
                break;
            case Direction.Up:
                clipName = "up";
                break;
        }
        var animState = this.anim.play(clipName);
        //设置播放速度
        animState.speed = speed;
        // 设置循环模式为 Loop
        animState.wrapeMode = cc.WrapMode.Loop;
        // 设置动画循环次数为无限次
        animState.repeatCount = Infinity;
    },
    stopAnim: function(target, direction) {
        var face
        switch (direction) {
            case Direction.Down:
                face = "02";
                break;
            case Direction.Left:
                face = "05";
                break;
            case Direction.Right:
                face = "08";
                break;
            case Direction.Up:
                face = "11";
                break;
        }
        this.anim.stop();
        //纠正贴图
        this.node.getComponent(cc.Sprite).spriteFrame = this.actorAtlas.getSpriteFrame(face);
    },

    face: function(direction) {
        var face
        switch (direction) {
            case Direction.Down:
                face = "02";
                break;
            case Direction.Left:
                face = "05";
                break;
            case Direction.Right:
                face = "08";
                break;
            case Direction.Up:
                face = "11";
                break;
        }
        this.node.getComponent(cc.Sprite).spriteFrame = this.actorAtlas.getSpriteFrame(face);
    },

    /**
     * 显示表情
     */
    showEmotion: function(emotionName, wait, cb) {
        let animation = this.emotionNode.getComponent(cc.Animation);
        let animState = animation.getAnimationState(emotionName);
        this.emotionNode.active = true;
        if (wait) {
            this.node.runAction(
                cc.sequence(
                    cc.callFunc(function() { animation.play(emotionName) }),
                    cc.delayTime(animState.duration + 0.2),
                    cc.callFunc(function() { if (cb) cb.next() })
                )
            );
        } else {
            animation.play(emotionName);
            if (cb) cb.next();
        }
    },

    onDisable: function() {
        this.removeEvent()
    },

    onDestroy: function() {
        //没onLoad不会调用destroy？

        //非激活状态没有事件
        if (this.node.active)
            this.removeEvent()
    },
});