var Direction = cc.Enum({
    Horizontal: 1,
    Vertical: 2
})

cc.Class({
    extends: cc.Component,

    properties: () => ({
        sliderBar: {
            default: null,
            type: require("SliderBar")
        }
    }),

    // use this for initialization
    onLoad: function() {
        var self = this;
        this.direction = this.sliderBar.direction;
        switch (this.direction) {
            case Direction.Horizontal:
                this.barLength = this.sliderBar.node.width;
                break;
            case Direction.Vertical:
                this.barLength = this.sliderBar.node.height;
                break;
        }
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
            var delta = event.getDelta();
            switch (this.direction) {
                case Direction.Horizontal:
                    var newX = this.node.x + delta.x;
                    if (newX < 0)
                        newX = 0;
                    else if (newX > this.barLength)
                        newX = this.barLength;
                    this.node.x = newX
                    break;
                case Direction.Vertical:
                    var newY = this.node.y + delta.y;
                    if (newY < -this.barLength)
                        newY = -this.barLength;
                    else if (newY > 0)
                        newY = 0;
                    this.node.y = newY;
                    break;
            }
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            event.stopPropagation();
            this.sliderBar.sendRatio(this.getRatio());
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            this.sliderBar.sendRatio(this.getRatio());
        }, this);
    },

    getRatio: function() {
        var ratio;
        switch (this.direction) {
            case Direction.Horizontal:
                ratio = this.node.x / this.barLength;
                break;
            case Direction.Vertical:
                ratio = Math.abs(this.node.y / this.barLength);
                break;
        }
        //cc.log("ratio", ratio)
        return ratio;
    },

    setPos: function(ratio) {
        switch (this.direction) {
            case Direction.Horizontal:
                this.node.x = ratio * this.barLength;
                break;
            case Direction.Vertical:
                this.node.y = -(ratio * this.barLength);
                break;
        }
    },

});