const Game = require('Game');
const EventManager = require('EventManager');
const WindowManager = require('WindowManager');
const PlayerData = require('PlayerData');
const AudioManager = require("AudioManager");

const EventType = cc.Enum({
    Dialogue: 1,
    Shop: 2,
    SwitchScene: 3,
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
    Option: 21,
    Delay: 22,
    FadeIn: 23,
    Task: 24,
    AudioMusic: 25,
    AudioEffect: 26
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
        let actorTarget = this.game.scene.getActorTarget(actorId);
    },

    /**
     * Type 10
     */
    showEmotion: function(detail, gameEvent) {
        let actorId = detail.actorid.toString();
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
        let doorPos = detail.doorPos;
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
                this.audioManager.resumeMusic(audioName, gameEvent);
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
            default:
                console.log("no event type")
                gameEvent.next();
                break;
        }
    }

});