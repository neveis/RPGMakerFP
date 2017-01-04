var gameEvent = cc.Class({
    ctor: function() {
        if (arguments[0]) {
            this.handle = arguments[0];
        } else {
            this.handle = cc.find('Game').getComponent('EventHandle');
        }

        this.event = {};
    },
    properties: {
        loop: false,
        repeatCount: 0,
        _repeatCount: 0
    },

    setEventByObj: function(event) {
        this.event = event;
        this.loop = event.loop;
        if (event.repeatCount && event.repeatCount === 'Infinity') {
            this.repeatCount = Infinity;
        } else if (event.repeatCount) {
            this.repeatCount = event.repeatCount - 1;
        } else {
            this.repeatCount = 0;
        }
        this._repeatCount = this.repeatCount;
    },

    setEventByStr: function(eventStr) {
        this.event = JSON.parse(eventStr);
        this.loop = event.loop;
        if (event.repeatCount && event.repeatCount === 'Infinity') {
            this.repeatCount = Infinity;
        } else if (event.repeatCount) {
            this.repeatCount = event.repeatCount - 1;
        } else {
            this.repeatCount = 0;
        }
        this._repeatCount = this.repeatCount;
    },

    start: function() {
        this.init();
        this.next();
    },

    /**
     * 检测开关、条件，生成待运行的子事件序列。
     */
    init: function() {
        this.subEventSeq = [];
        //遍历事件页，优先级从高到底。
        for (let i = this.event.pages.length - 1; i >= 0; i--) {
            let page = this.event.pages[i];
            //检查开关和条件,如果不满足，检查下一页
            if (!this.checkSwitcher(page.switcher)) continue;
            if (!this.checkCondition(page.condition)) continue;
            let subEvents = page.subEvents;
            for (let j = 0; j < subEvents.length; j++) {
                this.subEventSeq.push(subEvents[j]);
            }
            break;
        }
        if (!this.subEventSeq.length) {
            console.log('event sequence is empty')
        }
    },

    /**
     * 逐条运行子事件序列。
     */
    next: function() {
        if (!this.subEventSeq.length) {
            //事件运行完，调用回调函数
            if (this.callback) {
                if (typeof this.callback === 'function') {
                    this.callback();
                } else {
                    this.callback.next();
                }
            }
            if (this.loop) {
                console.log(this._repeatCount);
                if (this._repeatCount) {
                    this._repeatCount--;
                    setTimeout(function() {
                        this.start();
                    }.bind(this), 0);
                } else {
                    this._repeatCount = this.repeatCount;
                }
            }
            return;
        }
        let subEvent = this.subEventSeq.shift();
        this.handle.eventInterpreter(subEvent, this);
    },

    checkSwitcher: function(switcher) {
        if (switcher == null) return true;
        for (let i = 0; i < switcher.length; i++) {
            if (!this.handle.checkSwitcher(switcher[i])) {
                return false;
            }
        }
        return true;
    },

    checkCondition: function(condition) {
        if (condition == null) return true;
        return true;
    },

    startBySubEvent: function(subEvents) {
        //复制
        this.subEventSeq = subEvents.slice();
        this.next();
    },

    setCallback: function(cb) {
        this.callback = cb;
    },
    setTarget: function(target) {
        this.event.target = target;
    },
    /*    
        page: [{
            "condition": [{
                "id": null,
                "num": null,
                "type": null
            }],
            "switcher": [],
            "event": [{
                "id": null,
                "pos": null,
                "self": null,
                "detail": null,
                "type": null
            }]
        }],
    */

})

module.exports = gameEvent;