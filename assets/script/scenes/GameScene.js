


const Util = require('Util');

const BasicLineNum = 4;  // 网格基础行格子数量
const scaleParam   = 1;

let theScore = 0;


/**
 * 网格索引定义
 * @type {*[]}
 */
const disList = [
          [0,  1,  2,  3],
        [4,  5,  6,  7,  8],
      [9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
      [22, 23, 24, 25, 26, 27],
        [28, 29, 30, 31, 32],
          [33, 34, 35, 36]
];


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

        this.blockItemList = [];  // 当前网格中已经放置的方块元素
        this.gridItemList  = [];  // 全部网格元素精灵 (方块元素放到对应的网格元素上)
        this.frameList = [];

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

        this.frameList = frameList;
    },

    createNextNode () {
        this.previewNode.removeAllChildren();

        let blockComp = cc.instantiate(this.blockCompPrefab);
        this.curPreviewBlockGroup = blockComp;

        this.previewGridComp = blockComp;
        this.previewNode.addChild(blockComp);
    },

    /**
     * 获得指定网格位置的所有相邻格子坐标
     * @param gridIndex
     */
    getAllNeighborIndex (gridIndex) {
        //      [0,  1,  2,  3],
        //     [4,  5,  6,  7,  8],
        //   [9, 10, 11, 12, 13, 14],
        //[15, 16, 17, 18, 19, 20, 21],
        //   [22, 23, 24, 25, 26, 27],
        //      [28, 29, 30, 31, 32],
        //        [33, 34, 35, 36]

        let blockComp = this.previewGridComp.getComponent('BlockComponent');
        let blockList = blockComp.getAllBlocks();

        let gridItemList = this.blockItemList;
    },

    /**
     * 获得与指定位置上连续相邻的网格坐标集合
     * @param gridIndex
     * @param blockScore
     */
    getContinuesSameBlockIndex (gridIndex, blockScore) {
        let result = [];

        this.getAllNeighborIndex(gridIndex);

        return result;
    },

    /**
     * 消除检测
     */
    checkEliminate (evt) {
        let blockIndexList = [];

        for (let i = 0; i < this.frameList.length; i++) {
            if (this.frameList[i].isHaveBlock) {
                blockIndexList.push(this.frameList[i].gridIndex);
            }
        }

        blockIndexList.sort(function(a, b) {
            return a - b;
        });

        let eliminateList = []; //要消除的方块列表

        /* */
        for (let i = 0; i < disList.length; i++) {
            let oneList = disList[i];
            let intersectAry = this.get2AryIntersect(blockIndexList, oneList);

            if (intersectAry.length > 0) {
                let needClear = this.check2AryIsEqual(oneList, intersectAry);
                if (needClear) {
                    eliminateList.push(oneList);
                }
            }
        }


        /*
        // added by bruke 20180610
        for (let i = 0; i < this.blockItemList.length; i++) {
            let blockItem = this.blockItemList[i];
            let blockComp = blockItem.getComponent('BlockItem');
            let gridIndex = blockItem.gridIndex;

            let result = this.getContinuesSameBlockIndex(gridIndex, blockComp.scoreNum);
        }
        */

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

                    this.frameList[xIndex].addChild(effNode);

                    // 加分飘字
                    let tipNode = cc.instantiate(this.tipPrefab);
                    let label = tipNode.getComponent(cc.Label);

                    label.string = "+" + this.getAddScoreCal(count);
                    this.frameList[xIndex].addChild(tipNode);
                }, this, [xIndex, count]));

                // 放大、渐隐消除效果
                actionAry.push(cc.callFunc(function() {
                    let xIndex = arguments[1];
                    this.frameList[xIndex].isHaveBlock = false;

                    let blockNode = this.frameList[xIndex].getChildByName("BlockItem");
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

        // 逐个格子尝试一下一下能不能放
        for (let i = 0; i < this.frameList.length; i++) {
            let frameNode = this.frameList[i];
            let srcPos = cc.p(frameNode.x, frameNode.y);
            let count = 1;

            if ( !frameNode.isHaveBlock ) {
                // 这里做是否可以放的判断
                for (let j = 1; j < blockList.length; j++) {
                    let len = 27; // 碰撞距离 - 格子中心点到边界的距离, 把六边形近似为一个圆形
                    let childPos = cc.pAdd(srcPos, cc.p(blockList[j].x, blockList[j].y));

                    // 碰撞检测
                    for (let k = 0; k < this.frameList.length; k++) {
                        let tFrameNode = this.frameList[k];
                        let dis = cc.pDistance(cc.p(tFrameNode.x, tFrameNode.y), childPos);

                        if (dis <= len && !tFrameNode.isHaveBlock) {
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
        for (let i = 0; i < this.frameList.length; i++) {
            let guangPicNode = this.frameList[i].getChildByName("bianSpr");
            //guangPicNode.active = false;
        }

        // 如果参数有值，直接返回，不做下面的
        if (isJustClearColor) {
            return;
        }

        for (let i = 0; i < this.gridItemList.length; i++) {
            let guangPicNode = this.gridItemList[i].getChildByName("bianSpr");
            //guangPicNode.active = true;
        }
    },


    //碰撞逻辑
    collisionFunc () {
        //
        this.gridItemList = [];
        this.blockItemList = [];

        let curPreviewBlocks = this.curPreviewBlockGroup;
        let blockComp = curPreviewBlocks.getComponent('BlockComponent');
        let blockList = blockComp.getAllBlocks();

        for (let i = 0; i < blockList.length; i++) {
            let block = blockList[i];
            let blockPos = block.parent.convertToWorldSpaceAR(block.position);
            let gridItem = this.checkPosFunc(blockPos);

            if (gridItem) {
                this.blockItemList.push(block);
                this.gridItemList.push(gridItem)
            }
        }
    },


    // 一个点和棋盘的所有框检测
    checkPosFunc (worldPos) {
        let triggerLen = 50; // 碰撞距离 - 格子中心点到边界的距离, 把六边形近似为一个圆形
        let gameGrid = cc.find('Canvas/gameGrid');
        let tarGridItem = null;

        for (let i = 0; i < this.frameList.length; i++) {
            let gridItem = this.frameList[i];
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

        if (this.gridItemList.length === 0 || this.gridItemList.length !== blockList.length) {
            return false;
        }

        // 检测放下的格子是否已经有方块
        for (let i = 0; i < this.gridItemList.length; i++) {
            if (this.gridItemList[i].isHaveBlock) {
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

        for (let i = 0; i < this.blockItemList.length; i++) {
            let blockItem = this.blockItemList[i];
            let gridItem = this.gridItemList[i];

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
        this.gridItemList = []; //清空数组
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
        let node = cc.find('Canvas/score/scoreLabel');
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
