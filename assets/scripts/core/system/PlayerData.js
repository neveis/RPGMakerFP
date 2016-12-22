var PlayerAttribute = cc.Class({
    //ctor: function () {
    //},
    properties: {
        Lv: 1,
        Exp: 0,
        HP: 0,
        MP: 0,
        MaxHP: 0,
        MaxMP: 0,
        ATK: 0,
        DEF: 0,
        SPI: 0,
        AGI: 0,
        equipment: []
    },

    init: function() {
        this.Lv = 1;
        this.Exp = 0;
        this.HP = 200;
        this.MP = 100;
        this.MaxHP = 200;
        this.MaxMP = 100;
        this.ATK = 20;
        this.DEF = 10;
        this.SPI = 5;
        this.AGI = 5
        this.equipment = [];
    },

    setAttributes: function(attributes) {
        this.Lv = attributes.Lv;
        this.Exp = attributes.Exp;
        this.HP = attributes.HP;
        this.MP = attributes.MP;
        this.MaxHP = attributes.MaxHP;
        this.MaxMP = attributes.MaxMP;
        this.ATK = attributes.ATK;
        this.DEF = attributes.DEF;
        this.SPI = attributes.SPI;
        this.AGI = attributes.AGI;
    },

    getAttributes: function(sum) {
        if (sum) {
            var attributes = {
                Lv: this.Lv,
                Exp: this.Exp,
                HP: this.HP,
                MP: this.MP,
                MaxHP: this.MaxHP,
                MaxMP: this.MaxMP,
                ATK: this.getATK(),
                DEF: this.getDEF(),
                SPI: this.getSPI(),
                AGI: this.getAGI()
            }
        } else {
            var attributes = {
                Lv: this.Lv,
                Exp: this.Exp,
                HP: this.HP,
                MP: this.MP,
                MaxHP: this.MaxHP,
                MaxMP: this.MaxMP,
                ATK: this.ATK,
                DEF: this.DEF,
                SPI: this.SPI,
                AGI: this.AGI
            }
        }

        return attributes;
    },

    getExp: function(point) {
        this.Exp += point;
        if (this.Exp > this.totalExp[this.Lv + 1]) {
            this.levelUp();
        }
    },

    levelUp: function() {

    },

    /**
     * 负为补血
     */
    loseHP: function(point) {
        this.HP -= point;
        if (this.HP <= 0) {
            this.death();
        }
        if (this.HP > this.MaxHP)
            this.HP = this.MaxHP;
    },

    loseMP: function(point) {
        this.MP -= point;
        if (this.MP <= 0) {
            this.MP = 0;
        }
        if (this.MP > this.MaxMP)
            this.MP = this.MaxMP;
    },

    equip: function(equipment) {
        this.equipment[equipment.type - 1] = equipment;
    },

    getEquipment: function(type) {
        if (type == null)
            return this.equipment
        else
            return this.equipment[type - 1]
    },
    removeEquipment: function(type) {
        this.equipment[type - 1] = null;
    },
    getATK: function() {
        var ATK = 0;
        for (var i = 0; i < this.equipment.length; i++) {
            if (this.equipment[i] != null)
                ATK += this.equipment[i].attribute.ATK;
        }
        ATK += this.ATK;
        return ATK;
    },
    getDEF: function() {
        var DEF = 0;
        for (var i = 0; i < this.equipment.length; i++) {
            if (this.equipment[i] != null)
                DEF += this.equipment[i].attribute.DEF;
        }
        DEF += this.DEF;
        return DEF;
    },
    getSPI: function() {
        var SPI = 0;
        for (var i = 0; i < this.equipment.length; i++) {
            if (this.equipment[i] != null)
                SPI += this.equipment[i].attribute.SPI;
        }
        SPI += this.SPI;
        return SPI;
    },
    getAGI: function() {
        var AGI = 0;
        for (var i = 0; i < this.equipment.length; i++) {
            if (this.equipment[i] != null)
                AGI += this.equipment[i].attribute.AGI;
        }
        AGI += this.AGI;
        return AGI;
    }
})

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function() {
        /*
        var elsa = new PlayerAttribute();
        var noah = new PlayerAttribute();
        elsa.init();
        noah.init();
        elsa.equip({
            "id": 100,
            "name": "铁制弯刀",
            "attribute": {
                "ATK": 3,
                "DEF": 0,
                "SPI": 0,
                "AGI": 0
            },
            "price": 80,
            "description": "作为艾尔莎最趁手的武器，非弯刀莫属!",
            "type": 1
        });
        elsa.equip({
            "id": 104,
            "name": "长袍",
            "attribute": {
                "ATK": 0,
                "DEF": 5,
                "SPI": 0,
                "AGI": 0
            },
            "price": 90,
            "description": "到处都可以找到的普通长袍。",
            "type": 3
        });
        this.player = {
            "1": elsa,
            "2": noah
        };
*/
        this.money = 100;
        /*
            item = {
                "1": {
                    id: 1,
                    count: 3
                }
                "3": {
                    id:3,
                    count:1
                }
            }
        */
        this.items = {};

        this.taskList = [];
    },

    getMoney: function() {
        return this.money;
    },
    setMoneyTo: function(money) {
        this.money = money;
    },
    setMoneyBy: function(amount) {
        this.money = this.money + amount;
    },

    getItems: function() {
        return this.items;
    },
    getItemCount: function(itemId) {
        if (itemId.toString() in this.items)
            return this.items[itemId.toString()].count;
        else
            return 0;
    },
    addItem: function(itemId, num) {
        if (itemId.toString() in this.items)
            this.items[itemId.toString()].count += num;
        else
            this.items[itemId.toString()] = {
                "id": itemId,
                "count": num
            }
    },
    removeItem: function(itemId, num) {
        var itemIdS = itemId.toString();
        if (itemIdS in this.items) {
            if (this.items[itemIdS].count > num)
                this.items[itemId.toString()].count -= num;
            else if (this.items[itemIdS].count == num)
                delete this.items[itemIdS];
            else
                cc.log("item count less than num");
        } else
            cc.log("does not have this item");
    },
    checkItem: function(itemId) {
        if (itemId.toString() in this.items)
            return this.items[itemId.toString()].count;
        else
            return 0;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});