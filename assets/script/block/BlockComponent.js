


const Util = require('Util');

const scaleParam   = 0.7;

cc.Class({
    extends: cc.Component,

    properties: {
        liubianxingH: 0,
        liubianxingA: 0,

        blockPrefab: {
            default: null,
            type: cc.Prefab,
        },

        blockRoot: {
            default: null,
            type: cc.Node,
        },

        //_angle: 0,
    },

    onLoad () {
        this.newOneNode();
    },

    start () {
    },

    // update (dt) {},

    initBlockConfig () {
        let a = this.liubianxingA;
        let h = this.liubianxingH;

        this._configLists = [
            //单个
            [cc.p(0, 0)],

            //两个
            [cc.p(0, 0), cc.p(h * 2, 0)],    // 横摆
            [cc.p(0, 0), cc.p(h, a * 1.5)],  // 正斜
            [cc.p(0, 0), cc.p(h, -a * 1.5)], // 反斜
        ];
    },

    /**
     * 创建一个新块
     * @param colorIndex
     * @returns {cc.Node}
     */
    createOneBlock (colorIndex) {
        let blockItem = cc.instantiate(this.blockPrefab);
        //blockItem.initWithSth();
        return blockItem;
    },

    /**
     * 创建新块节点
     * @returns {cc.Node}
     */
    newOneNode () {
        if (!this._configLists) {
            this.initBlockConfig();
        }

        //
        let blockRoot = this.blockRoot;
        let config = this._configLists;

        //随机样子
        let randomIndex = Util.random(0, config.length - 1);
        let posList = config[randomIndex];

        randomIndex = Util.random(1, 4);

        let sumX = 0;
        let countX = 0;
        let sumY = 0;
        let countY = 0;

        for (let index = 0; index < posList.length; index++) {
            let pos = posList[index];
            let block = this.createOneBlock(randomIndex);

            block.x = pos.x;
            block.y = pos.y;

            sumX += block.x;
            sumY += block.y;

            countX++;
            countY++;

            blockRoot.addChild(block);
        }

        blockRoot.x = -sumX / countX;
        blockRoot.y = -sumY / countY;

        blockRoot.setScale(scaleParam);

        //this.blockRoot.addChild(blockNode);
    },

    setScale (scale) {
        this.blockRoot.setScale(scale);
    },

    /**
     * 旋转90度
     */
    rotateOnce () {

    }
});
