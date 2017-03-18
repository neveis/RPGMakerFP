const Game = require('Game');
const GameEvent = require("GameEvent");
const EventManager = require('EventManager');
const WindowManager = require('WindowManager');
const PlayerData = require('PlayerData');
const AudioManager = require("AudioManager");

const EventType = cc.Enum({
    Dialogue: 1,
    Shop: 2,
    SwitchScene: 3,
    ExecuteEvent: 4,
    ScrollMap: 5,
    MoveActor: 6,
    ShowActor: 7,
    SetEventDone: 8,
    SetActorPos: 9,
    ShowEmotion: 10,
    ShowItemMsg: 11,
    AddItem: 12,
    ShowMessage: 13,
    HideUI: 14,
    SetSwitcher: 15,
    MapAnimation: 16,
    DoorAnimation: 17,
    MoveByAStar: 18,
    GetTreasure: 19,
    LockUI: 20,
    Option: 21,
    Delay: 22,
    FadeIn: 23,
    Task: 24,
    AudioMusic: 25,
    AudioEffect: 26,
    ChangeAtlas: 27,
    ChangeSprite: 28,
    MoveAnimation: 29,
    SetLayerOrder: 30,
    ShowLoading: 31,
    Branch: 32,
    MoveRandomly: 33,
    MaintainEvent: 34,
    EventControl: 35,
    Qmessage: 36,
    CameraAutoFollow: 37,
    ActorAction: 38
});

const ConditionType = cc.Enum({
    CheckItem: 1,
    Random: 2,
    Variable: 3,
    CheckDistance: 4,
    ForwardPassable: 5,

    DetectionRange: 101,
    CheckBehind: 102
});

