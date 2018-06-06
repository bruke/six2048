(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/BgRandomMove.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '2efffJ1hlRMy6NEHp7IMcJi', 'BgRandomMove', __filename);
// script/BgRandomMove.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        totalX: 1,
        totalY: 1,
        speed: 20,
        offset: 10
    },

    //随机移动
    randomMove: function randomMove() {
        var dt = cc.pLength(cc.p(this.totalX, this.totalY)) / this.speed;
        var randomDir = cc.pMult(cc.pNormalize(cc.p(cc.randomMinus1To1(), cc.randomMinus1To1())), this.offset);

        var moveDir = cc.pAdd(cc.p(this.totalX, this.totalY), randomDir);

        var action = cc.repeatForever(cc.sequence(cc.moveBy(dt, moveDir), cc.moveBy(dt, cc.pMult(moveDir, -1))));

        this.node.runAction(action);
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.randomMove();
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
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
        //# sourceMappingURL=BgRandomMove.js.map
        