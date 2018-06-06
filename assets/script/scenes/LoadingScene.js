

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad () {
        //cc.log("开始加载资源");
        cc.view.enableRetina(false);
        // cc.view.enableAutoFullScreen(true)
        cc.myAssets = {};

        let resList = [
            //"sounds",
            "pics",
            //"views",
            "prefabs",
            "fonts",
            "anims",
        ];

        // 加载目录下所有资源
        var count = 0;
        for (let i = 0; i < resList.length; i++) {
            let dirName = resList[i];
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
            }.bind(this, i))
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update (dt) {

    // },
});
