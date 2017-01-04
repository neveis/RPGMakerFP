const RPG = require('Global');
const MoveStep = RPG.MoveStep;
const Direction = RPG.Direction;
const MoveTime = RPG.MoveTime;

cc.Class({
    extends: cc.Component,

    properties: {
        mapId: '',
        battle: false,
        playerList: {
            default: [],
            type: cc.String
        }
    },

    // use this for initialization
    onLoad: function() {
        this._aStar = this.node.getComponent("AStar")
        this.gameNode = cc.find("Game");
        this.game = this.gameNode.getComponent("Game");
        this.eventManager = this.gameNode.getComponent("EventManager");
        this.actorManager = this.gameNode.getComponent("ActorManager");

        this._tiledMap = this.node.getComponent('cc.TiledMap');
        //地图尺寸 单位为tile
        this.mapTileSize = this._tiledMap.getMapSize();
        //每个tile的尺寸
        this.tileSize = this._tiledMap.getTileSize();
        //地图尺寸 单位为像素
        this.mapSize = cc.size(this.mapTileSize.width * this.tileSize.width, this.mapTileSize.height * this.tileSize.height);

        //暂时取巧做法，为了动态生成不可行走区域
        this._blockLayer = this._tiledMap.getLayer('block');
        //手机获取不了gid 暂为253
        //依然有问题
        this.blockTileGid = this._blockLayer.getTileSet().firstGid;
        /*
        if (this.mapId === "1")
            this.blockTileGid = 253;
        else if (this.mapId === "2")
            this.blockTileGid = 289;
        else if (this.mapId === "3")
            this.blockTileGid = 521;
        else if (this.mapId == "4")
            this.blockTileGid = 521;
        else if (this.mapId == "5")
            this.blockTileGid = 521;
        else if (this.mapId == "6")
            this.blockTileGid = 521;
        else if (this.mapId == "7")
            this.blockTileGid = 521;
        */
        this.initMap();
    },
    /**
     * 计算地图移动的边界量
     */
    initMap: function() {
        var halfWidth = cc.visibleRect.width / 2;
        var halfHeight = cc.visibleRect.height / 2;
        var mapInitPos = new cc.Vec2();

        //如果地图大小小于窗口大小，地图居中显示
        //如果地图大小大于窗口大小，显示地图左下角（需要通过设定玩家位置调整）
        //地图锚点在左下角，窗口锚点在中心
        if (this.mapSize.width < cc.visibleRect.width)
            mapInitPos.x = -this.mapSize.width / 2
        else
            mapInitPos.x = -cc.visibleRect.width / 2;

        if (this.mapSize.height < cc.visibleRect.height)
            mapInitPos.y = -this.mapSize.height / 2
        else
            mapInitPos.y = -cc.visibleRect.height / 2;

        this.node.setPosition(mapInitPos);

        //地图大小与窗口大小不相等，但非常接近（<32pixel)，会导致limit相等
        //不处理的话，有黑边时画面会左右移动（移动地图中已判断处理）
        //将相对于窗口锚点的数据转换为相对于地图锚点的数据
        this.leftLimit = Math.floor(halfWidth / MoveStep) * MoveStep;
        this.rightLimit = Math.floor((this.mapSize.width - halfWidth) / MoveStep) * MoveStep;
        this.bottomLimit = Math.floor(halfHeight / MoveStep) * MoveStep;
        this.topLimit = Math.floor((this.mapSize.height - halfHeight) / MoveStep) * MoveStep;

        //地图只能在以下范围内移动，不能超出这个范围，否者会有黑边出现
        this.boundary = {};
        this.boundary.horizontalMax = 0 - cc.visibleRect.width / 2;
        this.boundary.horizontalMin = -(this.mapSize.width - cc.visibleRect.width / 2);
        this.boundary.verticalMax = 0 - cc.visibleRect.height / 2;
        this.boundary.verticalMin = -(this.mapSize.height - cc.visibleRect.height / 2);

        //this.loading.active = false;
        cc.log('map initial successfully');
    },

    /**
     * 根据玩家位置设定地图位置，尽量保证玩家在画面中央
     */
    setMapPos: function(destPos) {
        //如果地图大小小于窗口大小，地图居中显示
        if (this.mapSize.width < cc.visibleRect.width) {
            this.node.x = -this.mapSize.width / 2
        } else {
            this.node.x = -cc.visibleRect.width / 2 - (destPos.x - this.leftLimit);
            if (this.node.x < -(this.mapSize.width - cc.visibleRect.width / 2))
                this.node.x = -(this.mapSize.width - cc.visibleRect.width / 2);
            else if (this.node.x > -cc.visibleRect.width / 2)
                this.node.x = -cc.visibleRect.width / 2;
        }
        if (this.mapSize.height < cc.visibleRect.height) {
            this.node.y = -this.mapSize.height / 2
        } else {
            this.node.y = -cc.visibleRect.height / 2 - (destPos.y - this.bottomLimit);
            if (this.node.y < -(this.mapSize.height - cc.visibleRect.height / 2))
                this.node.y = -(this.mapSize.height - cc.visibleRect.height / 2);
            else if (this.node.y > -cc.visibleRect.height / 2)
                this.node.y = -cc.visibleRect.height / 2;
        }
    },

    moveMap: function(direction, destPos) {
        //direction指的是玩家移动的方向，地图移动方向与其相反
        switch (direction) {
            case Direction.Down:
                if ((destPos.y >= this.bottomLimit - MoveStep) &&
                    (destPos.y < this.topLimit) && 　
                    (this.bottomLimit != this.topLimit)) {
                    if (Math.round(this.node.y + MoveStep) > this.boundary.verticalMax) {
                        var delta = Math.round(this.boundary.verticalMax - this.node.y);
                        //未完成的动作不会停止？导致之前地图移动未完成又叠加新的偏移，导致会出现黑边，所以先停止之前的动作
                        this.node.stopAllActions();
                        this.node.runAction(cc.moveBy(0.25 * delta / MoveStep, 0, delta));
                    } else
                        this.node.runAction(cc.moveBy(0.25, 0, MoveStep));
                }
                break;
            case Direction.Up:
                if ((destPos.y > this.bottomLimit) &&
                    (destPos.y <= this.topLimit + MoveStep) && 　
                    (this.bottomLimit != this.topLimit)) {
                    if (Math.round(this.node.y - MoveStep) < this.boundary.verticalMin) {
                        var delta = Math.round(this.node.y - this.boundary.verticalMin);
                        //未完成的动作不会停止？导致之前地图移动未完成又叠加新的偏移，导致会出现黑边，所以先停止之前的动作
                        this.node.stopAllActions();
                        this.node.runAction(cc.moveBy(0.25 * delta / MoveStep, 0, -delta));
                    } else
                        this.node.runAction(cc.moveBy(0.25, 0, -MoveStep));
                }
                break;
            case Direction.Left:
                if ((destPos.x >= this.leftLimit - MoveStep) &&
                    (destPos.x < this.rightLimit) &&
                    (this.leftLimit != this.rightLimit)) {
                    if (Math.round(this.node.x + MoveStep) > this.boundary.horizontalMax) {
                        var delta = Math.round(this.boundary.horizontalMax - this.node.x);
                        this.node.stopAllActions();
                        this.node.runAction(cc.moveBy(0.25 * delta / MoveStep, delta, 0));
                    } else
                        this.node.runAction(cc.moveBy(0.25, MoveStep, 0));
                }
                break;
            case Direction.Right:
                if ((destPos.x > this.leftLimit) &&
                    (destPos.x <= this.rightLimit + MoveStep) &&
                    (this.leftLimit != this.rightLimit)) {
                    if (Math.round(this.node.x - MoveStep) < this.boundary.horizontalMin) {
                        var delta = Math.round(this.node.x - this.boundary.horizontalMin);
                        this.node.stopAllActions();
                        this.node.runAction(cc.moveBy(0.25 * delta / MoveStep, -delta, 0));
                    } else
                        this.node.runAction(cc.moveBy(0.25, -MoveStep, 0));
                }
                break;
        }
    },

    /**
     * !#zh
     * 移动镜头，可以滚动或瞬时
     * @method mapCamera
     * @param {cc.p} centerPos
     * @param {Boolean} scroll
     * @param {Number} speed
     * @param {Boolean} cb
     */
    mapCamera: function(centerPos, scroll, speed, cb) {
        if (speed == null)
            speed = 1;
        cc.log("mapcamera center", centerPos.x, centerPos.y);

        //因为不能出现黑边，实际的目的坐标与设定坐标不一定一致

        //计算实际目的坐标
        var newPos = new cc.p();
        newPos.x = -cc.visibleRect.width / 2 - (centerPos.x - this.leftLimit);
        if (newPos.x < -(this.mapSize.width - cc.visibleRect.width / 2))
            newPos.x = -(this.mapSize.width - cc.visibleRect.width / 2);
        else if (newPos.x > -cc.visibleRect.width / 2)
            newPos.x = -cc.visibleRect.width / 2;


        newPos.y = -cc.visibleRect.height / 2 - (centerPos.y - this.bottomLimit);
        if (newPos.y < -(this.mapSize.height - cc.visibleRect.height / 2))
            newPos.y = -(this.mapSize.height - cc.visibleRect.height / 2);
        else if (newPos.y > -cc.visibleRect.height / 2)
            newPos.y = -cc.visibleRect.height / 2;

        cc.log("mapcamera", newPos.x, newPos.y);
        //step用于计算移动时间，取X、Y之中最长的时间，最小是一格
        var mapCurrentPos = this.node.getPosition();
        var stepX = Math.round(Math.abs(newPos.x - mapCurrentPos.x) / MoveStep);
        var stepY = Math.round(Math.abs(newPos.y - mapCurrentPos.y) / MoveStep);
        if (stepX > stepY)
            var step = stepX;
        else
            var step = stepY;

        cc.log("map step", step);
        step = (step == 0) ? 1 : step;

        if (scroll) {
            this.node.runAction(cc.sequence(cc.moveTo(MoveTime * step / speed, newPos.x, newPos.y),
                cc.delayTime(0.2),
                cc.callFunc(function() { if (cb) cb.next() })))
        } else {
            this.node.setPosition(newPos);
            if (cb) cb.next();
        }
    },

    /**
     * !#zh
     * 将像素坐标转换为Tile坐标。注意像素坐标原点在左下角，而Tile坐标在左上角
     * @param {Object} posInPixel
     * @return {Object} Tile坐标
     */
    _getTilePos: function(posInPixel) {
        //var mapSize = this.node.getContentSize();
        var x = Math.round(posInPixel.x / this.tileSize.width);
        var y = Math.round(posInPixel.y / this.tileSize.height);
        y = this.mapTileSize.height - y - 1; //坐标系不同,需要转换
        return cc.p(x, y);
    },


    /**
     * !#zh
     * 检测是否可移动至坐标位置
     * @param {Object} posInPixel
     * @return {Boolean}
     */
    tryToMove: function(posInPixel) {
        var posInTile = this._getTilePos(posInPixel);
        if (posInTile.x >= 0 && posInTile.x < this.mapTileSize.width && posInTile.y >= 0 && posInTile.y < this.mapTileSize.height) {
            var tileGid = this._blockLayer.getTileGIDAt(posInTile);
            //cc.log(tileGid);
            if (tileGid) {
                var tileProperties = this._tiledMap.getPropertiesForGID(tileGid);
                if (tileProperties['isBlock']) {
                    cc.log('This way is blocked!');
                    return false;
                }
            } else {
                return true;
            }
        } else
            return false;
    },

    tryToMoveInTile: function(posInTile) {
        if (posInTile.x >= 0 && posInTile.x < this.mapTileSize.width && posInTile.y >= 0 && posInTile.y < this.mapTileSize.height) {
            var tileGid = this._blockLayer.getTileGIDAt(posInTile);
            //cc.log(tileGid);
            if (tileGid) {
                var tileProperties = this._tiledMap.getPropertiesForGID(tileGid);
                if (tileProperties['isBlock']) {
                    cc.log('This way is blocked!');
                    return false;
                }
            } else {
                return true;
            }
        } else
            return false;
    },
    /**
     * !#zh
     * 动态设定不能行走区域，主要用于添加NPC时自动设定
     * @param {Object} posInTile
     */
    setTileBlock: function(posInTile) {
        //偷懒只设置判定点 
        this._blockLayer.setTileGID(this.blockTileGid, posInTile);
    },

    /**
     * !#zh
     * 移除不可行走属性，当NPC移动或移除时都需要调用
     * @param {Object} posInTile
     */
    removeTileBlock: function(posInTile) {
        this._blockLayer.removeTileAt(posInTile);
    },

    /**
     * !#zh
     * 开门/关门动画（包含人物移动）
     * @param {Object} doorPos 门左下角坐标
     * @param {Number} doorFirstGid 门左下角Gid，门按固定顺序摆放
     * @param {GameEvent} cb
     */
    openDoor: function(doorPos, doorFirstGid, cb) {
        //门由两个图层组成，人物处于中间
        var layer = [];
        layer[0] = this._tiledMap.getLayer("object");
        layer[1] = this._tiledMap.getLayer("object2");
        //列数 getTileSet还是有问题
        //var columnNum = layer.getTileSet().imageSize.width / this.tileSize.width;
        var columnNum = 18;
        var doorGid = [doorFirstGid, doorFirstGid + 1,
            doorFirstGid - columnNum, doorFirstGid - columnNum + 1,
            doorFirstGid - 2 * columnNum, doorFirstGid - 2 * columnNum + 1,
            doorFirstGid - 3 * columnNum, doorFirstGid - 3 * columnNum + 1
        ];
        var player = this.game.player;

        var doorAnimation = function(target, offset) {
            //好像可以不用传参
            var posInTile = this._getTilePos(doorPos);
            if (offset < 0) {
                for (let i = 0; i < doorGid.length; i += 2) {
                    layer[Math.floor(i / 4)].setTileGID(0, cc.p(posInTile.x, posInTile.y - i / 2));
                    layer[Math.floor(i / 4)].setTileGID(0, cc.p(posInTile.x + 1, posInTile.y - i / 2));
                }
            } else {
                for (let i = 0; i < doorGid.length; i += 2) {
                    layer[Math.floor(i / 4)].setTileGID(doorGid[i] + offset, cc.p(posInTile.x, posInTile.y - i / 2));
                    layer[Math.floor(i / 4)].setTileGID(doorGid[i + 1] + offset, cc.p(posInTile.x + 1, posInTile.y - i / 2));
                }
            }
        };
        var movePlayer = function(target) {
            var direction = player.direction;
            player.move(2, direction, 1, false, false);
        };
        var playEffect = function(target, open) {
            var audioManager = this.gameNode.getComponent('AudioManager');
            if (open) {
                //this.game.playAudioEffect("DoorOpen1", 0, false);
                audioManager.playEffect('DoorOpen1');
            } else {
                //this.game.playAudioEffect("DoorClose1", 0, false);
                audioManager.playEffect('DoorClose1');
            }
        };
        var showUI = function(target) {
            this.game.hideUI(['default'], false, false);
        }

        var action = cc.sequence(
            cc.delayTime(0.07),
            cc.spawn(
                cc.callFunc(doorAnimation, this, 2),
                cc.callFunc(playEffect, this, true)
            ),
            cc.delayTime(0.07),
            cc.callFunc(doorAnimation, this, 4),
            cc.delayTime(0.07),
            cc.callFunc(doorAnimation, this, -1),
            cc.spawn(
                cc.delayTime(0.5),
                cc.callFunc(movePlayer, this)
            ),
            cc.delayTime(0.07),
            cc.spawn(
                cc.callFunc(doorAnimation, this, 0),
                cc.callFunc(playEffect, this, false)
            ),
            cc.callFunc(showUI, this),
            cc.callFunc(function() { if (cb) cb.next() })
        );

        this.game.hideUI(["default"], true, false);
        this.node.runAction(action);
    },

});