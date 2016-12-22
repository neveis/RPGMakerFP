var RPG = require("Global");
var MoveState = RPG.MoveState;
var Direction = RPG.Direction;
var MoveStep = RPG.MoveStep;
var MoveTime = RPG.MoveTime;
var MapList = RPG.MapList;
const TouchControl = RPG.TouchControl;
cc.Class({
    extends: cc.Component,

    properties: {

        gameMenuNode: cc.Node,

    },

    // use this for initialization
    onLoad: function() {
        var self = this;
        //Game节点设置为常驻节点
        cc.game.addPersistRootNode(this.node);

        //正式删除
        this.loadPos = cc.v2(320, 160);
        this.loadDirection = 2;

        //当前正在控制的角色ID，默认为ID = 1
        this.playerId = 1;
        this.prePlayerId = 1;
        //可控角色列表
        this.playerList = [];
        //移动方向
        this.moveState = MoveState.Stand;

        //玩家朝向
        this.playerDirection = Direction.Down;

        //上一个地图和当前地图ID
        this.previousMapId = this.currentMapId = "0";
        //当然控制角色的ID，通过ActorManager来获取实例
        this.currentActorId = 1;

        this.eventManager = this.node.getComponent('EventManager');
        this.audioManager = this.node.getComponent('AudioManager');
        this.playerData = this.node.getComponent('PlayerData');
        //this.gameMenu = this.gameMenuNode.getComponent("GameMenu");
        //this.hud = cc.find("Game/Hud").getComponent("Hud");

        //与地图相关的信息
        this.mapInfo = {};
        //动态角色
        this.dynamicActor = [];

        this.treasureList = [];

        //cc.audioEngine.play(cc.url.raw('/resources/Audio/LuoRiYuGe.mp3'), false, 1);
        //注册键盘事件，方便电脑调试
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.moveState = MoveState.Left;
                        self.playerDirection = Direction.Left;
                        self.keyA = true;
                        break;
                    case cc.KEY.d:
                        self.moveState = MoveState.Right;
                        self.playerDirection = Direction.Right;
                        self.keyD = true;
                        break;
                    case cc.KEY.w:
                        self.moveState = MoveState.Up;
                        self.playerDirection = Direction.Up;
                        self.keyW = true;
                        break;
                    case cc.KEY.s:
                        self.moveState = MoveState.Down;
                        self.playerDirection = Direction.Down;
                        self.keyS = true;
                        break;
                    case cc.KEY.shift:
                        self.acc = true;
                        break;
                    default:
                        self.moveState = MoveState.Stand;
                        break;
                }
                //cc.log(self.moveState);
            },
            onKeyReleased: function(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.keyA = false;
                        break;
                    case cc.KEY.d:
                        self.keyD = false;
                        break;
                    case cc.KEY.w:
                        self.keyW = false;
                        break;
                    case cc.KEY.s:
                        self.keyS = false;
                        break;
                    case cc.KEY.shift:
                        self.acc = false;
                        break;
                }
                if (!(self.keyA || self.keyD || self.keyW || self.keyS)) {
                    //self.moveStop();
                    //this.isKeyBoard = false;
                    self.moveState = MoveState.Stand;
                }
                //cc.log(self.moveState);
            }
        }, self.node)

        //监控触摸事件，与键盘同时控制
        this.node.on('TouchControl', function(event) {
            this.moveState = event.detail.moveState;
            this.playerDirection = event.detail.moveDirection;
        }, this)

        //初始化与地图相关的属性，并运行初始事件
        //所有脚本的start()结束后会被触发
        this.node.on('InitMap', function(event) {
            //地图脚本
            this.map = event.detail.map;
            this.playerList = this.map.playerList;
            if (this.playerId != null) {
                //如果上一个地图的控制角色在当前还可控，则保持上一个地图的角色
                var i = 0;
                for (; i < this.playerList.length; i++) {
                    if (this.prePlayerId == this.playerList[i])
                        break;
                }
                if (i != this.playerList.length) {
                    this.switchPlayer(null, this.prePlayerId);
                }
                this.player = this.actorManager.getTarget(this.playerId);
                this.playerAnim = this.player.node.getComponent(cc.Animation);
                //所有地图默认显示为艾尔莎。所以当载入地图后控制角色不为艾尔莎则需要隐藏。
                if (this.playerId != 1)
                    this.showActor(1, false, false);

            }

            this.currentMapId = this.map.mapId;
            this.initMap();
            for (var i = 0; i < this.dynamicActor.length; i++) {
                var target = this.actorManager.getTarget(this.dynamicActor[i].id);
                target.setPos(this.dynamicActor[i].pos);
                target.node.active = this.dynamicActor[i].active;
            }
            //载入完后清空
            this.dynamicActor = [];
            this.mapLoaded = event.detail.mapLoaded;

            this.loading.getComponent(cc.Animation).stop()
            this.loading.parent.active = false;
            this.hideUI(["TouchPanel", "MainButton", "GameMenu"], false, false);
            if (this.map.battle) {
                this.hideUI(["Hud", "BattleButton"], false, false);
                this.hud.updateDisplay(true);
            }
            if (this.gameMenu.menuNode.active)
                this.gameMenu.menuNode.active = false;
            //检测是否有地图初始事件，初始事件以地图ID命名，并配合eventDone标志
            //玩家起始位置待修改，通过场景切换的回调函数完成（逻辑问题没解决，暂不实现）
            //现在这个方法还可用于读存档中使用
            if (this.eventManager.eventList[this.currentMapId] != undefined) {
                if (!this.eventManager.eventDone[this.currentMapId])
                    this.eventManager.eventStart(this.currentMapId);
                else {
                    if (this.playerId != null)
                        this.setPlayerPos(this.loadPos, this.loadDirection)
                }
            } else {
                if (this.playerId != null)
                    this.setPlayerPos(this.loadPos, this.loadDirection)
            }
        }, this)

        this.node.on('scene-init-done', function(event) {
            this.scene = event.detail.scene;

            //获取控制角色对象
            this.player = this.scene.getActorTarget(this.playerId);
            this.player.setPlayerPos(this.loadPos, this.loadDirection);

            this.currentMapId = this.scene.map.mapId;
            //设置动态角色状态 *在scene中设置

            //检测是否有初始事件
            if (this.eventManager.checkEventById(this.currentMapId, 0)) {
                this.eventManager.eventStart(this.currentMapId);
            }
        }, this)
    },

    start: function() {
        let TouchControl = cc.find('Game/TouchPanel').getComponent('TouchControl')
        TouchControl.addListener(this.node);

        this.node.on('touch-control', function(event) {
            this.moveState = event.detail.moveState;
            this.playerDirection = event.detail.moveDirection;
            this.player.playerMove(this.moveState);
        }, this)
    },
    // called every frame, uncomment this function to activate update callback
    //update: function(dt) {

    //},

    /**
     * 切换控制角色,参数为了兼容按键触发
     */
    switchPlayer: function(target, actorId) {

        //只有一个可控角色
        if (this.playerList.length == 1) return;

        var prePlayerId = this.playerId;
        var pos = this.actorManager.getTarget(prePlayerId).getPos();
        if (actorId == null) {
            //不在移动中时才可切换,并没有效果.....
            if (!this.canMove()) return;
            var index = 0;
            for (; index < this.playerList.length; index++) {
                if (this.playerList[index] == prePlayerId)
                    break;
            }
            index++;
            if (index == this.playerList.length)
                index = 0;

            this.playerId = this.playerList[index];
        } else
            this.playerId = actorId;;
        this.showActor(prePlayerId, false, false);
        this.showActor(this.playerId, true, false);
        this.setActorPos(this.playerId, pos, this.playerDirection);
        this.player = this.actorManager.getTarget(this.playerId);
        this.playerAnim = this.player.node.getComponent(cc.Animation);
        this.hud.setAvatar(this.playerId);
    },

    /**
     * !#zh
     * 显示气球表情
     * @param {Number} actorId
     * @param {String} balloonName
     * @param {Boolean} wait
     * @param {Boolean} nextEvent
     */
    showActorBalloon: function(actorId, balloonName, wait, nextEvent) {
        //var actorId = detail.actorId;
        var actorTarget = this.actorManager.getTarget(actorId.toString());
        //actorTarget.showBalloon(detail.balloonName, detail.wait, nextEvent);
        actorTarget.showBalloon(balloonName, wait, nextEvent);
    },

    getTreasure: function(target, typeList, idList, numList, nextEvent) {
        //偷懒利用事件来完成效果，打死我吧！因此nextEvent无用
        for (let i = 0; i < typeList.length; i++) {
            this.addItem(typeList[i], idList[i], numList[i], false);
            //显示效果反过来
            this.eventManager.currentEvent.unshift({
                "detail": {
                    "type": typeList[typeList.length - 1 - i],
                    "itemId": idList[typeList.length - 1 - i],
                    "count": numList[typeList.length - 1 - i]
                },
                "type": 11
            });
        }
        target.getTreasure();
        this.playAudioEffect("Shop", 0, false);
        this.eventManager.nextEventStart();
    },

    /**
     * 添加/删除任务。只用于显示，与系统无任何交互
     * @param {Number} index
     * @param {Object} info
     * @param {Boolean} add
     */
    addTask: function(index, info, add) {
        if (add) {
            this.playerData.taskList.splice(index, 0, info);
        } else
            this.playerData.taskList.splice(index, 1);
        this.eventManager.nextEventStart();
    },

    /**
     * !#zh
     * 隐藏UI
     * @param {[String]} nodeName
     * @param {Boolean} hide
     * @param {Boolean} nextEvent
     */
    hideUI: function(nodeList, hide, cb) {
        let NodeMap = RPG.NodeMap;
        let node;
        for (let i = 0; i < nodeList.length; i++) {
            let nodeName = NodeMap[nodeList[i].toString()];
            if (nodeName instanceof Array) {
                for (let j = 0; j < nodeName.length; j++) {
                    node = this.node.getChildByName(nodeName[j]);
                    node && (node.active = !hide);
                }
            } else {
                node = this.node.getChildByName(NodeMap[nodeList[i].toString()]);
                node && (node.active = !hide);
            }
        }
        if (cb) cb.next();
    },

    /**
     * !#zh
     * 播放动画
     * @param {String} clipName
     * @param {Boolean} wait
     * @param {GameEvent} cb
     */
    playMapAnimation: function(clipName, wait, cb) {
        var mapAnimation = this.map.node.getComponent(cc.Animation);
        if (mapAnimation == null) return;
        var clip;
        var clips = mapAnimation.getClips();
        for (let i = 0; i < clips.length; i++) {
            if (clips[i].name === clipName) {
                clip = clips[i];
                break;
            }
        }
        if (clip == null) return;
        if (wait) {
            clip.events.push({ frame: clip.duration, func: "callFunc", params: [function() { if (cb) cb.next() }] });
            mapAnimation.play(clipName);
        } else {
            mapAnimation.play(clipName);
            if (cb) cb.next();
        }
    },

    /**
     * !#zh
     * 播放音效
     * @param {String} effectName 音效名
     * @param {Number} type
     * @param {Boolean} nextEvent
     */
    playAudioEffect: function(effectName, type, nextEvent) {
        this.audioManager.playEffect(effectName, type, nextEvent);
    },
    /**
     * !#zh
     * 开门动画，含音效
     * @param {Object} doorPos 门的坐标
     * @param {Number} firstGid 门左下角的GID
     * @param (Boolean) nextEvent
     */

    openDoor: function(doorPos, firstGid, nextEvent) {
        this.map.openDoor(doorPos, firstGid, nextEvent);
    },

    /**
     * !#zh
     * 延迟，以秒为单位
     * @param {Number} second
     * @param {GameEvent} cb
     */
    delaySecond: function(second, cb) {
        this.node.runAction(cc.sequence(
            cc.delayTime(second),
            cc.callFunc(function() { if (cb) cb.next() })
        ));
    },

    /**
     * !#zh
     * 存档
     */
    saveGame: function() {
        //角色数据
        var player = {};
        /*
        for (var key in this.playerData.player) {
            player[key] = {};
            player[key].attributes = this.playerData.player[key].getAttributes();
            player[key].equipment = this.playerData.player[key].getEquipment();
        };
        */
        //更新地图信息
        this.saveMapInfo();
        var mapData = {
            currentMapId: this.currentMapId,
            mapInfo: this.mapInfo
        };
        var eventData = {
            eventSwitcher: this.eventManager.eventSwitcher,
            eventDone: this.eventManager.eventDone
        };
        var playerData = {
            money: this.playerData.money,
            items: this.playerData.items,
            currentPlayerId: this.playerId,
            player: player,
            playerPos: this.player.getPos(),
            playerDirection: this.player.direction,
            taskList: this.playerData.taskList
        };

        var systemData = {
            musicVolume: this.audioManager.getMusicVolume(),
            effectVolume: this.audioManager.getEffectsVolume()
        };

        var saveData = {
            mapData: mapData,
            eventData: eventData,
            playerData: playerData,
            systemData: systemData
        };
        cc.log("saveData:", saveData);
        //cc.sys.localStorage.setItem('save', JSON.stringify(saveData));
        return saveData;
    },

    loadGame: function(saveData) {
        var mapData = saveData.mapData;
        var eventData = saveData.eventData;
        var playerData = saveData.playerData;
        var systemData = saveData.systemData;

        this.eventManager.eventSwitcher = eventData.eventSwitcher;
        this.eventManager.eventDone = eventData.eventDone;
        this.playerData.money = playerData.money;
        this.playerData.items = playerData.items;

        this.audioManager.setMusicVolume(systemData.musicVolume);
        this.audioManager.setEffectsVolume(systemData.effectVolume);

        this.mapInfo = mapData.mapInfo;

        var mapId = mapData.currentMapId;
        var currentPlayerId = playerData.currentPlayerId;
        this.playerId = currentPlayerId;
        var playerPos = playerData.playerPos;
        var playerDirection = playerData.playerDirection;
        this._switchScene(mapId, currentPlayerId, playerPos, playerDirection, true);
    },

    /**
     * !#zh
     * 切换地图
     * @param {String} destMapId
     * @param {Number} playerId
     * @param {Object} destPos
     * @param {Number} direction
     */
    switchScene: function(destMapId, playerId, destPos, direction, load) {
        //如果不是读档，则存储当前地图信息
        if (!load) {
            var dynamicActor = [];
            var i = 0;
            for (var id in this.actorManager.dynamicActor) {
                dynamicActor[i] = {
                    id: id,
                    active: this.actorManager.getTarget(id).node.active,
                    pos: this.actorManager.getTarget(id).getPos()
                };
                i++;
            }
            this.mapInfo[this.currentMapId] = {
                mapId: this.currentMapId,
                dynamicActor: dynamicActor,
                treasureList: this.treasureList
            }
        }
        //读取即将载入的地图信息
        if (this.mapInfo[destMapId] != null) {
            this.dynamicActor = this.mapInfo[destMapId].dynamicActor;
            this.treasureList = this.mapInfo[destMapId].treasureList;
        } else {
            //还未载入过则初始化一下
            this.dynamicActor = [];
            this.treasureList = [];
        }
        this.loading.parent.active = true;
        this.loading.getComponent(cc.Animation).play()
        this.previousMapId = this.currentMapId;
        this.mapLoaded = false;
        this.prePlayerId = this.playerId;
        this.playerId = playerId;
        this.loadPos = destPos;
        this.loadDirection = direction;
        this.hideUI(["TouchPanel", "MainButton", "GameMenu", "Hud", "BattleButton"], true, false);
        this.audioManager.pauseBGM();
        cc.director.loadScene(MapList[destMapId]);
    },

    _switchScene: function(destMapId, playerId, destPos, direction, load) {
        //如果不是读档，则存储当前地图信息
        if (!load) {
            this.saveMapInfo();
        }

        this.loadMapInfo(destMapId);

        this.prePlayerId = this.playerId;
        this.playerId = playerId;
        this.loadPos = destPos;
        this.loadDirection = direction;
        //hideUI;
        cc.director.loadScene(MapList[destMapId]);
    },

    saveMapInfo: function() {
        let dynamicActorList = [];
        //存储角色状态，位置
        for (let i = 0; i < this.scene.dynamicActorList; i++) {
            dynamicActorList[i] = {
                actorId: this.scene.dynamicActorList[i].actorId,
                active: this.scene.dynamicActorList[i].node.active,
                pos: this.scene.dynamicActorList[i].getPos()
            }
        }
        this.mapInfo[this.currentMapId] = {
            mapId: this.currentMapId,
            dynamicActorList: dynamicActorList,
        }

    },
    loadMapInfo: function(mapId) {
        //用于初始化
        if (this.mapInfo[mapId]) {
            this.dynamicActorList = this.mapInfo[mapId].dynamicActorList;
        } else {
            this.dynamicActorList = []
        }
    }
});