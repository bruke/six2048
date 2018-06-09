


const Util = require('Util');

const BasicLineNum = 4;  // 网格基础行格子数量
const scaleParam   = 0.7;

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
        liubianxingH: 0,
        liubianxingA: 0,

        framePic: {
            default: null,
            type: cc.SpriteFrame,
        },

        bian: {
            default: null,
            type: cc.SpriteFrame,
        },

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

        this.initGridOriginPos();
        this.initEventHandlers();
    },

    start () {
        this.initGridNodes();
        this.createNextNode();
    },

    initEventHandlers () {
        this.addPreviewTouchEvent();
    },

    initGridOriginPos () {
        //位置表
        let srcPos = cc.p(this.node.x, this.node.y);
        let posList = [
            //第一行的位置信息
            {
                count: BasicLineNum,
                srcPos: cc.p(0, 0)
            },

            //第二行的位置信息
            {
                count: BasicLineNum + 1,
                srcPos: cc.p(2 * this.liubianxingH, 0)
            },

            //第三行的位置信息
            {
                count: BasicLineNum + 2,
                srcPos: cc.p(2 * this.liubianxingH * 2, 0)
            },

            //第四行的位置信息
            {
                count: BasicLineNum + 3,
                srcPos: cc.p(2 * this.liubianxingH * 3, 0)
            },

            //第五行的位置信息
            {
                count: BasicLineNum + 2,
                srcPos: cc.p(2 * this.liubianxingH * 3.5, (-3 * this.liubianxingA) / 2)
            },

            //第六行的位置信息
            {
                count: BasicLineNum + 1,
                srcPos: cc.p(2 * this.liubianxingH * 3.5 + this.liubianxingH, (-3 * this.liubianxingA * 2) / 2)
            },

            //第七行的位置信息
            {
                count: BasicLineNum,
                srcPos: cc.p(2 * this.liubianxingH * 3.5 + this.liubianxingH * 2, (-3 * this.liubianxingA * 3) / 2)
            },
        ];

        this.posList = posList;
    },

    addPreviewTouchEvent () {
        let upH = 100;
        let self = this;

        this.previewNode.ox = this.previewNode.x;
        this.previewNode.oy = this.previewNode.y;

        this.previewNode.on(cc.Node.EventType.TOUCH_START, function() {
            //this.previewNode.y += upH;
            this.previewGridComp.getComponent('BlockComponent').setScale(1);
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
        //位置表
        let srcPos = cc.p(this.node.x, this.node.y);
        let posList = this.posList;

        //要加的单位向量
        let addVec = cc.pMult(cc.pForAngle(240 * (2 * Math.PI / 360)), this.liubianxingH * 2);

        //偏移至源点0，0的向量
        let pianyiTo0p0Vec = cc.pMult(cc.pForAngle(120 * (2 * Math.PI / 360)), this.liubianxingH * 2 * 4);

        let frameList = [];
        let fPosList  = [];

        //一列列来生成
        for (let i = 0; i < posList.length; i++) {
            let count = posList[i].count; //数量
            let oneSrcPos = cc.pAdd(posList[i].srcPos, pianyiTo0p0Vec); //起始位置
            let aimPos = cc.pAdd(srcPos, oneSrcPos); //一条的起始位置

            for (let j = 0; j < count; j++) {
                let fPos = cc.pAdd(aimPos, cc.pMult(addVec, j));
                fPosList.push(fPos);
            }
        }

        //初始化
        for (let index = 0; index < fPosList.length; index++) {
            let node = new cc.Node("frame");
            let sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = this["framePic"];

            node.x = fPosList[index].x;
            node.y = fPosList[index].y;

            node.parent = this.node;
            node.gridIndex = index;  // 网格索引, 参加文件头部网格索引定义

            //加边
            let picNode = new cc.Node("bianSpr");
            let spr = picNode.addComponent(cc.Sprite);

            spr.spriteFrame = this["bian"];
            picNode.active = false;
            picNode.parent = node;

            frameList.push(node);
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
     * 消除检测
     */
    checkEliminate: function(evt) {
        //放下都加分
        this.addScore(this.curBlockNum, true);

        //加分飘字
        let tipNode = cc.instantiate(this.tipPrefab);
        tipNode.color = cc.color(211, 70, 50, 255);

        let label = tipNode.getComponent(cc.Label);
        label.string = "+" + this.getAddScoreCal(this.curBlockNum, true);
        this.node.addChild(tipNode);

        let haveFKIndexList = [];

        for (let i = 0; i < this.frameList.length; i++) {
            if (this.frameList[i].isHaveBlock) {
                haveFKIndexList.push(this.frameList[i].gridIndex);
            }
        }

        haveFKIndexList.sort(function(a, b) {
            return a - b;
        });

        let eliminateList = []; //要消除的方块列表

        for (let i = 0; i < disList.length; i++) {
            let oneList = disList[i];
            let intersectAry = this.get2AryIntersect(haveFKIndexList, oneList);

            if (intersectAry.length > 0) {
                let needClear = this.check2AryIsEqual(oneList, intersectAry);
                if (needClear) {
                    eliminateList.push(oneList);
                }
            }
        }

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

        node.opacity = 255;

        if ( this.checkValidPutPosition() ) {
            //cc.log("已经无处安放")
            node.opacity = 125;
            this.showLoseEffect();
        }
    },

    //检测自身是否已经无处可放
    checkValidPutPosition () {
        let canDropCount = 0;
        //let children = this.previewNode.children[0].children;

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
            guangPicNode.active = false;
        }

        // 如果参数有值，直接返回，不做下面的
        if (isJustClearColor) {
            return;
        }

        for (let i = 0; i < this.gridItemList.length; i++) {
            let guangPicNode = this.gridItemList[i].getChildByName("bianSpr");
            guangPicNode.active = true;
        }
    },


    //碰撞逻辑
    collisionFunc () {
        //
        this.gridItemList = []; //清空数组
        this.blockItemList = [];    //清空数组

        let curPreviewBlocks = this.curPreviewBlockGroup;
        let blockComp = curPreviewBlocks.getComponent('BlockComponent');
        let blockList = blockComp.getAllBlocks();

        for (let i = 0; i < blockList.length; i++) {
            let block = blockList[i];
            let offsetPos = cc.pAdd(cc.p(curPreviewBlocks.x, curPreviewBlocks.y), cc.p(block.x, block.y));
            let childPos = cc.pAdd(this.previewNode.position, offsetPos);
            let frame = this.checkPosFunc(childPos);

            if (frame) {
                this.blockItemList.push(block);
                this.gridItemList.push(frame)
            }
        }
    },


    // 一个点和棋盘的所有框检测
    checkPosFunc (pos) {
        let len = 27; // 碰撞距离 - 格子中心点到边界的距离, 把六边形近似为一个圆形

        for (let i = 0; i < this.frameList.length; i++) {
            let frameNode = this.frameList[i];
            let dis = cc.pDistance(cc.p(frameNode.x, frameNode.y), pos);

            if (dis <= len) {
                return frameNode;
            }
        }
        return null;
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
            this.blockItemList[i].x = 0;
            this.blockItemList[i].y = 0;

            this.blockItemList[i].parent = this.gridItemList[i];  // 方块添加到对应到网格上
            this.gridItemList[i].isHaveBlock = true;

            // 落地特效
            //this.landingEffect();
        }

        // 生成下一个
        this.createNextNode();

        this.curBlockNum = this.blockItemList.length;
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
        let picNode = new cc.Node("guangEffNode");
        let spr = picNode.addComponent(cc.Sprite);

        spr.spriteFrame = this["bian"];
        this.gridItemList[i].addChild(picNode, -1);

        let action = cc.repeatForever(cc.sequence(
            cc.spawn(cc.fadeOut(1), cc.scaleTo(1, 1.2)),
            cc.removeSelf()
        ));

        picNode.runAction(action);
    },

    /**
     * 回到原位
     */
    putItemBack () {
        //变色处理
        this.gridItemList = []; //清空数组
        this.changeColorDeal();

        this.previewGridComp.getComponent('BlockComponent').setScale(scaleParam);

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
        let node = cc.find('Canvas/highScore/scoreLabel');
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

