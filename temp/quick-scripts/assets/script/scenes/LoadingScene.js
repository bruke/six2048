(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/scenes/LoadingScene.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1e722mUEcZHqq0Plb9cwFF7', 'LoadingScene', __filename);
// script/scenes/LoadingScene.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    // use this for initialization
    onLoad: function onLoad() {
        var _this = this;

        //cc.log("开始加载资源");
        cc.view.enableRetina(false);
        // cc.view.enableAutoFullScreen(true)
        cc.myAssets = {};

        var resList = [
        //"sounds",
        "pics",
        //"views",
        "prefabs", "fonts", "anims"];

        // 加载目录下所有资源
        var count = 0;

        var _loop = function _loop(i) {
            var dirName = resList[i];
            cc.loader.loadResDir(resList[i], function (i, err, assets) {
                cc.myAssets[resList[i]] = assets;
                count++;

                cc.log("资源加载完成: " + dirName);

                if (count >= resList.length) {
                    //为了前置加载音效，这里直接为这个场景添加所有声音的组件
                    // for (var j = 0; j < soundResList.length; j++) {
                    //     cc.audioEngine.playEffect(cc.url.raw(soundResList[j]), false, 0)
                    // }


                    //开始游戏
                    cc.director.loadScene("startScene");
                }
            }.bind(_this, i));
        };

        for (var i = 0; i < resList.length; i++) {
            _loop(i);
        }
    }
}

// called every frame, uncomment this function to activate update callback
// update (dt) {

// },
);

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
        //# sourceMappingURL=LoadingScene.js.map
        