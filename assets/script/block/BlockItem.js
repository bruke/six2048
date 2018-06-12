

const Util = require('Util');

cc.Class({
    extends: cc.Component,

    properties: {
        imgframe2: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe4: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe8: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe16: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe32: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe64: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe128: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe256: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe512: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe1024: {
            default: null,
            type: cc.SpriteFrame,
        },
        imgframe2048: {
            default: null,
            type: cc.SpriteFrame,
        },

        blockImg: {
            default: null,
            type: cc.Sprite,
        },

        scoreNum : {
            get () {
                return this._scoreNum;
            },
            set (value) {
                if (!isNaN(value) && value !== this._scoreNum) {
                    this._scoreNum = value;
                    this.updateBlock();
                }
            }
        },

        _scoreNum: -1,  // 块上数字
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._scoreDict = [2, 4, 8, 16, 32, 64, 128, 512/*, 1024, 2048*/];

        this.initScoreNum();
    },

    start () {
    },

    // update (dt) {},

    initScoreNum () {
        let index = Util.random(0, this._scoreDict.length - 1);
        this._scoreNum = this._scoreDict[index];

        this.updateBlock();
    },

    updateBlock () {
        let spriteFrame = this['imgframe' + this._scoreNum];
        if (spriteFrame) {
            this.blockImg.spriteFrame = spriteFrame;
        }
    },
});
