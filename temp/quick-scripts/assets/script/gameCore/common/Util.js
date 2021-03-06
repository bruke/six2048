(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/script/gameCore/common/Util.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1f57fJXW/5MwpzGE2th5qGE', 'Util', __filename);
// script/gameCore/common/Util.js

"use strict";

/**
 * Created by Administrator on 2016/5/6.
 */

var _p = {

    //遍历对象的属性和方法
    printObj: function printObj(obj) {
        // 用来保存所有的属性名称和值
        var props = "";
        // 开始遍历
        for (var p in obj) {
            // 方法
            if (typeof obj[p] == " function ") {
                props += p + " \n ";
            } else {
                // p 为属性名称，obj[p]为对应属性的值
                props += p + " \n ";
            }
        } // 最后显示所有的属性

        cc.log(props);
    },

    //随机
    random: function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    testCodeStr: '',

    testCode1: function testCode1(str) {
        this.start = new Date().getTime(); //起始时间
        this.testCodeStr = str;
    },

    testCode2: function testCode2(str) {
        this.end = new Date().getTime(); //接受时间
        var timeStr = this.end - this.start + "ms";
        cc.log("此处花时间：" + timeStr + this.testCodeStr);
    }

};

module.exports = _p;

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
        //# sourceMappingURL=Util.js.map
        