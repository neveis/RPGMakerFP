const MoveState = cc.Enum({
    Stand: 0,
    Up: 8,
    Right: 6,
    Down: 2,
    Left: 4
});
const DirectionState = cc.Enum({
    None: 0,
    Up: 8,
    Right: 6,
    Down: 2,
    Left: 4
});

cc.Class({
    extends: cc.Component,

    properties: {
        controlNode: {
            default: null,
            type: cc.Node
        },
        controlPanel: {
            default: null,
            type: cc.Node
        },
        speed: 300,
        _listener: []
    },

    // use this for initialization
    onLoad: function() {
        //this.listener = [];
        var self = this;
        //cc.game.addPersistRootNode(this.node);
        self.maxRadius = self.controlPanel.getContentSize().height / 2;
        self.originPos = this.controlNode.position;
        self.moveToPos = cc.p(0, 0);
        self.isMoving = false;
        this.controlPanel.on(cc.Node.EventType.TOUCH_START, function(event) {
            var touchLoc = event.touch.getLocation();
            self.isMoving = true;
            self.moveToPos = self.controlNode.parent.convertToNodeSpaceAR(touchLoc);
        }, this);

        this.controlPanel.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
            var touchLoc = event.touch.getLocation();
            self.isMoving = true;
            self.moveToPos = self.controlNode.parent.convertToNodeSpaceAR(touchLoc);
        }, this);

        this.controlPanel.on(cc.Node.EventType.TOUCH_END, function(event) {
            self.isMoving = false;
        }, this);

        this.controlPanel.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            self.isMoving = false;

        }, this);
    },

    // called every frame, uncomment this function to activate update callback
    update: function(dt) {
        if (this.isMoving) {
            this.isTouching = true;
            var oldPos = this.controlNode.position;
            this.actorDirection = cc.pNormalize(cc.pSub(this.moveToPos, this.originPos))
            if (!cc.pFuzzyEqual(oldPos, this.moveToPos, 5)) //防止同一位置抖动，moveDirection计算导致
            {
                var moveDirection = cc.pNormalize(cc.pSub(this.moveToPos, oldPos));
                var newPos = cc.pAdd(oldPos, cc.pMult(moveDirection, this.speed * dt));
                if (cc.pDistance(newPos, this.originPos) > this.maxRadius) //处理边界的情况
                    newPos = cc.pMult(this.actorDirection, this.maxRadius);
                this.controlNode.setPosition(newPos);
            }
            var angle = cc.pToAngle(this.actorDirection)
            var pi = 3.14;
            if (pi / 4 <= angle && angle < 3 * pi / 4) {
                this.actorDirection = DirectionState.Up;
                this.moveState = MoveState.Up;
            } else if (3 * pi / 4 <= angle || angle < (-3) * pi / 4) {
                this.actorDirection = DirectionState.Left;
                this.moveState = MoveState.Left;
            } else if ((-3) * pi / 4 <= angle && angle < pi / (-4)) {
                this.actorDirection = DirectionState.Down;
                this.moveState = MoveState.Down;
            } else {
                this.actorDirection = DirectionState.Right;
                this.moveState = MoveState.Right;
            }
            this.broadcast();
        } else {
            this.controlNode.setPosition(this.originPos);
            this.moveState = MoveState.Stand;
            if (this.isTouching) {
                this.broadcast();
                this.isTouching = false;
            }
        }
    },

    addListener: function(comp) {
        this._listener.push(comp);
    },

    broadcast: function() {
        for (let i = 0; i < this._listener.length; i++) {
            this._listener[i].emit('touch-control', {
                moveDirection: this.actorDirection,
                moveState: this.moveState
            });
        }
    },

    /**
     * 隐藏UI后控制复位。触摸中隐藏UI会导致系统还以为在触摸
     * 再次显示UI时，触摸是处于MOVE状态
     */
    onDisable: function() {
        this.controlNode.setPosition(this.originPos);
        this.moveState = MoveState.Stand;
        this.isMoving = false;
        if (this.isTouching) {
            cc.find('Game').emit('TouchControl', {
                moveDirection: this.actorDirection,
                moveState: this.moveState
            });
            this.isTouching = false;
        }
    }

});