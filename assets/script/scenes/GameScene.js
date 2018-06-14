


const Util = require('Util');

const BasicLineNum = 4;  // 网格基础行格子数量
const MaxGridLines = 7;  // 网格最大行数

/**
 * 网格索引定义
 * @type {*[]}
 */
const GridIndexDef = [
          [0,  1,  2,  3],
        [4,  5,  6,  7,  8],
      [9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
      [22, 23, 24, 25, 26, 27],
        [28, 29, 30, 31, 32],
          [33, 34, 35, 36]
];

let TotalGridsNum = 37;

let theScore = 0;

cc.Class({
    extends: cc.Component,

    properties: {

        clearSound: {
            default: null,
            url: cc.AudioClip,
        },

        blockCompPrefab: {
            default: null,
            type: cc.Prefab,
        },

        losePrefab: {
            default: null,
            type: cc.Prefab,
        },

        boomEffPrefab: {
            default: null,
            type: cc.Prefab,
        },

        tipPrefab: {
            default: null,
            type: cc.Prefab,
        },

        previewNode : {
            default: null,
            type: cc.Node,
        },

        //
        anSound: {
            default: null,
            url: cc.AudioClip,
        },

        fangxiaSound1: {
            default: null,
            url: cc.AudioClip,
        },

        fangxiaSound2: {
            default: null,
            url: cc.AudioClip,
        },

        fangxiaSound3: {
            default: null,
            url: cc.AudioClip,
        },

        canNotSound1: {
            default: null,
            url: cc.AudioClip,
        },

        canNotSound2: {
            default: null,
            url: cc.AudioClip,
        },
    },

    //
    onLoad () {
        this.initEnv();

        //监听成功放下事件
        this.node.on('succDropDownOne', this.checkEliminate, this);

        //初始化历史最高分
        this.initHiScore();
    },

    initEnv () {
        this.maxBlockScore = 2;  // 当前砖块上可出现的最大数字
        this.isDeleting = false; // 判断是否正在消除的依据

        this.previewNode.cascadeOpacity = true;

        this.gridItemList = [];  // 全部网格元素精灵 (方块元素放到对应的网格元素上)

        this.curDragItemList  = [];   // 当前网格中已经放置的方块元素
        this.curDropGridList  = [];   // 当前拖动预览方块放置到网格上对应网格对象
        this.curBlockListInGrid = []; // 当前网格上已有的所有数字块

        this.findContinuesList = [];

        this.eliminateList = []; //要消除的方块列表

        this.curPreviewBlockGroup = null;

        this.isEliminating = false;  // 是否有消除动作正在进行中

        this.initEventHandlers();
    },

    start () {
        this.initGridNodes();
        this.createNextNode();
    },

    initEventHandlers () {
        this.addPreviewTouchEvent();
    },

    addPreviewTouchEvent () {
        //
        this.previewNode.ox = this.previewNode.x;
        this.previewNode.oy = this.previewNode.y;

        let self = this;

        this.previewNode.on(cc.Node.EventType.TOUCH_START, function() {
            //this.previewGridComp.getComponent('BlockComponent').setScale(1);
            cc.audioEngine.playEffect(self.anSound);

        }, this);

        this.previewNode.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
            let delta = event.touch.getDelta();

            this.previewNode.x += delta.x;
            this.previewNode.y += delta.y;

            self.collisionFunc();

            // 变色处理
            if (!self.checkIsCanDrop()) {
                self.changeColorDeal(true);
            } else {
                self.changeColorDeal();
            }
        }, this);

        this.previewNode.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            this.dropDownFunc();

        }, this);

        this.previewNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            //
            this.dropDownFunc();

            //
            let previewBlock = this.previewGridComp.getComponent('BlockComponent');
            previewBlock.rotateOnce();

        }, this)

    },

    initGridNodes () {
        let frameList = [];
        let maxLineNum = 7; // 一行最大数量为7个

        let gridIndex = 0;

        // 一共7行
        for ( let i = 0; i < 7; i++ ) {
            let rowName = 'row' + i;
            let lineItemNum = BasicLineNum + i;  // 每一行的元素个数

            if (lineItemNum > maxLineNum) {
                lineItemNum = maxLineNum - (lineItemNum - maxLineNum);
            }

            for ( let j = 0; j < lineItemNum; j++ ) {
                let itemName = 'slot' + j;
                let node = cc.find('Canvas/gameGrid/' + rowName + '/' + itemName);

                node.gridIndex = gridIndex;
                frameList.push(node);

                gridIndex++;
            }
        }

        this.gridItemList = frameList;
    },

    // 读取历史最高分
    initHiScore () {
        let node = cc.find('Canvas/scoreNode/scoreLabel');
        let label = node.getComponent(cc.Label);

        label.string = cc.sys.localStorage.getItem("score") || 0;
    },

    // 保存历史最高分
    saveHiScore (score) {
        let oldScore = cc.sys.localStorage.getItem("score");

        if (oldScore < score) {
            cc.sys.localStorage.setItem("score", score);
        }
    },

    createNextNode () {
        this.previewNode.removeAllChildren();

        let blockComp = cc.instantiate(this.blockCompPrefab);
        this.curPreviewBlockGroup = blockComp;

        this.previewGridComp = blockComp;
        this.previewNode.addChild(blockComp);
    },

    /**
     * 根据网格索引获取所在行
     * @param gridIndex
     * @returns {number}
     */
    getRowWithIndex (gridIndex) {
        let row = -1;

        if (gridIndex < 0 || gridIndex >= TotalGridsNum) {
            return row;
        }

        for (let i = 0; i < GridIndexDef.length; i++) {
            let rowIndexList = GridIndexDef[i];
            if (rowIndexList.indexOf(gridIndex) !== -1) {
                row = i;
                break;
            }
        }

        return row;
    },

    /**
     * 检查给定索引是否存在于指定行内
     * @param gridIndex
     * @param row
     * @returns {boolean}
     */
    isIndexInRow (gridIndex, row) {
        if (gridIndex < 0 || gridIndex >= TotalGridsNum || row < 0 ||row >= MaxGridLines) {
            return false;
        }

        return (GridIndexDef[row].indexOf(gridIndex) >= 0);
    },

    /**
     * 根据行索引和行内索引计算对应的网格索引
     * @param row
     * @param rowIndex
     * @returns {number}
     */
    getGridIndexWithRowIndex (row, rowIndex) {
        //
        if (row < 0 ||row >= MaxGridLines) {
            return -1;
        }

        let rowIndexList = GridIndexDef[row];
        if (rowIndex < 0 || rowIndex >= rowIndexList.length) {
            return -1;
        }

        //
        let gridIndex = 0;

        for (let i = 0; i < GridIndexDef.length; i++) {
            let rowIndexList = GridIndexDef[i];

            if (row === i) {
                break;
            }

            gridIndex += rowIndexList.length;
        }

        gridIndex += rowIndex;

        return gridIndex;
    },

    /**
     * 获得指定网格位置的所有邻居的格子坐标
     * * 一个网格的所有邻居包括左右各一个、和上下各两个共六个
     * 处于边界的元素邻居不足六个
     * @param gridIndex
     * @returns {Array}
     */
    getAllNeighborsGridIndex (gridIndex) {
        /*
        const GridIndexDef = [
                  [0,  1,  2,  3],
                [4,  5,  6,  7,  8],
              [9, 10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19, 20, 21],
              [22, 23, 24, 25, 26, 27],
                [28, 29, 30, 31, 32],
                  [33, 34, 35, 36]
        ];
        */


        let neighborIndexes = [];

        let row = this.getRowWithIndex(gridIndex); // 获取所在行
        if (row !== -1) {
            let rowIndex = GridIndexDef[row].indexOf(gridIndex); // 获取在行内的位置

            // 左侧
            let leftIndex = gridIndex - 1;
            leftIndex = this.isIndexInRow(leftIndex, row) ? leftIndex : -1;

            // 右侧
            let rightIndex = gridIndex + 1;
            rightIndex = this.isIndexInRow(rightIndex, row) ? rightIndex : -1;

            // 左上
            let leftTopRowIndex = -1;  // 行内索引
            if (row < BasicLineNum) {
                leftTopRowIndex = rowIndex - 1;
            } else {
                leftTopRowIndex = rowIndex;
            }
            // 计算网格索引
            let leftTopIndex = this.getGridIndexWithRowIndex(row - 1, leftTopRowIndex);

            // 右上
            let rightTopRowIndex = -1;  // 行内索引
            if (row < BasicLineNum) {
                rightTopRowIndex = rowIndex;
            } else {
                rightTopRowIndex = rowIndex + 1;
            }

            let rightTopIndex = this.getGridIndexWithRowIndex(row - 1, rightTopRowIndex);

            // 左下
            let leftDownRowIndex = -1;
            if (row < BasicLineNum - 1) {
                leftDownRowIndex = rowIndex;
            } else {
                leftDownRowIndex = rowIndex - 1;
            }

            let leftDownIndex = this.getGridIndexWithRowIndex(row + 1, leftDownRowIndex);

            // 右下
            let rightDownRowIndex = -1;
            if (row < BasicLineNum - 1) {
                rightDownRowIndex = rowIndex + 1;
            } else {
                rightDownRowIndex = rowIndex;
            }

            let rightDownIndex = this.getGridIndexWithRowIndex(row + 1, rightDownRowIndex);

            //
            neighborIndexes = [leftIndex, rightIndex, leftTopIndex, rightTopIndex, leftDownIndex, rightDownIndex];
        }

        // 排序
        neighborIndexes.sort(function (a, b) {
            return a - b;
        });

        // 过滤无效索引
        neighborIndexes = neighborIndexes.filter(function (index) {
            return index >= 0 && index < TotalGridsNum;
        });

        return neighborIndexes;
    },

    /**
     * 获得指定网格位置的所有相邻格子对象
     * 一个网格的所有邻居包括左右各一个、和上下各两个共六个
     * 处于边界的元素邻居不足六个
     * @param gridIndex
     */
    getAllNeighborsWithIndex (gridIndex) {
        let neighborBlocks = [];
        let neighborsGridIndex = this.getAllNeighborsGridIndex(gridIndex);

        for (let i = 0; i < this.gridItemList.length; i++) {
            let gridItem = this.gridItemList[i];
            let tmpGridIndex = gridItem.gridIndex;

            if (neighborsGridIndex.indexOf(tmpGridIndex) >= 0 /*&& gridItem.isHaveBlock*/) {
                //gridItem.runAction(cc.blink(1, 3));  // TEST

                if (gridItem.isHaveBlock) {
                    //gridItem.runAction(cc.blink(1, 3));  // TEST
                    let blockItem = gridItem.getChildByName("BlockItem");
                    neighborBlocks.push(blockItem);
                }
            }
        }

        return neighborBlocks;
    },

    /**
     * 获得与指定位置上连续相邻的网格坐标集合
     * @param blockItem
     */
    getContinuesSameBlockIndex (blockItem) {
        let result = [];

        let blockComp = blockItem.getComponent('BlockItem');
        let gridIndex = blockItem.gridIndex;
        let blockScore = blockComp.scoreNum;

        // 先找到所有的邻居块
        let neighbors = this.getAllNeighborsWithIndex(gridIndex);

        // 过滤保留相同数字的块
        neighbors = neighbors.filter(function (item) {
            let itemComp = item.getComponent('BlockItem');
            return itemComp.scoreNum === blockScore;
        }, this);

        // 过滤已经标记查询的块
        neighbors = neighbors.filter(function (item) {
            //let itemComp = item.getComponent('BlockItem');
            return this.findContinuesList.indexOf(item) === -1;
        }, this);

        //
        this.findContinuesList = this.findContinuesList.concat(neighbors);

        // 继续递归查找
        if (neighbors.length > 0) {
            for (let i = 0; i < neighbors.length; i++) {
                //
                let nextNeighbors = this.getContinuesSameBlockIndex(neighbors[i]);
                if (nextNeighbors.length > 0) {
                    result = result.concat(nextNeighbors);
                }
            }
        }

        //
        return result;
    },

    /**
     * 检查两个块元素是否相等 --- 熟悉相同即为相等
     * @param blockItem0
     * @param blockItem1
     * @returns {boolean}
     */
    isTwoEqualBlocks (blockItem0, blockItem1) {
        // 如果两个块数字相同，就不用互换位置了
        let blockComp = blockItem0.getComponent('BlockItem');
        return blockComp.equalWith(blockItem1);
    },

    /**
     * 消除检测
     */
    checkEliminate (evt) {
        let blockIndexList = [];

        for (let i = 0; i < this.gridItemList.length; i++) {
            if (this.gridItemList[i].isHaveBlock) {
                blockIndexList.push(this.gridItemList[i].gridIndex);
            }
        }

        blockIndexList.sort(function(a, b) {
            return a - b;
        });

        //
        let checkItemList = this.curDragItemList.slice(0);

        // 如果是两个相同数字的块，保留一个就可以了
        // 以为该两个块必定是相邻的, 一定能被遍历到
        if ( checkItemList.length === 2 && this.isTwoEqualBlocks(checkItemList[0], checkItemList[1]) ) {
            checkItemList.splice(0, 1);
        }

        //
        let validResult = false;
        let findResult = [];

        for (let i = 0; i < checkItemList.length; i++) {
            //
            this.findContinuesList.length = 0;  // 必须清空

            let blockItem = checkItemList[i];
            //let result = this.getContinuesSameBlockIndex(blockItem);
            this.getContinuesSameBlockIndex(blockItem);

            /*
            //if (result.length >= 3) {
            // 特别注意：这里要用this.findContinuesList！！！！
            if (this.findContinuesList.length >= 3) {
                this.eliminateList.push(this.findContinuesList.slice(0));  // 一定要复制一份

                blockItem.needUpgrade = true; // 标记升级块
            }
            */

            // 相邻数量大于两个的都先记录下来
            if (this.findContinuesList.length >= 2) {
                findResult.push(this.findContinuesList.slice(0));
            }

            validResult = validResult || this.findContinuesList.length >= 3;
        }

        // 确定升级合并项
        if (validResult) {
            findResult.sort(function (list0, list1) {
                let blockComp0 = list0[0].getComponent('BlockItem');
                let blockComp1 = list1[0].getComponent('BlockItem');

                return blockComp0.scoreNum - blockComp1.scoreNum;
            });

            this.eliminateList = this.eliminateList.concat(findResult);

            // 标记合并升级目标
            findResult.forEach(function (item) {
                let itemComp = item.getComponent('BlockItem');

                for (let j = 0; j < checkItemList.length; j++) {
                    let checkItem = checkItemList[i];
                    //let checkComp = checkItem.getComponent('BlockItem');
                    if (itemComp) {

                    }
                }
            }, this);
        }

    },

    /**
     * 检测是不是输了
     */
    checkIsLose () {
        //如果正在消除中，那就不判断输赢，因为消除后会再判断
        if (this.isDeleting) {
            return;
        }

        let node = this.previewNode;
        if ( this.checkValidPutPosition() ) {
            //cc.log("已经无处安放")
            this.showLoseEffect();
        }
    },

    //检测自身是否已经无处可放
    checkValidPutPosition () {
        let canDropCount = 0;
        let curPreviewBlocks = this.curPreviewBlockGroup;
        let blockComp = curPreviewBlocks.getComponent('BlockComponent');
        let blockList = blockComp.getAllBlocks();

        let triggerLen = 50; // 碰撞距离 - 格子中心点到边界的距离, 把六边形近似为一个圆形

        // 逐个格子尝试一下一下能不能放
        for (let i = 0; i < this.gridItemList.length; i++) {
            let frameNode = this.gridItemList[i];
            //let srcPos = cc.p(frameNode.x, frameNode.y);
            let srcPos = frameNode.parent.convertToWorldSpaceAR(frameNode.position);
            let count = 1;

            if ( !frameNode.isHaveBlock ) {
                // 这里做是否可以放的判断
                for (let j = 1; j < blockList.length; j++) {

                    let childPos = cc.pAdd(srcPos, blockList[j].position);

                    // 碰撞检测
                    for (let k = 0; k < this.gridItemList.length; k++) {
                        let tFrameNode = this.gridItemList[k];
                        let tGridPos = tFrameNode.parent.convertToWorldSpaceAR(tFrameNode.position);
                        let dis = cc.pDistance(tGridPos, childPos);

                        if (dis <= triggerLen && !tFrameNode.isHaveBlock) {
                            count++; // 可以放就要累加计数
                        }
                    }
                }

                // 如果数量相等就说明这个方块在这个格子是可以放下的
                if (count === blockList.length) {
                    //cc.log(frameNode.gridIndex + "的位置可以放", children.length, count)
                    canDropCount++;
                }
            }
        }

        return (canDropCount === 0);
    },

    // 变色处理
    changeColorDeal (isJustClearColor) {
        //
        for (let i = 0; i < this.gridItemList.length; i++) {
            let guangPicNode = this.gridItemList[i].getChildByName("bianSpr");
            //guangPicNode.active = false;
        }

        // 如果参数有值，直接返回，不做下面的
        if (isJustClearColor) {
            return;
        }

        for (let i = 0; i < this.curDropGridList.length; i++) {
            let guangPicNode = this.curDropGridList[i].getChildByName("bianSpr");
            //guangPicNode.active = true;
        }
    },


    //碰撞逻辑
    collisionFunc () {
        //
        this.curDropGridList = [];
        this.curDragItemList = [];

        let curPreviewBlocks = this.curPreviewBlockGroup;
        let blockComp = curPreviewBlocks.getComponent('BlockComponent');
        let blockList = blockComp.getAllBlocks();

        for (let i = 0; i < blockList.length; i++) {
            let block = blockList[i];
            let blockPos = block.parent.convertToWorldSpaceAR(block.position);
            let gridItem = this.checkPosFunc(blockPos);

            if (gridItem) {
                this.curDragItemList.push(block);
                this.curDropGridList.push(gridItem)
            }
        }
    },


    // 一个点和棋盘的所有框检测
    checkPosFunc (worldPos) {
        let triggerLen = 50; // 碰撞距离 - 格子中心点到边界的距离, 把六边形近似为一个圆形
        let gameGrid = cc.find('Canvas/gameGrid');
        let tarGridItem = null;

        for (let i = 0; i < this.gridItemList.length; i++) {
            let gridItem = this.gridItemList[i];
            let gridPos = gridItem.parent.convertToWorldSpaceAR(gridItem.position);
            let distance = cc.pDistance(gridPos, worldPos);

            if (distance <= triggerLen) {
                tarGridItem = gridItem;
                break;
            }
        }
        return tarGridItem;
    },

    //检测是否能够放下
    checkIsCanDrop () {
        // 先判断数量是否一致，不一致说明有一个超出去了
        let curPreviewBlocks = this.curPreviewBlockGroup;
        let blockComp = curPreviewBlocks.getComponent('BlockComponent');
        let blockList = blockComp.getAllBlocks();

        if (this.curDropGridList.length === 0 || this.curDropGridList.length !== blockList.length) {
            return false;
        }

        // 检测放下的格子是否已经有方块
        for (let i = 0; i < this.curDropGridList.length; i++) {
            if (this.curDropGridList[i].isHaveBlock) {
                return false;
            }
        }
        return true;
    },

    // 放下逻辑
    dropDownFunc () {
        //
        if (!this.checkIsCanDrop()) {
            // 放回去
            this.putItemBack();
            cc.audioEngine.playEffect(this.canNotSound1);

            return;
        }

        for (let i = 0; i < this.curDragItemList.length; i++) {
            let blockItem = this.curDragItemList[i];
            let gridItem = this.curDropGridList[i];

            blockItem.x = 0;
            blockItem.y = 0;
            blockItem.parent = gridItem;  // 方块添加到对应到网格上
            blockItem.gridIndex = gridItem.gridIndex;

            gridItem.isHaveBlock = true;
        }

        // 生成下一个
        this.createNextNode();

        this.node.emit('succDropDownOne');

        let ranC = Util.random(1, 3);
        cc.audioEngine.playEffect(this["fangxiaSound" + ranC]);

        // 放回去
        this.putItemBack();

        // 直接用棋盘检测是不是输了
        this.checkIsLose();
    },

    /**
     * 落地特效
     */
    landingEffect () {
    },

    /**
     * 回到原位
     */
    putItemBack () {
        //变色处理
        this.curDropGridList = []; //清空数组
        this.changeColorDeal();

        this.previewNode.x = this.previewNode.ox;
        this.previewNode.y = this.previewNode.oy;
    },

    showLoseEffect () {
        let loseNode = cc.instantiate(this.losePrefab);
        this.node.parent.addChild(loseNode);

        // 保存历史最高分
        this.saveHiScore(theScore);
    },

    /**
     * 加分
     * @param clearCount 消除的总数
     * @param isDropAdd  是否放下的单纯加分
     */
    addScore (clearCount, isDropAdd) {
        let addScoreCount = this.getAddScoreCal(clearCount, isDropAdd);
        let node = cc.find('Canvas/scoreNode/scoreLabel');
        let label = node.getComponent(cc.Label);

        label.string = addScoreCount + Number(label.string);
        theScore = Number(label.string);
    },

    /**
     * 计算加分的公式
     * @param clearCount
     * @param isDropAdd
     * @returns {number}
     */
    getAddScoreCal (clearCount, isDropAdd) {
        let x = clearCount + 1;
        let addScoreCount = isDropAdd ? x : 2 * x * x; // 数量的平方

        return addScoreCount;
    },

    /**
     * 获得两个数组的交集
     * @param ary1
     * @param ary2
     * @returns {Array}
     */
    get2AryIntersect (ary1, ary2) {
        let intersectAry = [];
        for (let i = 0; i < ary1.length; i++) {
            for (let j = 0; j < ary2.length; j++) {
                if (ary2[j] === ary1[i]) {
                    intersectAry.push(ary2[j]);
                }
            }
        }
        return intersectAry;
    },

    /**
     * 获得两个数组是否相交
     * @param ary1
     * @param ary2
     * @returns {boolean}
     */
    check2AryIsEqual: function(ary1, ary2) {
        for (let i = 0; i < ary1.length; i++) {
            if(ary2[i] !== ary1[i]){
                return false;
            }
        }
        return true
    },

    updateElimination () {
        if (this.isEliminating) {
            return;
        }

        if (this.eliminateList.length > 0) {

            this.doEliminationOnce(this.eliminateList.shift());
        }
    },

    doEliminationOnce (blocks) {
        //
        this.isEliminating = true;

        //
        blocks.forEach(function(item) {
            //
            if (!item.needUpgrade) {
                this.gridItemList[item.gridIndex].isHaveBlock = false;
                //item.removeFromParent(true);

                //这个假方块变大并且渐隐掉
                item.runAction(cc.sequence(
                    cc.spawn(cc.scaleTo(0.5, 2), cc.fadeOut(0.5)),
                    cc.removeSelf(true)
                ));

            } else {
                //
                item.needUpgrade = false;

                let itemComp = item.getComponent('BlockItem');
                itemComp.upgrade();

                if (itemComp.isTopScore()) {
                    // 到达2048后爆炸
                    cc.log('itemComp.isTopScore');
                }
            }

            this.isEliminating = false;
        }, this);

        cc.audioEngine.playEffect(this.clearSound);
    },

    update () {
        this.updateElimination();
    }

});

