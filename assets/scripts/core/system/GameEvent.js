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
        _repeatCount: 0,
        _running: false,
        _stop: false,
        _child: null
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
        if (!this._running) {
            this._running = true;
            this.init();
            this.next();
        }
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
        if (this._stop) {
            this._running = false;
            this._stop = false;
            return;
        }
        if (!this.subEventSeq.length) {
            //事件运行完，调用回调函数
            if (this.callback) {
                if (typeof this.callback === 'function') {
                    this.callback();
                } else {
                    //分支事件运行结束
                    this.callback.setChild(null);
                    this.callback.next();
                }
            }
            if (this.loop) {
                if (this._repeatCount) {
                    this._repeatCount--;
                    setTimeout(function() {
                        this._running = false;
                        this.start();
                    }.bind(this), 0);
                } else {
                    this._repeatCount = this.repeatCount;
                    this._running = false;
                }
            } else {
                this._running = false;
            }
            return;
        }
        let subEvent = this.subEventSeq.shift();
        this.preSubEvent = subEvent;
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

    checkCondition: function(conditions) {
        if (conditions == null) return true;
        for (let i = 0; i < conditions.length; i++) {
            if (!this.handle.conditionInterpreter(conditions[i], this)) {
                return false
            }
        }
        return true;
    },

    startBySubEvent: function(subEvents, parentEvent) {
        if (parentEvent) {
            parentEvent.setChild(this);
        }
        this._running = true;
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
    setChild: function(branchEvent) {
        if (branchEvent instanceof gameEvent) {
            this._child = branchEvent;
        }
    },
    unshiftSubEvent: function(subEvent) {
        this.subEventSeq.unshift(subEvent);
    },

    resume: function() {
        this._running = true;
        if (this._child && this._child instanceof gameEvent) {
            this._child.resume();
        } else {
            this.next();
        }
    },

    stop: function() {
        this._running = false;
        if (this._child && (this._child instanceof gameEvent)) {
            this._child.stop();
        } else {
            this._stop = true;
        }
    }

})

module.exports = gameEvent;