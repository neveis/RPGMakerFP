var GameEvent = require("GameEvent");

const EventType = cc.Enum({
    Dialogue: 1,
    Shop: 2,
    SwitchScene: 3,
    ScrollMap: 5,
    MoveActor: 6,
    ShowActor: 7,
    SetDone: 8,
    SetActorPos: 9,
    ShowActorBalloon: 10,
    ShowItemBox: 11,
    AddItem: 12,
    ShowMessage: 13,
    HideUI: 14,
    SetSwitcher: 15,
    MapAnimation: 16,
    DoorAnimation: 17,
    MoveByAStar: 18,
    GetTreasure: 19,
    AudioEffect: 20,
    Option: 21,
    Delay: 22,
    FadeIn: 23,
    Task: 24
});

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function() {
        var self = this;
        this.game = this.node.getComponent('Game');
        //this.dialogue = this.dialogueNode.getComponent("DialogueBox");
        //this.playerData = this.node.getComponent("PlayerData");
        this.eventHandle = this.node.getComponent('EventHandle');
        this.eventSwitcher = [];
        this.eventList = {};
        cc.log('event init');

        this.eventDone = {
            '1': false
        }
    },

    createEvent: function(eventId, event) {
        let gameEvent = new GameEvent();
        if (eventId in this.eventList) return;

        if (typeof event === 'string') {
            gameEvent.setEventByStr(event);
        } else if (typeof event === 'object') {
            gameEvent.setEventByObj(event);
        } else {
            console.log('CreateEvent: error type');
            return;
        }

        this.eventList[eventId] = gameEvent;
    },
    /**
     * !#zh
     * 添加地图事件（除NPC事件）
     * @param {String} mapId 事件根据地图ID分类
     * @return {Array} 地图销毁时需要删除的事件
     */
    initMapEvent: function(mapId) {
        if (mapId in this.eventInfo) {
            //读取该地图的所有事件
            var mapEvent = this.eventInfo[mapId];
            var delList = []
                //遍历该地图下的所有时间，并添加到事件列表
            for (var eventId in mapEvent) {
                this.eventList[eventId] = this.addEventFromObject(mapId, eventId);
                delList.push(eventId);
            }
            return delList;
        } else
            return [];
    },


    /**
     * !#zh
     * 根据地图ID和触发位置生成事件ID
     * @param {String} mapId
     * @param {Object} triggerPos
     * @return {String}
     */
    generateEventId: function(mapId, triggerPos) {
        return mapId.toString() + "-" + triggerPos.x.toString() +
            "-" + triggerPos.y.toString();
    },

    /**
     * !#zh
     * 根据地图ID和触发位置获取事件ID
     * @param {String} mapId
     * @param {Object} triggerPos
     * @return {String}
     */
    getEventId: function(mapId, triggerPos) {
        return this.generateEventId(mapId, triggerPos);
    },

    /**
     * 根据事件ID判断是否有该事件
     */
    checkEventById: function(eventId, triggerType) {
        if (eventId in this.eventList) {
            if (this.eventList[eventId].event.triggerType == triggerType) {
                return true;
            }
        }
        return false;

    },

    eventStart: function(eventId) {
        let event = this.eventList[eventId];
        event.start();
    },

    /**
     * !#zh
     * 检测条件是否符合
     * @param {Object} condition
     * @return {Boolean}
     */
    checkCondition: function(condition) {
        switch (condition.type) {
            case 1:
                if (this.playerData.checkItem(condition.id) >= condition.num)
                    return true;
                else
                    return false;

        }
    },

    /**
     * !#zh
     * 设置事件完成标志，防止多次开始初始事件
     * @param {String} eventId
     * @param {Boolean} done
     * @param {Function} cb
     */
    //setDoneFlag: function (detail, nextEvent)
    setDoneFlag: function(eventId, done, cb) {
        //var eventId = detail.eventId;
        //var done = detail.done;
        this.eventDone[eventId] = done;
        if (cb) cb.next();
    },
    /**
     * !#zh
     * 设置开关
     * @param {Number} switcherId
     * @param {Boolean} flag
     * @param {Function} cb
     */
    setSwitcher: function(switcherId, flag, cb) {
        this.eventSwitcher[switcherId] = flag;
        if (cb) cb.next();
    },
    /**
     * !#zh
     * 移除事件
     * @param {String} eventId
     */
    removeEvent: function(eventId) {
        //var eventId = this.generateEventId(mapId, triggerPos);
        //cc.log(eventId)
        if (eventId in this.eventList)
            delete this.eventList[eventId];
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});