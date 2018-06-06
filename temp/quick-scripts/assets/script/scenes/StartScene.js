(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/scenes/StartScene.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '060725kUIpOJIDiuQwxd917', 'StartScene', __filename);
// script/scenes/StartScene.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        btnSound: {
            default: null,
            url: cc.AudioClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function start() {},


    // update (dt) {},

    onBtnGameStart: function onBtnGameStart(evt) {
        var button = evt.target;

        var action = cc.sequence(cc.scaleTo(0.2, 0), cc.callFunc(function () {
            //cc.log("开始游戏");
            cc.director.loadScene("gameScene");
            this.node.destroy();
        }, this));

        var anim = button.getComponent(cc.Animation);
        anim.stop();
        button.runAction(action);

        cc.audioEngine.playEffect(this.btnSound);
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
        //# sourceMappingURL=StartScene.js.map
        