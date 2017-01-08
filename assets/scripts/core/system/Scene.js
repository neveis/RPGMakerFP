cc.Class({
    extends: cc.Component,

    properties: {
        mapNode: cc.Node,
        actorNode: cc.Node,
    },

    // use this for initialization
    onLoad: function() {
        this.mapNode = this.mapNode || cc.find('Canvas/Map');
        this.map = this.mapNode.getComponent('Map');
        this.actorNode = this.actorNode || cc.find('Canvas/Map/Actor');
        this.gameNode = cc.find('Game');
        this.game = this.gameNode.getComponent('Game');
        this.eventManager = this.gameNode.getComponent('EventManager');
        this.audioManager = this.gameNode.getComponent('AudioManager');

        //遍历角色并记录
        this.actorList = {};
        this.dynamicActorList = [];
        let actors = this.actorNode.children;
        for (let i = 0; i < actors.length; i++) {
            let target = actors[i].getComponent('Actor');
            if (target)
                this.actorList[target.actorId] = target;
        }
    },

    start: function() {
        let self = this;
        //读取地图事件
        let mapEventFile = 'Scene/' + this.map.mapId + '/MapEvent';
        cc.loader.loadRes(mapEventFile, function(err, mapEvents) {
            if (err) {
                cc.log(mapEventFile + ' read error');
                //return;
            }

            //读取人物事件
            let ActorEventFile = 'Scene/' + self.map.mapId + '/ActorEvent';
            cc.loader.loadRes(ActorEventFile, function(err, actorEvents) {
                if (err) {
                    cc.log(ActorEventFile + ' read error');
                    //return;
                }
                for (let actorId in self.actorList) {
                    let actor = self.actorList[actorId]
                    actor._initActor();
                    if (actorEvents) {
                        actor.initEvent(actorEvents[actorId]);
                    }
                    if (actor.node.active) {
                        actor.registerEvent();
                    }
                    if (actor.dynamic) {
                        self.dynamicActorList.push(actor);
                    }
                }

                //此处为初始化最后的部分
                self.gameNode.emit('scene-init-done', {
                    scene: self
                })
            });

            //注册地图事件
            for (let eventId in mapEvents) {
                self.eventManager.createEvent(eventId, mapEvents[eventId]);
            }

        });

        //读取预加载音频
        /*
        let audioFile = 'Scene/' + this.map.mapId + '/Audio';
        cc.loader.loadRes(audioFile, function(err, audioList) {
            if (err) {
                cc.log(audioFile + ' read error');
                return;
            }
            //self.audioManager.preload(audioList);
        });
        */
    },

    getActorTarget: function(actorId) {
        return null || this.actorList[actorId];
    },
});