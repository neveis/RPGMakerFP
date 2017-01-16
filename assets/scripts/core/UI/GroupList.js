cc.Class({
    extends: cc.Component,

    properties: {
        avatarItemPrefab: cc.Prefab
    },


    onLoad: function() {

    },

    init: function() {
        this.gameNode = cc.find("Game");
        this.game = this.gameNode.getComponent('Game');
        this.cache = this.gameNode.getComponent('Cache');
        this.nodePool = new cc.NodePool();
        this.avatarList = [];
    },

    initList: function() {
        //清除已有角色头像
        for (let i = 0; i < this.avatarList.length; i++) {
            this.nodePool.put(this.avatarList[i].node)
        }
        this.avatarList = [];
        let playerList = this.game.scene.map.playerList;
        for (let i = 0; i < playerList.length; i++) {
            if (playerList[i] == this.game.playerId) continue;
            let node;
            if (this.nodePool.size()) {
                node = this.nodePool.get();
            } else {
                node = cc.instantiate(this.avatarItemPrefab);
            }
            let comp = node.getComponent('AvatarItem');
            comp._handle = this;
            let spriteFrame = this.cache.getAvatar(playerList[i]);
            //如果没有头像，则取右朝向站立图
            if (!spriteFrame) {
                spriteFrame = this.game.scene.getActorTarget(playerList[i]).actorAtlas.getSpriteFrame("08");
            }
            comp.create(playerList[i], spriteFrame);
            this.node.addChild(node);
            this.avatarList.push(comp);
        }

    },

    updateList: function(newId) {
        for (let i = 0; i < this.avatarList.length; i++) {
            if (this.avatarList[i].actorId != this.game.playerId) continue;
            let spriteFrame = this.cache.getAvatar(newId);
            //如果没有头像，则取右朝向站立图
            if (!spriteFrame) {
                spriteFrame = this.game.scene.getActorTarget(newId).actorAtlas.getSpriteFrame("08");
            }
            this.avatarList[i].create(newId, spriteFrame);
            break;
        }
    }
});