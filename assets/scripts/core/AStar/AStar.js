var AStarStep = require('AStarStep');
var AStarMoveType = require('AStarMoveType');

cc.Class({
    extends: cc.Component,

    properties: {
        barrierLayerName: 'block',
        moveType: {
            default: AStarMoveType.FOUR_DIRECTION,
            type: AStarMoveType
        }
    },

    editor: {
        requireComponent: cc.TiledMap
    },

    onLoad: function () {
        this._open = [];
        this._closed = [];
    },

    start: function () {
        this._tiledMap = this.node.getComponent("cc.TiledMap");
        this._layerBarrier = this._tiledMap.getLayer(this.barrierLayerName);
        this.layerSize = this._layerBarrier.getLayerSize();
    },

    /**
     * !#zh
     * 返回检测点在列表中的位置,不存在返回-1
     * @returns {Number}
     */
    _indexOfStepArray: function (checkPoint, stepArray) {
        for (let i = 0; i < stepArray.length; ++i) {
            if (checkPoint.equals(stepArray[i].position)) {
                return i;
            }
        }
        return -1;
    },

    /**
     * !#zh
     * 方格数据加入到open list，F从小到大排序
     * @param {Object} nextStep
     */
    _insertToOpen: function (nextStep) {
        let stepF = nextStep.f;
        let length = this._open.length;
        let i = 0;
        for (; i < length; ++i) {
            if (stepF <= this._open[i].f) {
                break;
            }
        }
        // insert to index i
        //open中，F从小往大排
        this._open.splice(i, 0, nextStep);
    },

    /**
     * !#zh
     * 搜索路径
     * @param {Object} start Tile坐标
     * @param {Object} finish Tile坐标
     * @param {Boolean} ignoreBarrier 忽略终点的障碍，用于敌人向玩家寻路使用
     * @returns {Array} paths 从起到到终点的路径
     */
    moveToward: function (start, finish) {
        this._closed = [];
        this._open = [];
        let paths = [];
        //如果目的地为不可行走区域，直接结束

        let tileGid = this._layerBarrier.getTileGIDAt(finish);
        if (tileGid) {
            let tileProperties = this._tiledMap.getPropertiesForGID(tileGid);
            if (tileProperties['isBlock']) {
                return paths;
            }
        }
        // cc.log('find start: ' + start + ' to: ' + finish);
        this._open.push(new AStarStep(start));
        let pathFound = false;
        do {
            // cc.log('==============================================================');
            let currentStep = this._open.shift();
            // cc.log('currentStep: ' + currentStep);

            this._closed.push(currentStep);

            if (currentStep.position.equals(finish)) {
                // cc.log('finish :P');
                pathFound = true;
                let tmpStep = currentStep;
                do {
                    paths.unshift(tmpStep.position);
                    tmpStep = tmpStep.parent;
                } while (tmpStep !== null);

                this._open = [];
                this._closed = [];
                break;
            }

            let borderPositions = this._borderMovablePoints(currentStep.position);

            for (let i = 0; i < borderPositions.length; ++i) {
                let borderPosition = borderPositions[i];
                //cc.log('check: ' + borderPosition);
                // Check if the nextStep isn't already in the closed set
                if (this._indexOfStepArray(borderPosition, this._closed) != -1) {
                    // cc.log('had in closed: ' + borderPosition);
                    // cc.log('remove check position: ' + borderPosition);
                    borderPositions.splice(i, 1);
                    i--;
                    continue;
                }

                let nextStep = new AStarStep(borderPosition);
                let moveCost = this._costToMove(borderPosition, finish)
                let index = this._indexOfStepArray(borderPosition, this._open);

                if (index == -1) {
                    //当前check点不在open中，添加父节点，计算g，h，添加到open中
                    nextStep.parent = currentStep;
                    nextStep.g = currentStep.g + moveCost;
                    let distancePoint = borderPosition.sub(finish);
                    nextStep.h = Math.abs(distancePoint.x) + Math.abs(distancePoint.y);
                    this._insertToOpen(nextStep);
                } else {
                    //检测点在open中
                    //cc.log('had in open: ' + nextStep.toString());
                    nextStep = this._open[index];
                    if (currentStep.g + moveCost < nextStep.g) {
                        //cc.log('re insert into open: ' + nextStep.toString());
                        nextStep.g = currentStep.g + moveCost;
                        nextStep.parent = currentStep;
                        // re insert
                        this._open.splice(index, 1);
                        this._insertToOpen(nextStep);
                    }
                }
            }
        } while (this._open.length > 0);

        cc.log("paths:", paths);
        return paths;
    },

    _costToMove(positionLeft, positionRight) {
        //用于8方向，暂时没用
        //if (this.moveType == AStarMoveType.EIGHT_DIRECTION) {
        /**
         * diagonal length: 1.41 ≈ Math.sqrt(x * x + y * y)
         * line length: 1
         * 
         * cost = length * 10
         * diagonal cost = 14 ≈ 14.1
         * cost line = 10 = 1 * 10
         */
        //    return (positionLeft.x != positionRight.x) && (positionLeft.y != positionRight.y) ? 14 : 10;
        //} else {
        return 1;
        // }
    },

    _borderMovablePoints: function (position) {
        var results = [];
        let hasTop = false;
        let hasBottom = false;
        let hasLeft = false;
        let hasRight = false;
        let tileGid;
        // top
        let top = cc.p(position.x, position.y - 2);
        if (top.y >= 0) {
            tileGid = this._layerBarrier.getTileGIDAt(top);
            if (tileGid === 0) {
                // cc.log('top: ' + top);
                results.push(top);
                hasTop = true;
            }
            else {
                if (!this._tiledMap.getPropertiesForGID(tileGid).isBlock) {
                    // cc.log('top: ' + top);
                    results.push(top);
                    hasTop = true;
                }
            }
        }
        // bottom
        let bottom = cc.p(position.x, position.y + 2);
        if (bottom.y < this.layerSize.height) {
            tileGid = this._layerBarrier.getTileGIDAt(bottom);
            if (tileGid === 0) {
                // cc.log('bottom: ' + bottom);
                results.push(bottom);
                hasBottom = true;
            }
            else {
                if (!this._tiledMap.getPropertiesForGID(tileGid).isBlock) {
                    // cc.log('bottom: ' + bottom);
                    results.push(bottom);
                    hasBottom = true;
                }
            }
        }
        // left
        let left = cc.p(position.x - 2, position.y);
        if (left.x >= 0) {
            tileGid = this._layerBarrier.getTileGIDAt(left);
            if (tileGid === 0) {
                // cc.log('left: ' + left);
                results.push(left);
                hasLeft = true;
            }
            else {
                if (!this._tiledMap.getPropertiesForGID(tileGid).isBlock) {
                    // cc.log('left: ' + left);
                    results.push(left);
                    hasLeft = true;
                }
            }
        }
        // right
        let right = cc.p(position.x + 2, position.y);
        if (right.x < this.layerSize.width) {
            tileGid = this._layerBarrier.getTileGIDAt(right);
            if (tileGid === 0) {
                // cc.log('right: ' + right);
                results.push(right);
                hasRight = true;
            }
            else {
                if (!this._tiledMap.getPropertiesForGID(tileGid).isBlock) {
                    // cc.log('right: ' + right);
                    results.push(right);
                    hasRight = true;
                }
            }
        }
        /* //8方向
        if (this.moveType == AStarMoveType.EIGHT_DIRECTION) {
            // Top Left
            let topLeft = cc.p(position.x - 2, position.y - 2);
            if (hasTop && hasLeft) {
                if (this._layerBarrier.getTileGIDAt(topLeft) === 0) {
                    // cc.log('top left: ' + topLeft);
                    results.push(topLeft);
                }
            }
            // Top Right
            let topRight = cc.p(position.x + 2, position.y - 2);
            if (hasTop && hasRight) {
                if (this._layerBarrier.getTileGIDAt(topRight) === 0) {
                    // cc.log('top right: ' + topRight);
                    results.push(topRight);
                }
            }
            // Bottom Left
            let bottomLeft = cc.p(position.x - 2, position.y + 2);
            if (hasBottom && hasLeft) {
                if (this._layerBarrier.getTileGIDAt(bottomLeft) === 0) {
                    // cc.log('bttom left: ' + bottomLeft);
                    results.push(bottomLeft);
                }
            }
            // Bottom Right
            let bottomRight = cc.p(position.x + 2, position.y + 2);
            if (hasBottom && hasRight) {
                if (this._layerBarrier.getTileGIDAt(bottomRight) === 0) {
                    // cc.log('top right: ' + bottomRight);
                    results.push(bottomRight);
                }
            }
        }*/
        return results;
    }
});
