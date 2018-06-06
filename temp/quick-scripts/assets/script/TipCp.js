(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/TipCp.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '2da59+FgkRFGqzGIbcv57tI', 'TipCp', __filename);
// script/TipCp.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    // use this for initialization
    onLoad: function onLoad() {
        this.node.x = 0;
        this.node.y = 0;
        this.node.runAction(cc.sequence(cc.spawn(cc.fadeOut(1), cc.moveBy(1, cc.p(0, 100))), cc.removeSelf(true)));
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
        //# sourceMappingURL=TipCp.js.map
        