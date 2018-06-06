"use strict";
cc._RF.push(module, '7f7eecsfeNLxL7pMDgXTdAA', 'PreviewGrid');
// script/gameCore/PreviewGrid.js

'use strict';

var GameGrid = require('GameGrid');
var Util = require('Util');
var scaleParam = 0.7;

cc.Class({
    extends: cc.Component,

    properties: {
        gameGrid: {
            default: null,
            type: GameGrid
        },

        Kcount: 3,
        liubianxingH: 0,
        liubianxingA: 0,

        kuaiTex: {
            default: null,
            type: cc.SpriteFrame
        },

        color1: {
            default: null,
            type: cc.SpriteFrame
        },

        color2: {
            default: null,
            type: cc.SpriteFrame
        },

        color3: {
            default: null,
            type: cc.SpriteFrame
        },

        color4: {
            default: null,
            type: cc.SpriteFrame
        },

        anSound: {
            default: null,
            url: cc.AudioClip
        },

        fangxiaSound1: {
            default: null,
            url: cc.AudioClip
        },

        fangxiaSound2: {
            default: null,
            url: cc.AudioClip
        },

        fangxiaSound3: {
            default: null,
            url: cc.AudioClip
        },

        canNotSound1: {
            default: null,
            url: cc.AudioClip
        },

        canNotSound2: {
            default: null,
            url: cc.AudioClip
        }

    },

    initBlockConfig: function initBlockConfig() {
        var a = this["liubianxingA"];
        var h = this["liubianxingH"];

        this._configLists = [
        //单个
        [cc.p(0, 0)],

        //两个
        [cc.p(0, 0), cc.p(h * 2, 0)], // 横摆
        [cc.p(0, 0), cc.p(h, a * 1.5)], // 正斜
        [cc.p(0, 0), cc.p(h, -a * 1.5)]];
    },


    // use this for initialization
    onLoad: function onLoad() {
        //
        this.blockItemList = []; // 当前网格中已经放置的方块元素
        this.gridItemList = []; // 全部网格元素精灵 (方块元素放到对应的网格元素上)

        this.initBlockConfig();

        this.node.cascadeOpacity = true;

        // 添加触摸
        this.addTouchEvent();
    },
    start: function start() {
        this.createNextNode();
    },


    //update (dt) { },

    createNextNode: function createNextNode() {
        this.node.removeAllChildren();

        var oneNode = this.newOneNode();
        this.node.addChild(oneNode);
    },


    /**
     * 创建一个新块
     * @param colorIndex
     * @returns {cc.Node}
     */
    createOneBlock: function createOneBlock(colorIndex) {
        // 创建一个块
        var node = new cc.Node("colorSpr");
        var sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this["color" + colorIndex];

        // 加纹理
        var wenliNode = new cc.Node("wenliSpr");
        var wenliSprite = wenliNode.addComponent(cc.Sprite);
        wenliSprite.spriteFrame = this["kuaiTex"];
        wenliNode.parent = node;

        return node;
    },


    /**
     * 创建新块节点
     * @returns {cc.Node}
     */
    newOneNode: function newOneNode() {
        var kuaiNode = new cc.Node("kuai");
        var config = this._configLists;

        //随机样子
        var randomIndex = Util.random(0, config.length - 1);
        var posList = config[randomIndex];

        randomIndex = Util.random(1, 4);
        var sumX = 0;
        var countX = 0;
        var sumY = 0;
        var countY = 0;

        for (var index = 0; index < posList.length; index++) {
            var pos = posList[index];
            var kuai = this.createOneBlock(randomIndex);
            kuai.x = pos.x;

            sumX += kuai.x;
            countX++;

            kuai.y = pos.y;

            sumY += kuai.y;
            countY++;

            kuaiNode.addChild(kuai);
        }

        kuaiNode.x = -sumX / countX;
        kuaiNode.y = -sumY / countY;

        kuaiNode.setScale(scaleParam);

        return kuaiNode;
    },


    /**
     * 添加触摸事件
     */
    addTouchEvent: function addTouchEvent() {
        var upH = 100;
        var self = this;

        this.node.ox = this.node.x;
        this.node.oy = this.node.y;

        this.node.on(cc.Node.EventType.TOUCH_START, function () {
            this.y += upH;
            this.getChildByName("kuai").setScale(1);
            cc.audioEngine.playEffect(self.anSound);
        }, this.node);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var delta = event.touch.getDelta();
            this.x += delta.x;
            this.y += delta.y;

            self.collisionFunc();

            // 变色处理
            if (!self.checkIsCanDrop()) {
                self.changeColorDeal(true);
            } else {
                self.changeColorDeal();
            }
        }, this.node);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.dropDownFunc();
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.dropDownFunc();
        }, this);
    },


    // 变色处理
    changeColorDeal: function changeColorDeal(isJustClearColor) {
        //
        for (var _i = 0; _i < this.gameGrid.frameList.length; _i++) {
            var guangPicNode = this.gameGrid.frameList[_i].getChildByName("bianSpr");
            guangPicNode.active = false;
        }

        // 如果参数有值，直接返回，不做下面的
        if (isJustClearColor) {
            return;
        }

        for (var _i2 = 0; _i2 < this.gridItemList.length; _i2++) {
            var _guangPicNode = this.gridItemList[_i2].getChildByName("bianSpr");
            _guangPicNode.active = true;
        }
    },


    //碰撞逻辑
    collisionFunc: function collisionFunc() {
        //
        this.gridItemList = []; //清空数组
        this.blockItemList = []; //清空数组

        var children = this.node.children[0].children;

        for (var _i3 = 0; _i3 < children.length; _i3++) {

            var pianyiCPos = cc.pAdd(cc.p(this.node.children[0].x, this.node.children[0].y), cc.p(children[_i3].x, children[_i3].y));
            var childPos = cc.pAdd(this.node.position, pianyiCPos);
            var frame = this.checkPosFunc(childPos);

            if (frame) {
                this.blockItemList.push(children[_i3]);
                this.gridItemList.push(frame);
            }
        }
    },


    // 一个点和棋盘的所有框检测
    checkPosFunc: function checkPosFunc(pos) {
        var len = 27; // 碰撞距离

        for (var _i4 = 0; _i4 < this.gameGrid.frameList.length; _i4++) {
            var frameNode = this.gameGrid.frameList[_i4];
            var dis = cc.pDistance(cc.p(frameNode.x, frameNode.y), pos);

            if (dis <= len) {
                return frameNode;
            }
        }
    },


    //检测自身是否已经无处可放
    checkIsLose: function checkIsLose() {
        var canDropCount = 0;
        var children = this.node.children[0].children;

        // 一个个格子放试一下能不能放
        for (var _i5 = 0; _i5 < this.gameGrid.frameList.length; _i5++) {
            var frameNode = this.gameGrid.frameList[_i5];
            var srcPos = cc.p(frameNode.x, frameNode.y);
            var count = 1;

            if (!frameNode.isHaveBlock) {
                // 这里做是否可以放的判断
                for (var j = 1; j < children.length; j++) {
                    var len = 27; // 碰撞距离
                    var childPos = cc.pAdd(srcPos, cc.p(children[j].x, children[j].y));

                    // 碰撞检测
                    for (var k = 0; k < this.gameGrid.frameList.length; k++) {
                        var tFrameNode = this.gameGrid.frameList[k];
                        var dis = cc.pDistance(cc.p(tFrameNode.x, tFrameNode.y), childPos);

                        if (dis <= len && !tFrameNode.isHaveBlock) {
                            count++; // 可以放就要累加计数
                        }
                    }
                }

                // 如果数量相等就说明这个方块在这个格子是可以放下的
                if (count === children.length) {
                    //cc.log(frameNode.FKIndex + "的位置可以放", children.length, count)
                    canDropCount++;
                }
            }
        }

        return canDropCount === 0;
    },


    //检测是否能够放下
    checkIsCanDrop: function checkIsCanDrop() {
        // 先判断数量是否一致，不一致说明有一个超出去了
        if (this.gridItemList.length === 0 || this.gridItemList.length !== this.node.children[0].children.length) {
            return false;
        }

        // 检测放下的格子是否已经有方块
        for (var _i6 = 0; _i6 < this.gridItemList.length; _i6++) {
            if (this.gridItemList[_i6].isHaveBlock) {
                return false;
            }
        }
        return true;
    },


    //放下逻辑
    dropDownFunc: function dropDownFunc() {
        //
        if (!this.checkIsCanDrop()) {
            // 放回去
            this.putItemBack();
            cc.audioEngine.playEffect(this.canNotSound1);
            return;
        }

        for (var _i7 = 0; _i7 < this.blockItemList.length; _i7++) {
            this.blockItemList[_i7].x = 0;
            this.blockItemList[_i7].y = 0;

            this.blockItemList[_i7].parent = this.gridItemList[_i7]; // 方块添加到对应到网格上
            this.gridItemList[_i7].isHaveBlock = true;

            // 落地特效
            //this.landingEffect();
        }

        // 生成下一个
        this.createNextNode();

        this.gameGrid.curBlockNum = this.blockItemList.length;
        this.gameGrid.node.emit('succDropDownOne');

        var ranC = Util.random(1, 3);
        cc.audioEngine.playEffect(this["fangxiaSound" + ranC]);

        // 放回去
        this.putItemBack();

        //直接用棋盘检测是不是输了
        this.gameGrid.checkIsLose();
    },


    /**
     * 落地特效
     */
    landingEffect: function landingEffect() {
        var picNode = new cc.Node("guangEffNode");
        var spr = picNode.addComponent(cc.Sprite);

        spr.spriteFrame = this.gameGrid["bian"];
        this.gridItemList[i].addChild(picNode, -1);

        var action = cc.repeatForever(cc.sequence(cc.spawn(cc.fadeOut(1), cc.scaleTo(1, 1.2)), cc.removeSelf()));

        picNode.runAction(action);
    },


    /**
     * 回到原位
     */
    putItemBack: function putItemBack() {
        //变色处理
        this.gridItemList = []; //清空数组
        this.changeColorDeal();

        this.node.getChildByName("kuai").setScale(scaleParam);

        this.node.x = this.node.ox;
        this.node.y = this.node.oy;
    }
});

cc._RF.pop();