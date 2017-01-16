var emptyFunc = function(event) {
    event.stopPropagation();
};

cc.Class({
    extends: cc.Component,

    properties: {
        gameNode: cc.Node,
        newSaveNode: cc.Node,
        saveListContent: cc.Node,
        saveItemPrefab: cc.Prefab,
        infoLabel: cc.Label,
        _poolMng: null
    },

    // use this for initialization
    onLoad: function() {
        this.gameNode = this.gameNode || cc.find('Game');
        this.game = this.gameNode.getComponent("Game");
        this.eventManager = this.gameNode.getComponent("EventManager");
        this.playerData = this.gameNode.getComponent("PlayerData");
        this.audioManager = this.gameNode.getComponent("AudioManager");
        this.preSelect = { target: null, index: null };
        this.currentSelect = { target: null, index: null };
        this.targetList = [];
        this.saveList = [];
        this.infoLabel.string = "";
        //this.createSaveList(this.saveList);
    },

    onEnable: function() {
        this.node.on('touchstart', emptyFunc, this);
        this.showSaveBox();
    },

    showSaveBox: function() {
        //this.node.active = true;
        var saveList = this.readSaveList();
        this.createSaveList(saveList);
        this.saveList = saveList;
    },

    readSaveList: function() {
        /*
        var saveList = [];
        for (var i = 0; i < this.saveList.length; i++) {
            saveList[i] = this.saveList[i];
        }
        return saveList;
        */
        var saveList = cc.sys.localStorage.getItem("SaveList");
        if (saveList == null) {
            cc.log("no save");
            return [];
        }
        return JSON.parse(saveList)
    },

    createSaveList: function(saveList) {
        var saveItem;
        //新的在上面
        for (var i = saveList.length - 1; i >= 0; i--) {
            saveItem = this.createSaveItem(i, saveList[i]);
            this.targetList.unshift(saveItem);
            this.saveListContent.addChild(saveItem.node, -i);
        }
        //新存档选项在最顶上。
        this.newSaveNode.setLocalZOrder(-saveList.length);
    },

    createSaveItem: function(index, info) {
        var saveItemNode;
        var saveItem;
        saveItemNode = cc.instantiate(this.saveItemPrefab);
        saveItem = saveItemNode.getComponent("SaveItem");
        saveItem.saveSystem = this;
        saveItem.index = index;
        saveItem.itemName = "存档 " + ((index + 1 < 10) ? "0" + (index + 1) : index + 1);

        //显示存档信息
        var saveDate = new Date(info);
        var timeLabel = saveDate.getFullYear() + '年' + (saveDate.getMonth() + 1) + '月' + saveDate.getDate() + ' ' + saveDate.getHours() + ":" + saveDate.getMinutes() + ":" + saveDate.getSeconds();
        saveItem.info = timeLabel;
        return saveItem;
    },

    updateSaveList: function(saveList) {
        //添加新的
        for (var i = this.targetList.length; i < saveList.length; i++) {
            var saveItem = this.createSaveItem(i, saveList[i]);
            this.targetList.push(saveItem);
            this.saveListContent.addChild(saveItem.node, -i);
        }
        this.newSaveNode.setLocalZOrder(-saveList.length);
    },

    clearSaveList: function() {
        var listChildren = this.saveListContent.children;
        //新建存档的按钮不能删除
        for (var i = 1; i < listChildren.length; i++) {
            listChildren[i].destroy();
        }
    },

    selectSaveItem: function(target, index, info) {
        this.preSelect = this.currentSelect;
        if (this.preSelect.target != null)
            if (this.preSelect.index != index)
                this.preSelect.target.setNormal();
        this.currentSelect.target = target;
        this.currentSelect.index = index;
        this.infoLabel.string = info;
    },

    newSave: function() {
        if (this.game.currentMapId === "0") return;
        var nowDate = new Date();
        //var time = nowDate.getHours() + ":" + nowDate.getMinutes() + ":" + nowDate.getSeconds() + "." + nowDate.getMilliseconds();
        //time 相当于存档信息。可以为object。
        var time = nowDate.getTime();
        this.saveList.push(time)
        this.updateSaveList(this.saveList);
        var saveData = this.game.saveGame();
        cc.log("Save" + (this.saveList.length - 1));
        cc.sys.localStorage.setItem("Save" + (this.saveList.length - 1), JSON.stringify(saveData));
    },

    quickSave: function() {
        this.game = this.gameNode.getComponent("Game");
        if (this.game.currentMapId === "0") return;
        var nowDate = new Date();
        //var time = nowDate.getHours() + ":" + nowDate.getMinutes() + ":" + nowDate.getSeconds() + "." + nowDate.getMilliseconds();
        var time = nowDate.getTime();
        var saveList = this.readSaveList();
        var saveData = this.game.saveGame();
        saveList.push(time);
        cc.sys.localStorage.setItem("Save" + (saveList.length - 1), JSON.stringify(saveData));
        cc.sys.localStorage.setItem('SaveList', JSON.stringify(saveList));
    },

    loadSave: function() {
        cc.log("Save" + this.currentSelect.index)
        var saveData = cc.sys.localStorage.getItem("Save" + this.currentSelect.index);
        if (saveData == null) {
            cc.log("load save error");
            return;
        }
        this.node.active = false;
        this.loadGame(JSON.parse(saveData));
    },

    close: function() {
        this._poolMng.put(this.node);
    },

    deleteSave: function() {
        if (this.currentSelect.index == null) return;
        cc.sys.localStorage.removeItem("Save" + this.currentSelect.index)
        this.saveList[this.currentSelect.index] = "None";
        this.targetList[this.currentSelect.index].info = "None";
        this.infoLabel.string = "None";
    },

    override: function() {
        //开始界面没有覆盖
        if (this.game.currentMapId === "0") return;
        var saveData = this.game.saveGame();
        cc.sys.localStorage.setItem("Save" + this.currentSelect.index, JSON.stringify(saveData));
        var nowDate = new Date();
        var timeLabel = nowDate.getFullYear() + '年' + (nowDate.getMonth() + 1) + '月' + nowDate.getDate() + ' ' + nowDate.getHours() + ":" + nowDate.getMinutes() + ":" + nowDate.getSeconds();
        this.saveList[this.currentSelect.index] = nowDate.getTime();
        this.targetList[this.currentSelect.index].info = timeLabel;
        this.infoLabel.string = timeLabel;
    },

    loadGame: function(saveData) {
        this.game.loadGame(saveData);
    },

    onDisable: function() {
        this.node.off('touchstart', emptyFunc, this);
        this.preSelect = { target: null, index: null };
        this.currentSelect = { target: null, index: null };
        this.targetList = [];
        this.infoLabel.string = "";
        for (var i = this.saveList.length - 1; i >= 0; i--) {
            if (this.saveList[i] !== "None") {
                break;
            }
            this.saveList.pop();
            cc.sys.localStorage.removeItem("Save" + i)
        }
        //保存存档列表
        cc.sys.localStorage.setItem('SaveList', JSON.stringify(this.saveList));
        this.clearSaveList();
    }

});