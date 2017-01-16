var Direction = cc.Enum({
    Horizontal: 1,
    Vertical: 2
})

cc.Class({
    extends: cc.Component,

    properties: () => ({
        handle: null,
        eventTag: "c_slider",
        direction: {
            default: Direction.Horizontal,
            type: Direction
        },
        slider: {
            default: null,
            type: require("Slider")
        },
    }),

    // use this for initialization
    onLoad: function() {
        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            var newPos = this.node.convertToNodeSpaceAR(event.getLocation());
            cc.log(this.node.convertToNodeSpaceAR(event.getLocation()));
            switch (this.direction) {
                case Direction.Horizontal:
                    this.slider.node.x = newPos.x
                    break;
                case Direction.Vertical:
                    this.slider.node.y = newPos.y
                    break;
            }
            this.sendRatio(this.slider.getRatio());
        }, this);
    },

    sendRatio: function(ratio) {
        if (this.handle == null) return;

        this.handle.emit(this.eventTag, {
            ratio: ratio
        });
    },

    addListener: function(handle) {
        this.handle = handle;
    },

    removeListener: function() {
        this.handle = null;
    }

});