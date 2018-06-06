(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/gameCore/App.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'bc9772ZVeVM2omwSvP+kAar', 'App', __filename);
// script/gameCore/App.js

'use strict';

var app = {
    startGame: function startGame() {}
};

//加载模块(有顺序)
var modPath = ['Util'];

for (var i in modPath) {
    var path = modPath[i];
    require(path);
}

module.exports = app;

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
        //# sourceMappingURL=App.js.map
        