"use strict";
cc._RF.push(module, 'bc9772ZVeVM2omwSvP+kAar', 'App');
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