cc.Class({
    extends: cc.Component,

    properties: {
        game: {
            default: null,
            type: Game
        },
        eventManager: {
            default: null,
            type: EventManager
        },
        playerData: {
            default: null,
            type: PlayerData
        },
        windowManager: {
            default: null,
            type: WindowManager
        },
        audioManager: {
            default: null,
            type: AudioManager
        }
    },

    // use this for initialization
    onLoad: function() {
        //自定义变量,值必须为函数 key:function
        this.CustomVariable = {};
    },

    /**
     * checkSwitcher
     */
    checkSwitcher: function(switcher) {
        return this.eventManager.eventSwitcher[switcher];
    },

    /**
     * Type 1
     */
    showDialogueBox: function(detail, target, gameEvent) {
        let dialogues = detail;
        this.windowManager.showDialogueBox(dialogues, target, gameEvent);
    },

    /**
     * Type 2
     */
    showShop: function(detail, target, gameEvent) {
        let itemIdList = detail.itemIdList;
        this.windowManager.showShopWindow(itemIdList, target, gameEvent);
    },

    /**
     * Type 3
     */
    switchScene: function(detail) {
        let destMapId = detail.destMapId;
        let playerId = detail.playerId;
        let destPos = detail.destPos;
        let direction = detail.direction;
        this.game.switchScene(destMapId, playerId, destPos, direction, false);
    },

    /**
     * Type 4
     */
    executeEvent: function(detail, gameEvent) {
        let eventId = detail.eventId;
        this.eventManager.eventStart(eventId);
        gameEvent.next();
    },

    /**
     * Type 5
     */
    scrollMap: function(detail, gameEvent) {
        let centerPos = detail.centerPos;
        let scroll = detail.scroll;
        let speed = detail.speed || 1;
        this.game.scene.map.mapCamera(centerPos, scroll, speed, gameEvent);
    },

    /**
     * Type 6
     */
    moveActor: function(detail, gameEvent) {
        let actorId = detail.actorId.toString();
        let step = detail.step;
        let direction = detail.direction;
        let speed = detail.speed;
        let wait = detail.wait;
        let actorTarget = this.game.scene.getActorTarget(actorId);
        actorTarget.move(step, direction, speed, wait, gameEvent);
    },

    /**
     * Type 7
     */
    showActor: function(detail, gameEvent) {
        let actorId = detail.actorId.toString();
        let active = detail.active;
        let actorTarget = this.game.scene.getActorTarget(actorId);
        actorTarget.node.active = active;
        gameEvent.next();
    },

    /**
     * Type 8
     */
    setEventDone: function(detail, gameEvent) {
        let eventId = detail.eventId;
        let done = detail.done;
        this.eventManager.setDoneFlag(eventId, done, gameEvent);
    },

    /**
     * Type 9
     */
    setActorPos: function(detail, gameEvent) {
        let actorId = detail.actorId.toString();
        let pos = detail.pos;
        let direction = detail.direction;
        if (actorId == '0') actorId = this.game.playerId;
        let actorTarget = this.game.scene.getActorTarget(actorId);
        actorTarget.setPos(pos, direction);
        gameEvent.next();
    },

    /**
     * Type 10
     */
    showEmotion: function(detail, gameEvent) {
        let actorId = detail.actorId.toString();
        let emotionName = detail.emotionName;
        let wait = detail.wait;
        let target = this.game.scene.getActorTarget(actorId);
        target.showEmotion(emotionName, wait, gameEvent);
    },

    /**
     * Type 11
     */
    showItemMsg: function(detail, gameEvent) {
        let type = detail.type;
        let itemId = detail.itemId;
        let count = detail.count;
        this.windowManager.showItemMsg(type, itemId, count, gameEvent);
    },

    /**
     * Type 12
     */
    addItem: function(detail, gameEvent) {
        let type = detail.type;
        let itemId = detail.itemId;
        let num = detail.num;
        switch (type) {
            case 0:
                this.playerData.setMoneyBy(num);
                break;
            case 1:
                if (num > 0) {
                    this.playerData.addItem(itemId, num);
                } else {
                    this.playerData.removeItem(itemId, -num);
                }
                break;
        }
        gameEvent.next();
    },

    /**
     * Type 13
     */
    showMessage: function(detail, gameEvent) {
        let message = detail.message;
        this.windowManager.showMessage(message, gameEvent);
    },

    /**
     * Type 14
     */
    hideUI: function(detail, gameEvent) {
        let nodeList = detail.nodeList;
        let hide = detail.hide;
        this.game.hideUI(nodeList, hide, gameEvent);
    },

    /**
     * Type 15 untested
     */
    setSwitcher: function(detail, gameEvent) {
        let switcherId = detail.switcherId;
        let flag = detail.flag;
        this.eventManager.setSwitcher(switcherId, flag, gameEvent);
    },

    /**
     * Type 16 untested
     */
    mapAnimation: function(detail, gameEvent) {
        let clipName = detail.clipName;
        let wait = detail.wait;
        this.game.playMapAnimation(clipName, wait, gameEvent);
    },

    /**
     * Type 17 untested
     */
    doorAnimation: function(detail, gameEvent) {
        let doorPos = detail.pos;
        let firstGid = detail.firstGid;
        this.game.scene.map.openDoor(doorPos, firstGid, gameEvent);
    },

    /**
     * Type 18
     */
    moveActorByAStar: function(detail, gameEvent) {
        let actorId = detail.actorId.toString();
        let destPos = detail.destPos;
        let direction = detail.direction;
        let speed = detail.speed;
        let wait = detail.wait;
        let actorTarget = this.game.scene.getActorTarget(actorId);
        actorTarget.moveByAStar(destPos, direction, speed, wait, gameEvent);
    },

    /**
     * Type 19
     */
    getTreasure: function(detail, target, gameEvent) {
        let gainEvent = detail.gainEvent;
        target.getTreasure(gainEvent, gameEvent);
    },

    /**
     * Type 20
     */
    lockUI: function(detail, gameEvent) {
        let lock = detail.lock;
        this.game.lockUI(lock, gameEvent);
    },

    /**
     * Type 21
     */
    showOption: function(detail, target, gameEvent) {
        let message = detail.message;
        let options = detail.options;
        this.windowManager.showOption(message, target, options, gameEvent);
    },

    /**
     * Type 22
     */
    delaySecond: function(detail, gameEvent) {
        let second = detail.second;
        this.game.delaySecond(second, gameEvent);
    },

    /**
     * Type 23
     */
    fadeInOrOut: function(detail, gameEvent) {
        let fadeIn = detail.fadeIn;
        let duration = detail.duration;
        this.windowManager.fadeInOrOut(fadeIn, duration, gameEvent);
    },

    /**
     * Type 25
     */
    audioMusic: function(detail, gameEvent) {
        let audioName = detail.audioName;
        let loop = detail.loop;
        let state = detail.state;

        switch (state) {
            //播放
            case 0:
                this.audioManager.playMusic(audioName, loop, gameEvent);
                break;
                //暂停
            case 1:
                this.audioManager.pauseMusic(audioName, gameEvent);
                break;
                //恢复
            case 2:
                this.audioManager.resumeMusic(audioName, loop, gameEvent);
                break;
                //停止
            case 3:
                this.audioManager.stopMusic(audioName, gameEvent);
                break;
        }
    },

    /**
     * Type 26
     */
    audioEffect: function(detail, gameEvent) {
        let audioName = detail.audioName;
        this.audioManager.playEffect(audioName, gameEvent);
    },

    /**
     * Type 27
     */
    changeAtlas: function(detail, gameEvent) {
        let actorId = detail.actorId.toString();
        let atlasPath = detail.atlasPath;
        let target = this.game.scene.getActorTarget(actorId);
        target.changeAtlas(atlasPath, gameEvent);
    },

    /**
     * Type 28
     */
    changeSprite: function(detail, gameEvent) {
        let actorId = detail.actorId.toString();
        let spriteName = detail.spriteName;
        let target = this.game.scene.getActorTarget(actorId);
        target.changeSprite(spriteName, gameEvent);
    },

    /**
     * Type 29
     */
    moveAnimation: function(detail, gameEvent) {
        let actorId = detail.actorId.toString();
        let direction = detail.direction;
        let speed = detail.speed;
        let state = detail.state;
        let target = this.game.scene.getActorTarget(actorId);
        if (state == 1) {
            target.moveAnimation(null, { direction: direction, speed: speed });
        } else {
            target.stopAnim(null, direction);
        }
        gameEvent.next();
    },

    /**
     * Type 30
     */
    setLayerOrder: function(detail, gameEvent) {
        let order = detail.order;
        let actorId = detail.actorId;
        let target = this.game.scene.getActorTarget(actorId);
        target.setLayerOrder(order, gameEvent);
    },

    /**
     * Type 31
     */
    showLoading: function(detail, gameEvent) {
        let show = detail.show;
        this.windowManager.showLoading(show, gameEvent);
    },

    /**
     * Type 32
     */
    branch: function(detail, gameEvent) {
        let conditions = detail.conditions;
        //事件分支列表[[],[]]
        let branch = detail.branch;
        //概率参考值。0~1，表示触发概率。1为100%触发。
        let randomRef = detail.randomRef;
        let flag = true;
        let subEvents = branch[0];
        for (let i = 0; i < conditions.length; i++) {
            if (!this.conditionInterpreter(conditions[i])) {
                flag = false;
                break;
            }
        }
        //如果满足条件，并满足随机概率则触发。
        if (flag) {
            let random = cc.random0To1();
            if (random < randomRef) {
                subEvents = branch[1];
            }
        }

        let newEvent = new GameEvent();
        newEvent.setCallback(gameEvent);
        newEvent.startBySubEvent(subEvents, gameEvent);
    },

    /**
     * Type 33
     */
    moveRandomly: function(detail, gameEvent) {
        let actorId = detail.actorId;
        let speed = detail.speed;
        let target = this.game.scene.getActorTarget(actorId);
        if (target) {
            target.moveRandomly(speed, gameEvent);
        } else {
            cc.log("cannot find actorID: ", actorId);
            gameEvent.next();
        }
    },

    /**
     * Type 34 
     * 只能在Branch中的事件序列使用。在主事件序列中没有用。
     */
    maintainEvent: function(detail, gameEvent) {
        let parentEvent = gameEvent.callback;
        if (parentEvent instanceof GameEvent) {
            parentEvent.unshiftSubEvent(parentEvent.preSubEvent);
        }
        gameEvent.next();
    },

    /**
     * Type 35
     * 控制事件的运行停止
     */
    eventControl: function(detail, gameEvent) {
        let state = detail.state;
        let eventId = detail.eventId;
        this.eventManager.eventControl(eventId, state, gameEvent.next.bind(gameEvent))
    },

    /**
     * Type 36
     */
    showQmessage: function(detail, gameEvent) {
        let actorId = detail.actorId;
        let message = detail.message;

        let target = (actorId == '0') ? this.game.scene.getActorTarget(this.game.playerId) : this.game.scene.getActorTarget(actorId);

        if (target) {
            this.windowManager.showQmessage(target.node, message, gameEvent.next.bind(gameEvent));
        } else {
            cc.log('can not find node');
            gameEvent.next();
        }
    },

    /**
     * Type 37
     * 设置镜头跟随
     */
    setCameraAutoFollow: function(detail, gameEvent) {
        this.game.cameraFollowFlag = detail.flag;
        gameEvent.next();
    },

    /**
     * Type 38
     * 运行自定义角色动作
     */
    playActionAction: function(detail, gameEvent) {
        var actionTag = detail.tag;
        var wait = detail.wait;
        var actorId = detail.actorId;

        var target = this.game.scene.getActorTarget(actorId);
        var action = this.game.cache.getAction(actionTag);
        if (!action) {
            console.log("没有定义动作: ", actionTag);
            gameEvent.next();
            return;
        }
        target.runAction(action, wait, gameEvent.next.bind(gameEvent))

    },

    eventInterpreter: function(subEvent, gameEvent) {
        let detail = subEvent.detail;
        switch (subEvent.eventType) {
            case EventType.Dialogue:
                this.showDialogueBox(detail, gameEvent.event.target, gameEvent);
                break;
            case EventType.Shop:
                this.showShop(detail, gameEvent.event.target, gameEvent);
                break;
            case EventType.SwitchScene:
                this.switchScene(detail);
                break;
            case EventType.ExecuteEvent:
                this.executeEvent(detail, gameEvent);
                break;
            case EventType.ScrollMap:
                this.scrollMap(detail, gameEvent);
                break;
            case EventType.MoveActor:
                this.moveActor(detail, gameEvent);
                break;
            case EventType.ShowActor:
                this.showActor(detail, gameEvent);
                break;
            case EventType.SetEventDone:
                this.setEventDone(detail, gameEvent);
                break;
            case EventType.SetActorPos:
                this.setActorPos(detail, gameEvent);
                break;
            case EventType.ShowEmotion:
                this.showEmotion(detail, gameEvent)
                break;
            case EventType.ShowItemMsg:
                this.showItemMsg(detail, gameEvent);
                break;
            case EventType.AddItem:
                this.addItem(detail, gameEvent);
                break;
            case EventType.ShowMessage:
                this.showMessage(detail, gameEvent);
                break;
            case EventType.HideUI:
                this.hideUI(detail, gameEvent);
                break;
            case EventType.SetSwitcher:
                this.setSwitcher(detail, gameEvent);
                break;
            case EventType.MapAnimation:
                this.mapAnimation(detail, gameEvent);
                break;
            case EventType.DoorAnimation:
                this.doorAnimation(detail, gameEvent);
                break;
            case EventType.MoveByAStar:
                this.moveActorByAStar(detail, gameEvent);
                break;
            case EventType.GetTreasure:
                this.getTreasure(detail, gameEvent.event.target)
                break;
            case EventType.LockUI:
                this.lockUI(detail, gameEvent);
                break;
            case EventType.Option:
                this.showOption(detail, gameEvent.event.target, gameEvent);
                break;
            case EventType.Delay:
                this.delaySecond(detail, gameEvent);
                break;
            case EventType.FadeIn:
                this.fadeInOrOut(detail, gameEvent);
                break;
            case EventType.AudioMusic:
                this.audioMusic(detail, gameEvent);
                break;
            case EventType.AudioEffect:
                this.audioEffect(detail, gameEvent);
                break;
            case EventType.ChangeAtlas:
                this.changeAtlas(detail, gameEvent);
                break;
            case EventType.ChangeSprite:
                this.changeSprite(detail, gameEvent);
                break;
            case EventType.MoveAnimation:
                this.moveAnimation(detail, gameEvent);
                break;
            case EventType.SetLayerOrder:
                this.setLayerOrder(detail, gameEvent);
                break;
            case EventType.ShowLoading:
                this.showLoading(detail, gameEvent);
                break;
            case EventType.Branch:
                this.branch(detail, gameEvent);
                break;
            case EventType.MoveRandomly:
                this.moveRandomly(detail, gameEvent);
                break;
            case EventType.MaintainEvent:
                this.maintainEvent(detail, gameEvent);
                break;
            case EventType.EventControl:
                this.eventControl(detail, gameEvent);
                break;
            case EventType.Qmessage:
                this.showQmessage(detail, gameEvent);
                break;
            case EventType.CameraAutoFollow:
                this.setCameraAutoFollow(detail, gameEvent);
                break;
            case EventType.ActorAction:
                this.playActionAction(detail, gameEvent);
                break;
            default:
                console.log("no event type")
                gameEvent.next();
                break;
        }
    },

    /**
     * 检测条件
     */
    /**
     * 1
     */
    checkItem: function(detail) {
        let type = detail.type;
        let itemId = detail.itemId;
        let num = detail.num;
        let compare = detail.compare;

        let realNum;
        if (type == 0) {
            realNum = this.playerData.getMoney()
        } else {
            realNum = this.playerData.checkItem(itemId)
        }

        return this.compare(realNum, num, compare);
    },

    /**
     * 2
     */
    random: function(detail) {
        let ref = detail.ref;
        let operator = detail.operator;
        let result = cc.random0To1();

        return this.compare(result, ref, operator);
    },

    /**
     * 3
     */
    variable: function(detail) {
        let variable = detail.variable;
        let ref = detail.ref;
        let operator = detail.operator;

        if (this.CustomVariable[variable]) {
            let result = this.CustomVariable[variable]();
            return this.compare(result, ref, operator);
        } else {
            cc.log('cannot find variable');
            return false;
        }
    },

    /**
     * actor1=0是代表自身
     * actor2=0代表玩家
     * 4
     */
    checkDistance: function(detail, target) {
        let actorId1 = detail.actorId1;
        let actorId2 = detail.actorId2;
        let ref = detail.ref;
        let operator = detail.operator;

        //id 0 表示事件拥有者
        let target1 = (actorId1 == '0') ? target : this.game.scene.getActorTarget(actorId1);
        let target2 = (actorId2 == '0') ? this.game.scene.getActorTarget(this.game.playerId) : this.game.scene.getActorTarget(actorId2);

        let tilePos1 = target1.getRealTilePos();
        let tilePos2 = target2.getRealTilePos();

        let deltaX = Math.abs(tilePos1.x - tilePos2.x);
        let deltaY = Math.abs(tilePos1.y - tilePos2.y);

        //怎么算距离合适？x+y or max(x,y)
        let distance = detailX + detailY;
        return this.compare(distance, ref, operator);
    },

    /**
     * 5
     */
    checkForwardPassable: function(detail) {
        let direction = detail.direction;
        let actorId = detail.actorId.toString();
        let target = this.game.scene.getActorTarget(actorId);
        return this.game.scene.map.tryToMove(target.getForwardPos(direction));
    },

    /**
     * 6
     */

    /**
     * 用于潜行系统，判断玩家是否在侦察范围内
     * 101
     */
    detectionRange: function(detail) {
        let selfId = detail.selfId;
        let range = detail.range;
        let target = this.game.scene.getActorTarget(selfId);

        return target.stealth.inDetectionRange(selfId, this.game.playerId, range);
    },

    /**
     * 用于潜行系统，判断玩家是否在背后
     * Type 102
     */
    checkBehind: function(detail, self) {
        let actorId = detail.actorId;
        let target = (actorId == '0') ? self : this.game.scene.getActorTarget(actorId);
        return target.stealth.checkBehind();
    },

    conditionInterpreter: function(condition, gameEvent) {
        let detail = condition.detail;
        let result = false;
        switch (condition.conditionType) {
            case ConditionType.CheckItem:
                result = this.checkItem(detail);
                break;
            case ConditionType.Random:
                result = this.random(detail);
                break;
            case ConditionType.Variable:
                result = this.variable(detail);
                break;
            case ConditionType.CheckDistance:
                result = this.checkDistance(detail, gameEvent.event.target);
                break;
            case ConditionType.ForwardPassable:
                result = this.checkForwardPassable(detail);
                break;
            case ConditionType.DetectionRange:
                result = this.detectionRange(detail);
                break;
            case ConditionType.CheckBehind:
                result = this.checkBehind(detail, gameEvent.event.target);
                break;
        }
        return result;
    },

    compare: function(a, b, operator) {
        switch (operator) {
            case 0:
                //=
                if (a == b) return true
                break;
            case 1:
                //>
                if (a > b) return true
                break;
            case 2:
                //<
                if (a < b) return true
                break;
            case 3:
                //>=
                if (a >= b) return true
                break;
            case 4:
                //<=
                if (a <= b) return true
                break;
            default:
                return false;
        }
        return false;
    }
});