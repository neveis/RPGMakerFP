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

        //锁定UI标志
        this.lockUIFlag = false;
        this.loadingFlag = false;

        this.loaded = false;
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
        this.cache = this.node.getComponent('Cache');
        this.windowManager = this.getComponent('WindowManager');
        this.groupList = this.node.getComponentInChildren('GroupList');
        this.groupList.init();
        this.gameMenu = this.gameMenuNode.getComponent("GameMenu");
        //this.hud = cc.find("Game/Hud").getComponent("Hud");

        //与地图相关的信息
        this.mapInfo = {};
        //动态角色
        this.dynamicActorList = [];

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
                self.player.playerMove(self.moveState);
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
        this.node.on('scene-init-done', function(event) {
            this.scene = event.detail.scene;

            //获取控制角色对象
            this.player = this.scene.getActorTarget(this.playerId);
            this.player.setPlayerPos(this.loadPos, this.loadDirection);

            //优先使用上一个地图正在控制的角色。如果必要，可以通过事件控制切换为其他角色。
            if (this.prePlayerId != this.playerId) {
                let i;
                for (i = 0; i < this.scene.map.playerList.length; i++) {
                    if (this.prePlayerId == this.scene.map.playerList[i]) {
                        break;
                    }
                }
                if (i != this.scene.map.playerList.length) {
                    this.switchPlayer(this.prePlayerId, null);
                }
            }

            this.currentMapId = this.scene.map.mapId;
            //设置动态角色状态 *在scene中设置
            for (let i = 0; i < this.dynamicActorList.length; i++) {
                let actorTarget = this.scene.getActorTarget(this.dynamicActorList[i].actorId);
                actorTarget.setPos(this.dynamicActorList[i].pos);
                actorTarget.node.active = this.dynamicActorList[i].active;
            }
            //保证阻挡区域不会被误移除
            for (let i = 0; i < this.dynamicActorList.length; i++) {
                let actorTarget = this.scene.getActorTarget(this.dynamicActorList[i].actorId);
                actorTarget.setPos(actorTarget.getPos());
            }
            this.hideUI(['default'], false, false);

            this.groupList.initList();

            //读存档才会发生
            if (this.loadingFlag) {
                this.windowManager.showLoading(false, null);
                this.loadingFlag = false;
            }
            //检测是否有初始事件
            if (this.eventManager.checkEventById(this.currentMapId, 0)) {
                this.eventManager.eventStart(this.currentMapId);
            }
            this.loaded = true;
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

    switchPlayer: function(actorId, cb) {
        if (this.player.isMoving()) return;
        //当前控制角色
        this.playerId = actorId;
        let prePlayer = this.player;
        this.player = this.scene.getActorTarget(actorId);
        let pos = prePlayer.getPos();

        this.player.setPos(pos, prePlayer.direction);
        prePlayer.node.active = false;
        this.player.node.active = true;
        if (cb) cb.next();
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
        //如果UI被锁定，那么该函数不生效
        if (this.lockUIFlag) return;

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
     * 用于锁定UI，启用时，不能改变UI显示或隐藏状态
     */
    lockUI: function(lock, cb) {
        this.lockUIFlag = lock;
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
            //eventDone: this.eventManager.eventDone
        };
        var playerData = {
            money: this.playerData.money,
            items: this.playerData.items,
            currentPlayerId: this.playerId,
            player: player,
            playerPos: this.player.getPos(),
            playerDirection: this.player.direction,
            //taskList: this.playerData.taskList
        };

        var systemData = {
            musicVolume: this.audioManager.getMusicVolume(),
            effectVolume: this.audioManager.getEffectVolume()
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
        //this.eventManager.eventDone = eventData.eventDone;
        this.playerData.money = playerData.money;
        this.playerData.items = playerData.items;

        this.audioManager.setMusicVolume(systemData.musicVolume);
        this.audioManager.setEffectVolume(systemData.effectVolume);

        this.mapInfo = mapData.mapInfo;

        var mapId = mapData.currentMapId;
        var currentPlayerId = playerData.currentPlayerId;
        this.playerId = currentPlayerId;
        var playerPos = playerData.playerPos;
        var playerDirection = playerData.playerDirection;

        //停止播放当前音乐
        this.audioManager.stopAll();
        //显示loading过渡
        this.windowManager.showLoading(true, null);
        this.loadingFlag = true;
        if (this.gameMenu._isShown) {
            this.gameMenu.clickHandleBar();
        }

        setTimeout(
            () => { this.switchScene(mapId, currentPlayerId, playerPos, playerDirection, true) },
            2000);
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
        this.loaded = false;

        //如果不是读档，则存储当前地图信息
        if (!load) {
            this.saveMapInfo();
        }

        this.loadMapInfo(destMapId);

        this.prePlayerId = this.playerId;
        this.playerId = playerId;
        this.loadPos = destPos;
        this.loadDirection = direction;

        //释放动态加载的资源
        //this.cache.releaseRes();
        this.eventManager.clearEvent();
        //hideUI;
        this.hideUI(['default'], true, false);
        if (this.gameMenu._isShown) {
            this.gameMenu.clickHandleBar();
        }
        cc.director.loadScene(MapList[destMapId]);
    },

    saveMapInfo: function() {
        let dynamicActorList = [];
        //存储角色状态，位置
        for (let i = 0; i < this.scene.dynamicActorList.length; i++) {
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