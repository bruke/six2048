

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

        _scoreNum: 2,  // 块上数字， 默认开始为2
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.updateBlock();
    },

    start () {
    },

    // update (dt) {},

    updateBlock () {
        let texture = this['imgframe' + this._scoreNum];
        if (texture) {
            this.blockImg.texture = texture;
        }
    },
});
