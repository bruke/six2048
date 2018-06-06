"use strict";
cc._RF.push(module, '2da59+FgkRFGqzGIbcv57tI', 'TipCp');
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