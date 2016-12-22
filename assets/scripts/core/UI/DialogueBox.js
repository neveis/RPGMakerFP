cc.Class({
    extends: cc.Component,

    properties: {
        nameLabel: {
            default: null,
            type: cc.Label
        },
        dialogue: {
            default: null,
            type: cc.Label
        },
        gameNode: {
            default: null,
            type: cc.Node
        },
        poolMng: null
    },

    // use this for initialization
    onLoad: function() {
        var self = this;
        this.game = cc.find("Game").getComponent("Game");
        this.eventManager = this.gameNode.getComponent("EventManager");
        this.script = [];
        this.nameLabel.string = '';
        this.dialogue.string = '';
        this.busy = false;
        this.index = 0;

        this.node.on(cc.Node.EventType.TOUCH_START, function(event) {
            self.updataDisplay();
        }, this);

        /*    
        this.node.on(cc.Node.EventType.TOUCH_MOVE,function(event) {

        },this);

        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
        }, this);
        */
    },

    // called every frame, uncomment this function to activate update callback
    //update: function (dt) {

    //},

    /**
     * !#zh
     * 显示对话
     * @param {Object} dialogueMsg [{name,script[]},{name,script[]},...] 
     * @param {Object} actorTarget
     * @param {Function} cb
     */
    showMessage: function(dialogueMsg, actorTarget, cb) {
        //this.node.active = true;
        this.busy = true;
        this.game.hideUI(['default'], true, false);
        //被触发的对象
        this.actor = actorTarget;
        if (this.actor != undefined) {
            this.actor.facePlayer();
        }
        this.dialogueMsg = dialogueMsg;
        //dialogueMsg索引,一个元素之可能是一个名字
        this.index1 = 0;
        //script 索引，同一名字所说的话，一个元素为一页
        this.index2 = 0;
        this.nameLabel.string = this.dialogueMsg.actors[this.index1].name;
        this.script = this.dialogueMsg.actors[this.index1].dialogues;
        this.cb = cb;
        this.updataDisplay();
    },

    updataDisplay: function() {
        if (this.index2 < this.script.length) {
            this.dialogue.string = this.script[this.index2++];
        } else {
            this.index1++;
            if (this.index1 < this.dialogueMsg.actors.length) {
                this.index2 = 0;
                this.nameLabel.string = this.dialogueMsg.actors[this.index1].name;
                this.script = this.dialogueMsg.actors[this.index1].dialogues;
                this.dialogue.string = this.script[this.index2++];
            } else {
                this.busy = false;
                this.poolMng.put(this.node)
                this.game.hideUI(['default'], false, false);
                if (this.actor != undefined)
                    this.actor.faceDefault();
                if (this.cb) this.cb.next();
            }
        }
    }
});