/**
 * 分析动作配置数组，返回动作
 * 配置数组[actionType,actionName,arg [,easeAction]]。对于容器动作，可以在arg中嵌套。
 * @param {Array} data
 * {Number} actionType 动作类型:0 容器动作，1 及时动作，2 间隔动作，3 缓动动作
 * {String} actionName cc中对应的动作函数名称
 * {Array} arg 动作所需的参数，按函数参数顺序
 * {Array} easeAction 缓动动作，只能用于间隔动作。
 * return cc.Action
 */
var ActionParse = function(data) {
    var actionType = data[0];
    var actionName = data[1];
    var arg = data[2];
    var easeAction = data[3];
    var action;
    switch (actionType) {
        //容器动作
        case 0:
            //容器动作分为3类
            switch (actionName) {
                //参数为数组
                case 'sequence':
                case 'spawn':
                    var list = [];
                    for (var i = 0; i < arg.length; i++) {
                        list[i] = ActionParse(arg[i]);
                    }
                    action = cc[actionName](list);
                    break;
                    //参数为动作和次数/速率
                case 'repeat':
                case 'speed':
                    action = cc[actionName](ActionParse(arg[0]), arg[1]);
                    break;
                    //参数为动作
                case 'repeatForever':
                    action = cc[actionName](ActionParse(arg[0]));
                    break;
            }
            break;
            //即时动作
        case 1:
            action = cc[actionName](arg[0], arg[1], arg[2], arg[3], arg[4], arg[5]);
            break;
            //间隔动作
        case 2:
            action = cc[actionName](arg[0], arg[1], arg[2], arg[3], arg[4], arg[5]);
            //间隔动作还需要判断是否有缓动
            if (easeAction != null) {
                var easing = ActionParse(easeAction);
                action = action.easing(easing);
            }
            break;
            //缓动动作
        case 3:
            action = cc[actionName](arg[0], arg[1], arg[2], arg[3], arg[4], arg[5]);
            break;
    }

    return action;
};

module.exports = ActionParse;