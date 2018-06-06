

cc.Class({
    extends: cc.Component,

    properties: {
        totalX: 1,
        totalY: 1,
        speed: 20,
        offset: 10,
    },

    //随机移动
    randomMove: function() {
        let dt = cc.pLength(cc.p(this.totalX, this.totalY)) / this.speed;
        let randomDir = cc.pMult(cc.pNormalize(cc.p(cc.randomMinus1To1(), cc.randomMinus1To1())), this.offset);

        let moveDir = cc.pAdd(cc.p(this.totalX, this.totalY), randomDir);

        let action = cc.repeatForever(cc.sequence(
            cc.moveBy(dt, moveDir),
            cc.moveBy(dt, cc.pMult(moveDir, -1))
        ));

        this.node.runAction(action);
    },

    // use this for initialization
    onLoad: function() {
        this.randomMove()
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});