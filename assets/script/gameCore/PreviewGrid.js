


const GameGrid = require('GameGrid');
const Util = require('Util');
const scaleParam = 0.7;


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
            type: cc.SpriteFrame,
        },

        color1: {
            default: null,
            type: cc.SpriteFrame,
        },

        color2: {
            default: null,
            type: cc.SpriteFrame,
        },

        color3: {
            default: null,
            type: cc.SpriteFrame,
        },

        color4: {
            default: null,
            type: cc.SpriteFrame,
        },

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

    initBlockConfig () {
        let a = this["liubianxingA"];
        let h = this["liubianxingH"];

        this._configLists = [
            //单个
            [cc.p(0, 0)],

            //两个
            [cc.p(0, 0), cc.p(h * 2, 0)],    // 横摆
            [cc.p(0, 0), cc.p(h, a * 1.5)],  // 正斜
            [cc.p(0, 0), cc.p(h, -a * 1.5)], // 反斜
        ];
    },

    // use this for initialization
    onLoad () {
        //
        this.blockItemList = [];  // 当前网格中已经放置的方块元素
        this.gridItemList  = []; // 全部网格元素精灵 (方块元素放到对应的网格元素上)

        this.initBlockConfig();

        this.node.cascadeOpacity = true;

        // 添加触摸
        this.addTouchEvent();
    },

    start () {
        this.createNextNode();
    },

    //update (dt) { },

    createNextNode () {
        this.node.removeAllChildren();

        let oneNode = this.newOneNode();
        this.node.addChild(oneNode);
    },

    /**
     * 创建一个新块
     * @param colorIndex
     * @returns {cc.Node}
     */
    createOneBlock (colorIndex) {
        // 创建一个块
        let node = new cc.Node("colorSpr");
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this["color" + colorIndex];

        // 加纹理
        let wenliNode = new cc.Node("wenliSpr");
        let wenliSprite = wenliNode.addComponent(cc.Sprite);
        wenliSprite.spriteFrame = this["kuaiTex"];
        wenliNode.parent = node;

        return node;
    },

    /**
     * 创建新块节点
     * @returns {cc.Node}
     */
    newOneNode () {
        let kuaiNode = new cc.Node("kuai");
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
            let kuai = this.createOneBlock(randomIndex);
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
    addTouchEvent () {
        let upH = 100;
        let self = this;

        this.node.ox = this.node.x;
        this.node.oy = this.node.y;

        this.node.on(cc.Node.EventType.TOUCH_START, function() {
            this.y += upH;
            this.getChildByName("kuai").setScale(1);
            cc.audioEngine.playEffect(self.anSound);

        }, this.node);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
            let delta = event.touch.getDelta();
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

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
            this.dropDownFunc();

        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, function(event) {
            this.dropDownFunc();

        }, this)

    },

    // 变色处理
    changeColorDeal (isJustClearColor) {
        //
        for (let i = 0; i < this.gameGrid.frameList.length; i++) {
            let guangPicNode = this.gameGrid.frameList[i].getChildByName("bianSpr");
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

        let children = this.node.children[0].children;

        for (let i = 0; i < children.length; i++) {

            let pianyiCPos = cc.pAdd(cc.p(this.node.children[0].x, this.node.children[0].y), cc.p(children[i].x, children[i].y))
            let childPos = cc.pAdd(this.node.position, pianyiCPos);
            let frame = this.checkPosFunc(childPos);

            if (frame) {
                this.blockItemList.push(children[i]);
                this.gridItemList.push(frame)
            }
        }
    },


    // 一个点和棋盘的所有框检测
    checkPosFunc (pos) {
        let len = 27; // 碰撞距离

        for (let i = 0; i < this.gameGrid.frameList.length; i++) {
            let frameNode = this.gameGrid.frameList[i];
            let dis = cc.pDistance(cc.p(frameNode.x, frameNode.y), pos);

            if (dis <= len) {
                return frameNode
            }
        }
    },

    //检测自身是否已经无处可放
    checkIsLose () {
        let canDropCount = 0;
        let children = this.node.children[0].children;

        // 一个个格子放试一下能不能放
        for (let i = 0; i < this.gameGrid.frameList.length; i++) {
            let frameNode = this.gameGrid.frameList[i];
            let srcPos = cc.p(frameNode.x, frameNode.y);
            let count = 1;

            if ( !frameNode.isHaveBlock ) {
                // 这里做是否可以放的判断
                for (let j = 1; j < children.length; j++) {
                    let len = 27; // 碰撞距离
                    let childPos = cc.pAdd(srcPos, cc.p(children[j].x, children[j].y));

                    // 碰撞检测
                    for (let k = 0; k < this.gameGrid.frameList.length; k++) {
                        let tFrameNode = this.gameGrid.frameList[k];
                        let dis = cc.pDistance(cc.p(tFrameNode.x, tFrameNode.y), childPos);

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

        return (canDropCount === 0);
    },

    //检测是否能够放下
    checkIsCanDrop () {
        // 先判断数量是否一致，不一致说明有一个超出去了
        if (this.gridItemList.length === 0 || this.gridItemList.length !== this.node.children[0].children.length) {
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

    //放下逻辑
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

        this.gameGrid.curBlockNum = this.blockItemList.length;
        this.gameGrid.node.emit('succDropDownOne');

        let ranC = Util.random(1, 3);
        cc.audioEngine.playEffect(this["fangxiaSound" + ranC]);

        // 放回去
        this.putItemBack();

        //直接用棋盘检测是不是输了
        this.gameGrid.checkIsLose();
    },

    /**
     * 落地特效
     */
    landingEffect () {
        let picNode = new cc.Node("guangEffNode");
        let spr = picNode.addComponent(cc.Sprite);

        spr.spriteFrame = this.gameGrid["bian"];
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

        this.node.getChildByName("kuai").setScale(scaleParam);

        this.node.x = this.node.ox;
        this.node.y = this.node.oy;
    },

});