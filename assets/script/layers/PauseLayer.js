

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
    },

    // update (dt) {},

    onBtnResume (evt) {
        this.node.active = false;
    },

    onBtnRestart (evt) {
        cc.director.loadScene("gameScene");
    },

    onBtnSound (evt) {

    },

    onBtnHelp (evt) {

    },

    onBtnHome (evt) {

    },
});
