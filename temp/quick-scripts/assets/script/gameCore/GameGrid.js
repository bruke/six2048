(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/gameCore/GameGrid.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '73810un/L9B+7ptubQfLvHy', 'GameGrid', __filename);
// script/gameCore/GameGrid.js

'use strict';

var BasicLineNum = 5; // 网格基础行格子数量

var disList = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23, 24, 25], [26, 27, 28, 29, 30, 31, 32, 33, 34], [35, 36, 37, 38, 39, 40, 41, 42], [43, 44, 45, 46, 47, 48, 49], [50, 51, 52, 53, 54, 55], [56, 57, 58, 59, 60]];

var Util = require('Util');
var theScore = 0;

cc.Class({
    extends: cc.Component,

    properties: {
        liubianxingH: 0,
        liubianxingA: 0,

        framePic: {
            default: null,
            type: cc.SpriteFrame
        },

        bian: {
            default: null,
            type: cc.SpriteFrame
        },

        clearSound: {
            default: null,
            url: cc.AudioClip
        },

        losePrefab: {
            default: null,
            type: cc.Prefab
        },

        boomEffPrefab: {
            default: null,
            type: cc.Prefab
        },

        tipPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    //
    onLoad: function onLoad() {
        this.isDeleting = false; //判断是否正在消除的依据

        //监听成功放下事件
        this.node.on('succDropDownOne', this.checkEliminate, this);

        //初始化历史最高分
        this.initHiScore();
    },
    start: function start() {
        this.initGridOriginPos();
        this.initGridNodes();
    },
    initGridOriginPos: function initGridOriginPos() {
        //位置表
        var srcPos = cc.p(this.node.x, this.node.y);
        var posList = [
        //第一行的位置信息
        {
            count: BasicLineNum,
            srcPos: cc.p(0, 0)
        },

        //第二行的位置信息
        {
            count: BasicLineNum + 1,
            srcPos: cc.p(2 * this["liubianxingH"], 0)
        },

        //第三行的位置信息
        {
            count: BasicLineNum + 2,
            srcPos: cc.p(2 * this["liubianxingH"] * 2, 0)
        },

        //第四行的位置信息
        {
            count: BasicLineNum + 3,
            srcPos: cc.p(2 * this["liubianxingH"] * 3, 0)
        },

        //第五行的位置信息
        {
            count: BasicLineNum + 4,
            srcPos: cc.p(2 * this["liubianxingH"] * 4, 0)
        },

        //第六行的位置信息
        {
            count: BasicLineNum + 3,
            srcPos: cc.p(2 * this["liubianxingH"] * 4 + this["liubianxingH"], -3 * this["liubianxingA"] / 2)
        },

        //第七行的位置信息
        {
            count: BasicLineNum + 2,
            srcPos: cc.p(2 * this["liubianxingH"] * 4 + this["liubianxingH"] * 2, -3 * this["liubianxingA"] * 2 / 2)
        },

        //第八行的位置信息
        {
            count: BasicLineNum + 1,
            srcPos: cc.p(2 * this["liubianxingH"] * 4 + this["liubianxingH"] * 3, -3 * this["liubianxingA"] * 3 / 2)
        },

        //第九行的位置信息
        {
            count: BasicLineNum,
            srcPos: cc.p(2 * this["liubianxingH"] * 4 + this["liubianxingH"] * 4, -3 * this["liubianxingA"] * 4 / 2)
        }];

        this.posList = posList;
    },
    initGridNodes: function initGridNodes() {
        //位置表
        var srcPos = cc.p(this.node.x, this.node.y);
        var posList = this.posList;

        //要加的单位向量
        var addVec = cc.pMult(cc.pForAngle(240 * (2 * Math.PI / 360)), this["liubianxingH"] * 2);

        //偏移至源点0，0的向量
        var pianyiTo0p0Vec = cc.pMult(cc.pForAngle(120 * (2 * Math.PI / 360)), this["liubianxingH"] * 2 * 4);

        var frameList = [];
        var fPosList = [];

        //一列列来生成
        for (var i = 0; i < posList.length; i++) {
            var count = posList[i].count; //数量
            var oneSrcPos = cc.pAdd(posList[i].srcPos, pianyiTo0p0Vec); //起始位置
            var aimPos = cc.pAdd(srcPos, oneSrcPos); //一条的起始位置

            for (var j = 0; j < count; j++) {
                var fPos = cc.pAdd(aimPos, cc.pMult(addVec, j));
                fPosList.push(fPos);
            }
        }

        //初始化
        for (var index = 0; index < fPosList.length; index++) {
            var node = new cc.Node("frame");
            var sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = this["framePic"];

            node.x = fPosList[index].x;
            node.y = fPosList[index].y;

            node.parent = this.node;
            node.FKIndex = index;

            //加边
            var picNode = new cc.Node("bianSpr");
            var spr = picNode.addComponent(cc.Sprite);

            spr.spriteFrame = this["bian"];
            picNode.active = false;
            picNode.parent = node;

            frameList.push(node);
        }

        this.frameList = frameList;
    },


    /**
     * 消除检测
     */
    checkEliminate: function checkEliminate(evt) {
        //放下都加分
        this.addScore(this.curBlockNum, true);

        //加分飘字
        var tipNode = cc.instantiate(this.tipPrefab);
        tipNode.color = cc.color(211, 70, 50, 255);

        var label = tipNode.getComponent(cc.Label);
        label.string = "+" + this.getAddScoreCal(this.curBlockNum, true);
        this.node.addChild(tipNode);

        var haveFKIndexList = [];

        for (var i = 0; i < this.frameList.length; i++) {
            if (this.frameList[i].isHaveBlock) {
                haveFKIndexList.push(this.frameList[i].FKIndex);
            }
        }

        haveFKIndexList.sort(function (a, b) {
            return a - b;
        });

        var eliminateList = []; //要消除的方块列表

        for (var _i = 0; _i < disList.length; _i++) {
            var oneList = disList[_i];
            var intersectAry = this.get2AryIntersect(haveFKIndexList, oneList);

            if (intersectAry.length > 0) {
                var needClear = this.check2AryIsEqual(oneList, intersectAry);
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

    doEliminate: function doEliminate(eliminateList) {
        var actionAry = [];

        //消除
        var count = 0;
        for (var i = 0; i < eliminateList.length; i++) {

            var oneList = eliminateList[i];
            for (var j = 0; j < oneList.length; j++) {
                var xIndex = oneList[j];

                //
                actionAry.push(cc.callFunc(function () {
                    var xIndex = arguments[1][0];
                    var count = arguments[1][1];
                    var effNode = cc.instantiate(this.boomEffPrefab);

                    this.frameList[xIndex].addChild(effNode);

                    //加分飘字
                    var tipNode = cc.instantiate(this.tipPrefab);
                    var label = tipNode.getComponent(cc.Label);

                    label.string = "+" + this.getAddScoreCal(count);
                    this.frameList[xIndex].addChild(tipNode);
                }, this, [xIndex, count]));

                //
                actionAry.push(cc.callFunc(function () {
                    var xIndex = arguments[1];
                    this.frameList[xIndex].isHaveBlock = false;

                    var FKNode = this.frameList[xIndex].getChildByName("colorSpr");
                    if (!FKNode) {
                        return; //防止没有这个方块的时候
                    }

                    FKNode.cascadeOpacity = true;

                    //这个假方块变大并且渐隐掉
                    FKNode.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.5, 2), cc.fadeOut(0.5)), cc.removeSelf(true)));
                }, this, xIndex));

                actionAry.push(cc.delayTime(0.1));
                count++;
            }
        }

        if (actionAry.length > 0) {
            actionAry.push(cc.callFunc(function () {
                this.isDeleting = false;
                this.checkIsLose();
            }, this));

            this.isDeleting = true;
            var action = cc.sequence(actionAry);
            this.node.runAction(action);

            // 加分
            this.addScore(count);
        }
    },


    /**
     * 检测是不是输了
     */
    checkIsLose: function checkIsLose() {
        //如果正在消除中，那就不判断输赢，因为消除后会再判断
        if (this.isDeleting) {
            return;
        }

        var node = cc.find('Canvas/newBlockNode');
        var script = node.getComponent('PreviewGrid');

        node.opacity = 255;

        if (script.checkIsLose()) {
            //cc.log("已经无处安放")
            node.opacity = 125;
            this.showLoseEffect();
        }
    },
    showLoseEffect: function showLoseEffect() {
        var loseNode = cc.instantiate(this.losePrefab);
        this.node.parent.addChild(loseNode);

        // 保存历史最高分
        this.saveHiScore(theScore);
    },


    /**
     * 加分
     * @param clearCount 消除的总数
     * @param isDropAdd  是否放下的单纯加分
     */
    addScore: function addScore(clearCount, isDropAdd) {
        var addScoreCount = this.getAddScoreCal(clearCount, isDropAdd);
        var node = cc.find('Canvas/score/scoreLabel');
        var label = node.getComponent(cc.Label);

        label.string = addScoreCount + Number(label.string);
        theScore = Number(label.string);
    },


    /**
     * 计算加分的公式
     * @param clearCount
     * @param isDropAdd
     * @returns {number}
     */
    getAddScoreCal: function getAddScoreCal(clearCount, isDropAdd) {
        var x = clearCount + 1;
        var addScoreCount = isDropAdd ? x : 2 * x * x; // 数量的平方

        return addScoreCount;
    },


    /**
     * 获得两个数组的交集
     * @param ary1
     * @param ary2
     * @returns {Array}
     */
    get2AryIntersect: function get2AryIntersect(ary1, ary2) {
        var intersectAry = [];
        for (var i = 0; i < ary1.length; i++) {
            for (var j = 0; j < ary2.length; j++) {
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
    check2AryIsEqual: function check2AryIsEqual(ary1, ary2) {
        for (var i = 0; i < ary1.length; i++) {
            if (ary2[i] !== ary1[i]) {
                return false;
            }
        }
        return true;
    },

    // 读取历史最高分
    initHiScore: function initHiScore() {
        var node = cc.find('Canvas/highScore/scoreLabel');
        var label = node.getComponent(cc.Label);

        label.string = cc.sys.localStorage.getItem("score") || 0;
    },


    // 保存历史最高分
    saveHiScore: function saveHiScore(score) {
        var oldScore = cc.sys.localStorage.getItem("score");

        if (oldScore < score) {
            cc.sys.localStorage.setItem("score", score);
        }
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=GameGrid.js.map
        