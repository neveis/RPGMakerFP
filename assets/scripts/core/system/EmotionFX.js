var EmotionName = ["surprised", "doubt", "joyful", "like", "angry", "ashamed", "tangle", "silent", "inspired", "sleep"];

cc.Class({
    extends: cc.Component,
    properties: {},

    createAnimationClip: function() {
        var gameNode = cc.find("Game");
        var cache = gameNode.getComponent('Cache');
        var emotionAtlas = cache.getEmotionAtlas();
        if (!emotionAtlas) return;

        var animation = this.node.getComponent(cc.Animation);
        var frame;
        //十种表情
        for (var i = 0; i < 10; i++) {
            frame = [];
            //8张图组成
            for (var j = 0; j < 8; j++) {
                var index = i * 8 + j + 1;
                if (index < 10) {
                    var spriteTag = "Emotion_0" + index;
                } else {
                    var spriteTag = "Emotion_" + index;
                }
                frame.push(emotionAtlas.getSpriteFrame(spriteTag));
            }
            var clip = cc.AnimationClip.createWithSpriteFrames(frame, 6);
            clip.events = [{ frame: clip.duration, func: 'onAnimationCompleted', params: [] }];
            animation.addClip(clip, EmotionName[i]);
        }
    },
    onAnimationCompleted: function() {
        this.node.active = false;
    }

});