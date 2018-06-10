


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

        this.curPreviewBlockGroup = null;

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
     * 获得指定网格位置的所有相邻格子坐标
     * 一个网格的所有邻居包括左右各一个、和上下各两个共六个
     * 处于边界的元素邻居不足六个
     * @param gridIndex
     */
    getAllNeighborsWithIndex (gridIndex) {
        //      [0,  1,  2,  3],
        //     [4,  5,  6,  7,  8],
        //   [9, 10, 11, 12, 13, 14],
        //[15, 16, 17, 18, 19, 20, 21],
        //   [22, 23, 24, 25, 26, 27],
        //      [28, 29, 30, 31, 32],
        //        [33, 34, 35, 36]

        let blockComp = this.previewGridComp.getComponent('BlockComponent');
        let newBlockList = blockComp.getAllBlocks();  // 本次新拖入的新块列表 (1个或2个)
        let gridItemList = this.curDropGridList;         // 所有的网格槽元素

        let neighborBlocks = [];
        let neighborIndexes = [];

        let row = this.getRowWithIndex(gridIndex); // 获取所在行
        if (row !== -1) {
            //let rowIndex = GridIndexDef[row].indexOf(gridIndex); // 获取在行内的位置

            // 左侧
            let leftIndex = gridIndex - 1;
            leftIndex = this.isIndexInRow(leftIndex, row) ? leftIndex : -1;

            // 右侧
            let rightIndex = gridIndex + 1;
            rightIndex = this.isIndexInRow(rightIndex, row) ? rightIndex : -1;

            // 左上
            let leftTopIndex = gridIndex - (BasicLineNum + row);
            if (row >= BasicLineNum) {
                leftTopIndex += Math.abs(row - BasicLineNum);
            }
            leftTopIndex = this.isIndexInRow(leftTopIndex, row - 1) ? leftTopIndex : -1;

            // 右上
            let rightTopIndex = gridIndex - (BasicLineNum - 1 + row);
            if (row >= BasicLineNum) {
                rightTopIndex += Math.abs(row - BasicLineNum);
            }
            rightTopIndex = this.isIndexInRow(rightTopIndex, row - 1) ? rightTopIndex : -1;

            // 左下
            let leftDownIndex = gridIndex + (BasicLineNum + row);
            if (row >= BasicLineNum) {
                leftDownIndex -= Math.abs(row - BasicLineNum);
            }
            leftDownIndex = this.isIndexInRow(leftDownIndex, row + 1) ? leftDownIndex : -1;

            // 右下
            let rightDownIndex = gridIndex + (BasicLineNum + 1 + row);
            if (row >= BasicLineNum) {
                rightDownIndex -= Math.abs(row - BasicLineNum);
            }
            rightDownIndex = this.isIndexInRow(rightDownIndex, row + 1) ? rightDownIndex : -1;

            //
            neighborIndexes = [leftIndex, rightIndex, leftTopIndex, rightTopIndex, leftDownIndex, rightDownIndex];
        }

        // 排序
        neighborIndexes.sort(function (a, b) {
            return a > b;
        });

        // 过滤无效索引
        neighborIndexes = neighborIndexes.filter(function (index) {
            return index >= 0 && index < TotalGridsNum;
        });

        //
        if (neighborIndexes.length > 0) {

        }

        return neighborBlocks;
    },


    /**
     * 获得与指定位置上连续相邻的网格坐标集合
     * @param gridIndex
     * @param blockScore
     */
    getContinuesSameBlockIndex (gridIndex, blockScore) {
        let result = [];

        let neighbors = this.getAllNeighborsWithIndex(gridIndex);

        return result;
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

        let eliminateList = []; //要消除的方块列表

        /*
        for (let i = 0; i < GridIndexDef.length; i++) {
            let oneList = GridIndexDef[i];
            let intersectAry = this.get2AryIntersect(blockIndexList, oneList);

            if (intersectAry.length > 0) {
                let needClear = this.check2AryIsEqual(oneList, intersectAry);
                if (needClear) {
                    eliminateList.push(oneList);
                }
            }
        }
         */

        /**/
        // added by bruke 20180610
        for (let i = 0; i < this.curDragItemList.length; i++) {
            let blockItem = this.curDragItemList[i];
            let blockComp = blockItem.getComponent('BlockItem');
            let gridIndex = blockItem.gridIndex;

            let result = this.getContinuesSameBlockIndex(gridIndex, blockComp.scoreNum);
        }


        // end bruke

        // 消除表现特效
        if (eliminateList.length > 0) {
            this.doEliminate(eliminateList);

            cc.audioEngine.playEffect(this.clearSound);
        }
    },

    doEliminate (eliminateList) {
        let actionAry = [];

        // 消除
        let count = 0;
        for (let i = 0; i < eliminateList.length; i++) {

            let oneList = eliminateList[i];
            for (let j = 0; j < oneList.length; j++) {
                let xIndex = oneList[j];

                // 得分效果
                actionAry.push(cc.callFunc(function(){
                    let xIndex = arguments[1][0];
                    let count = arguments[1][1];
                    let effNode = cc.instantiate(this.boomEffPrefab);

                    this.gridItemList[xIndex].addChild(effNode);

                    // 加分飘字
                    let tipNode = cc.instantiate(this.tipPrefab);
                    let label = tipNode.getComponent(cc.Label);

                    label.string = "+" + this.getAddScoreCal(count);
                    this.gridItemList[xIndex].addChild(tipNode);
                }, this, [xIndex, count]));

                // 放大、渐隐消除效果
                actionAry.push(cc.callFunc(function() {
                    let xIndex = arguments[1];
                    this.gridItemList[xIndex].isHaveBlock = false;

                    let blockNode = this.gridItemList[xIndex].getChildByName("BlockItem");
                    if (!blockNode) {
                        return; //防止没有这个方块的时候
                    }

                    blockNode.cascadeOpacity = true;

                    //这个假方块变大并且渐隐掉
                    blockNode.runAction(cc.sequence(
                        cc.spawn(cc.scaleTo(0.5, 2), cc.fadeOut(0.5)),
                        cc.removeSelf(true)
                    ))

                }, this, xIndex));

                actionAry.push(cc.delayTime(0.1));
                count++;
            }
        }

        if (actionAry.length > 0) {
            actionAry.push(cc.callFunc(function() {
                this.isDeleting = false;
                this.checkIsLose();
            }, this));

            this.isDeleting = true;
            let action = cc.sequence(actionAry);
            this.node.runAction(action);

            // 加分
            this.addScore(count);
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

});

