

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

        cc.director.loadScene("gameScene");
        this.node.destroy();

        cc.audioEngine.playEffect(this.btnSound)
    },

});

