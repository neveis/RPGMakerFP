cc.Class({
    extends: cc.Component,

    properties: {},

    /**
     * 用于动画结束后的回调
     */
    callFunc: function(func) {
        func();
    },

    //动画中需要调用的事件
    mechanicalBird: function() {
        var gameNode = cc.find("Game");
        var actorManager = gameNode.getComponent("ActorManager");
        var idList = [1, 12, 13, 14, 15, 22];
        var target;
        for (var i = 0; i < idList.length; i++) {
            target = actorManager.getTarget(idList[i]);
            if (target == null) continue;
            target.showBalloon("surprise", false, false);
        }
    },

    birdAttackedEffect: function() {
        var myParticle = cc.find("MechanicalBird/Bird/BirdAttackedEffect", this.node).getComponent(cc.ParticleSystem);
        myParticle.resetSystem(); // restart particle system
    }
});