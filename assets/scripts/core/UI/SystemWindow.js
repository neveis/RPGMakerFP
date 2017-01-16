var emptyFunc = function(event) {
    event.stopPropagation();
};

cc.Class({
    extends: cc.Component,

    properties: {
        BGMNode: cc.Node,
        SENode: cc.Node,
        _poolMng: null
    },

    // use this for initialization
    onLoad: function() {
        this.gameNode = this.gameNode || cc.find('Game');
        this.game = this.gameNode.getComponent("Game");
        this.audioManager = this.gameNode.getComponent("AudioManager");
        this.BGMSliderBar = this.BGMNode.getComponent("SliderBar");
        this.SESliderBar = this.SENode.getComponent("SliderBar");
        this.BGMSliderBar.addListener(this.node);
        this.SESliderBar.addListener(this.node);

        this.node.on("c_bgm_slider", function(event) {
            this.audioManager.setMusicVolume(event.detail.ratio);
        }, this);
        this.node.on("c_se_slider", function(event) {
            this.audioManager.setEffectVolume(event.detail.ratio);
        }, this)
    },

    start: function() {
        this.BGMSliderBar.slider.setPos(this.audioManager.getMusicVolume());
        this.SESliderBar.slider.setPos(this.audioManager.getEffectVolume());
    },

    onEnable: function() {
        this.node.on('touchstart', emptyFunc, this);
    },

    close: function() {
        this._poolMng.put(this.node);
    },

    onDisable: function() {
        this.node.off('touchstart', emptyFunc, this);
    },

});