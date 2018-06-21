

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
        cc.audioEngine.playEffect(this.btnSound)

        cc.director.loadScene("gameScene");
    },

    onBtnLife (evt) {

    },

    onBtnRank (evt) {

    },

    onBtnSound (evt) {

    },

    onBtnMoreGame (evt) {

    }

});

