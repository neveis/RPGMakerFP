const RPG = require('Global');
const AudioPath = RPG.AudioPath;

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function() {
        this.audioList = [];
        //默认音量大小
        this.musicVolume = 0.3;
        this.effectVolume = 0.3;
        this.musicList = {};

        var self = this;
        cc.game.on(cc.game.EVENT_HIDE, function() {
            for (var key in self.musicList) {
                cc.audioEngine.pause(self.musicList[key])
            }

        });

        cc.game.on(cc.game.EVENT_SHOW, function() {
            for (var key in self.musicList) {
                cc.audioEngine.resume(self.musicList[key])
            }
        });
    },

    /**
     * 预加载场景中用到的音频，与以加载的进行对比，释放不再使用的音频
     */
    preload: function(audioList) {

        //加载新音频
        for (let i = 0; i < audioList.length; i++) {
            for (let j = 0; j < this.audioList.length; j++) {
                if (audioList[i] === this.audioList[j]) {
                    break;
                }
            }
            //如果未加载，则加载新音频
            if (j === this.audioList.length) {
                cc.audioEngine.preload(audioList[i]);
            }
        }

        //释放不再使用的音频
        for (let i = 0; i < this.audioList.length; i++) {
            for (let j = 0; j < audioList.length; j++) {
                if (this.audioList[i] === audioList[j]) {
                    break;
                }
            }
            if (j === audioList.length) {
                cc.audioEngine.uncache(AudioPath + this.audioList[i]);
            }
        }

        this.audioList = audioList;
    },

    playMusic: function(audioName, loop, cb) {
        let audioId = cc.audioEngine.play(cc.url.raw(AudioPath + audioName), loop, this.musicVolume);
        this.musicList[audioName] = audioId;
        if (this.musicVolume == 0) {
            this.setMusicVolume(0);
        }
        if (cb) cb.next();
    },

    pauseMusic: function(audioName, cb) {
        cc.audioEngine.pause(this.musicList[audioName]);
        if (cb) cb.next();
    },
    resumeMusic: function(audioName, loop, cb) {
        if (audioName in this.musicList) {
            cc.audioEngine.resume(this.musicList[audioName]);
        } else {
            this.playMusic(audioName, loop, null)
        }
        if (cb) cb.next();
    },
    stopMusic: function(audioName, cb) {
        cc.audioEngine.stop(this.musicList[audioName]);
        delete this.musicList[audioName];
        if (cb) cb.next();
    },

    stopAll: function(cb) {
        cc.audioEngine.stopAll();
        this.musicList = {};
        if (cb) cb.next();
    },

    playEffect: function(audioName, cb) {
        cc.audioEngine.play(cc.url.raw(AudioPath + audioName), false, this.effectVolume);
        if (cb) cb.next();
    },

    getMusicVolume: function() {
        return this.musicVolume;
    },

    setMusicVolume: function(volume) {
        this.musicVolume = volume;
        for (let musicName in this.musicList) {
            cc.audioEngine.setVolume(this.musicList[musicName], volume);
        }
    },

    getEffectVolume: function() {
        return this.effectVolume;
    },

    setEffectVolume: function(volume) {
        this.effectVolume = volume;
    }
});