var GameEvent = require("GameEvent");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function() {
        var self = this;
        this.game = this.node.getComponent('Game');
        this.eventSwitcher = {};
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
        if (event) event.start();
    },

    eventPause: function(eventId) {
        let event = this.eventList[eventId];
        if (event) event.stop();
    },

    eventResume: function(eventId) {
        let event = this.eventList[eventId];
        if (event) event.resume();
    },

    eventStop: function(eventId) {
        let event = this.eventList[eventId];
        if (event) event.stop();
    },

    eventControl: function(eventId, state, cb) {
        switch (state) {
            case 0:
                //start
                this.eventStart(eventId);
                break;
            case 1:
                //pause
                this.eventStop(eventId);
                break;
            case 2:
                //resume
                this.eventResume(eventId);
                break;
            case 3:
                //stop
                this.eventStop(eventId);
                break;
        }
        if (cb) cb();
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

    clearEvent: function() {
        for (var eventId in this.eventList) {
            this.eventList[eventId].stop();
        }
        this.eventList = {};
    }
});