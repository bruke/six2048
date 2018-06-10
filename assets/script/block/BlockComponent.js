


const Util = require('Util');

const scaleParam   = 0.7;

cc.Class({
    extends: cc.Component,

    properties: {
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
        this.blockList = [];

        this.isRotating = false;

        this.newOneNode();
    },

    onDestory () {
        this.blockList.length = 0;
    },

    start () {
    },

    // update (dt) {},

    initBlockConfig () {
        let a = 80;
        let h = 80;

        this._configLists = [
            //单个
            [cc.p(0, 0)],

            //两个
            [cc.p(0, 0), cc.p(h * 1.8, 0)],    // 横摆
            [cc.p(0, 0), cc.p(h, a * 1.6)],  // 正斜
            [cc.p(0, 0), cc.p(h, -a * 1.6)], // 反斜
        ];
    },

    getAllBlocks () {
        return this.blockList;
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

            this.blockList.push(block);
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
        // 临时写一个直接交换的动作, 后续优化要做成圆周动作
        if (this.isRotating || this.blockList.length < 2) {
            return;
        }

        /**/
        let block0 = this.blockList[0];
        let block1 = this.blockList[1];

        let pos0 = block0.position;
        let pos1 = block1.position;

        let action0 = cc.moveTo(0.5, pos1);
        let action1 = cc.sequence(cc.moveTo(0.5, pos0), cc.callFunc(function () {
            this.isRotating = false;

            // 交换
            this.blockList[0] = block1;
            this.blockList[1] = block0;
        } ,this));

        block0.runAction(action0);
        block1.runAction(action1);


        /*
        let block0 = this.blockList[0];
        let block1 = this.blockList[1];

        let rotate = cc.rotateBy(0.5, -180);
        block0.runAction(rotate);
        block1.runAction(rotate.clone());

        let action = cc.sequence(cc.rotateBy(0.5, 180), cc.callFunc(function () {
            this.isRotating = false;
        }, this));

        this.node.runAction(action);
        */

        this.isRotating = true;
    },

    resetRotate () {
        this.node.setRotation(0);

        this.blockList[0].setRotation(0);
        this.blockList[1].setRotation(0);
    },
});
