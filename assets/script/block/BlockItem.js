

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
        this._scoreDict = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

        // 生成块最大到512
        this._maxInitIndex = this._scoreDict.indexOf(512);

        this.initScoreNum();
    },

    start () {
    },

    // update (dt) {},

    isTopScore () {
        return this._scoreNum === 2048;
    },

    initScoreNum () {
        let index = Util.random(0, this._maxInitIndex);
        //this._scoreNum = this._scoreDict[index];

        this._scoreNum = 2; // TEST

        this.updateBlock();
    },

    equalWith (otherBlock) {
        let blockComp = otherBlock.getComponent('BlockItem');
        return this._scoreNum === blockComp.scoreNum;
    },

    updateBlock () {
        let spriteFrame = this['imgframe' + this._scoreNum];
        if (spriteFrame) {
            this.blockImg.spriteFrame = spriteFrame;
        }
    },

    upgrade () {
        if (this.isTopScore()) {
            return false;
        }

        let index = this._scoreDict.indexOf(this._scoreNum);

        this.scoreNum = this._scoreDict[index + 1];

        return true;
    }
});
