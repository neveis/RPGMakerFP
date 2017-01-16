cc.Class({
    extends: cc.Component,

    properties: {
        avatarSprite: cc.Sprite,
        _handle: null
    },


    onLoad: function() {
        this.gameNode = cc.find("Game");
        this.game = this.gameNode.getComponent('Game');

    },

    create: function(actorId, spriteFrame) {
        this.actorId = actorId;
        this.avatarSprite.spriteFrame = spriteFrame;
    },

    switchPlayer: function() {
        let oldId = this.game.playerId;
        this.game.switchPlayer(this.actorId, null);
        this._handle.updateList(oldId);
    }
});