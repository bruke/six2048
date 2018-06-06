

cc.Class({
    extends: cc.Component,

    properties: {
        btnSound: {
            default: null,
            url: cc.AudioClip
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
    },

    // update (dt) {},

    onBtnGameStart (evt) {
        let button = evt.target;

        let action = cc.sequence(
            cc.scaleTo(0.2, 0),
            cc.callFunc(function(){
                //cc.log("开始游戏");
                cc.director.loadScene("gameScene");
                this.node.destroy()
            }, this)
        );

        let anim = button.getComponent(cc.Animation);
        anim.stop();
        button.runAction(action);

        cc.audioEngine.playEffect(this.btnSound)
    },

});

