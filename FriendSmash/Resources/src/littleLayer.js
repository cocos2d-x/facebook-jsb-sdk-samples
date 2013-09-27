/**
 * Created with JetBrains WebStorm.
 * User: cocos
 * Date: 13-8-22
 * Time: 上午10:18
 * To change this template use File | Settings | File Templates.
 */


var BTN_PLAY = 0;
var BTN_BRAG = 1;
var BTN_CHALLENGE = 2;
var BTN_STORE = 3;

//
var btn_x = 0;
var btn_y = 0;
var btn_w = 300;
var btn_h = 90;
var MenuLayer = cc.Layer.extend({
    //balls:[],
    init:function () {
        this.initData();
    },
    setDisplay:function(visble){
        this.setVisible(visble);
    },
    initData:function(){
        var play = this.getBtn(s_button_play, s_button_play_hot, BTN_PLAY);
        play.setPosition(cc.p(0, btn_h*2));
        var brag = this.getBtn(s_button_brag, s_button_brag_hot, BTN_BRAG);
        brag.setPosition(cc.p(0, btn_h));
        var challenge = this.getBtn(s_button_challenge, s_button_challenge_hot, BTN_CHALLENGE);
        challenge.setPosition(cc.p(0, 0));
        
        var size = play.getContentSize();
        this.menu = cc.Menu.create(play, brag, challenge);
        this.addChild(this.menu);
        this.menu.setPosition(cc.p(size.width/2, size.height/2));
    },
    setMenuTouchEnable:function(enable){
        if(this.menu != null){
            this.menu.setTouchEnabled(enable);
        }
    },
    fbCallback:function(response){
    },
    requestCallback:function(response){
    },
    onClick:function(node){
        var tag = node.getTag();
        switch (tag){
            case BTN_PLAY:{
                //display the interface of game.
                //need one friend's headimg.
                stManager.changeState(ST_PLAY);
            }
                break;
            case BTN_BRAG:{
                //BRAG
                if(gLoginStatus){
                    //Brag!Post to Your Wall.(to you friends.)
                    if (gScore) {
                        FB.ui({ method: 'feed',
                            caption: 'I just smashed ' + gScore + ' friends! Can you beat it?',
                            picture: 'http://www.friendsmash.com/images/logo_large.jpg',
                            name: 'Checkout my Friend Smash greatness!'
                        }, this.fbCallback);
                    }
                }
                else{
                    //not login.
                    cc.log("not login");
                }
            }
                break;
            case BTN_CHALLENGE:{
                //挑战，同上
                if(gLoginStatus){
                    //Play Friend Smash with me!(all friends.)
                    FB.ui({method: 'apprequests', message: 'My Great Request'}, this.requestCallback);
                }
                else{
                    //not login.
                    cc.log("not login");
                }
            }
                break;
            case BTN_STORE:{
                //go store
                cc.log("CLICK STORE!------");
            }
                break;
        }
    },
    getBtn:function(normal, down, tag){
        if(down == null)
            down = normal;

        var normal_sp = cc.Sprite.create(normal);
        var down_sp = cc.Sprite.create(down);
        var btn = cc.MenuItemSprite.create(normal_sp, down_sp, this.onClick, this);
        btn.setTag(tag);
        return btn;
    }
});

var getOneFriendId = function(){
    var info = null;
    if(gAllFriends.length > 0){
        info = gAllFriends[Math.random()*( gAllFriends.length) | 0];
    }
    return info;
};

var LifeLayer = cc.Layer.extend({
    life:null,
    max:null,
    imgs:[],
    init:function(num){
        if(num == null)
            num = 0;

        this.max = num;
        this.initImg();
        this.setLife(num);
    },
    setLife:function(num){
        this.life = num;

        if(num <= 0){
            this.getParent().endGame();
        }

        this.refreshImg();
    },
    getLife:function(){
        return this.life
    },
    loseLife:function(num){
        //default 1
        if(num == null)
            num = 1;

        var curLife = this.life;
        curLife -= num;
        this.setLife(curLife);
    },
    initImg:function(){
        this.removeAllChildren();
        this.imgs = [];
        for(var i=0; i<this.max; i++){
            var sp = cc.Sprite.create(s_heart64);
            var size = sp.getContentSize();
            sp.setPosition(cc.p(size.width/2 + (size.width + 1)*i, size.height/2));
            this.addChild(sp);

            this.imgs.push(sp);
        }
    },
    refreshImg:function(){
        var begin = 0;
        if(begin < this.life)
            begin = this.life;
        for(var i=begin; i<this.max; i++)
        {
            this.imgs[i].setVisible(false);
        }
    }
});

var gAllFriends = [];
var HeadLayer = cc.Layer.extend({
    init:function(){
        this.lbName = cc.LabelBMFont.create("Welcome, player.", s_Arial_fnt);
        this.lbName.setAnchorPoint(cc.p(0, 0));
        this.addChild(this.lbName);
        this.lbName.setPosition(cc.p(0, 50));

        this.login = this.getBtn(s_login0, s_login1, 1);
        this.logout = this.getBtn(s_logout0, s_logout1, 2);
        this.menu = cc.Menu.create(this.login, this.logout);
        this.addChild(this.menu);
        this.login.setPosition(cc.p(165, 26));
        this.logout.setPosition(cc.p(165, 26));
        this.menu.setPosition(cc.p(0,0));
        this.logout.setVisible(false);
    },
    onClick:function(sender){
        var tag = sender.getTag();
        switch(tag){
            case 1:{
                //facebook login.
                cc.log("-------log in-----");
                FB.login(this.loginCallback.bind(this));
            }
                break;
            case 2:{
                cc.log("-------log out-----");
                FB.logout(this.logoutCallback.bind(this));
            }
                break;
        }
    },
    loginCallback:function(response){
        if(response.authResponse && response.status=='connected'){
            gFriendData = [];
            FB.api("/me",this.meInformationCallback.bind(this));
            FB.api("/me/friends",this.getFriendsCallback.bind(this));
            gLoginStatus = true;
            this.setBtnState(false);
            
            g_useFacebook = true;
        }
    },
    getFriendsCallback:function(response){
        if(response && response.data){
            gAllFriends = response.data;
        }
    },
    meInformationCallback:function(response){
        if(response && response.error)
        {
            cc.log(response.error);
            return;
        }
		var id = response.id;
        LoadUrlImage.addImageAsync("http://graph.facebook.com/"+id+"/picture?width=90&height=90", this.loadImg.bind(this));

    },
    loadImg:function(response){
    	if(response){
    		this.setHeadImg(response);
    	}
    },
    logoutCallback:function(response){
        if(response.status=='unknown'){
            this.setName("player");
            gLoginStatus = false;
            gFriendData = [];
            this.setBtnState(true);
        }
    },
    setBtnState:function(st){
        this.login.setVisible(st);
        this.logout.setVisible(false);
    },
    setName:function(name){
        this.lbName.setString("Welcome, "+name);
    },
    setHeadImg:function(src){
        this.headImg = cc.Sprite.create(src);
        this.addChild(this.headImg);
        this.headImg.setPosition(cc.p(50, 0));
    },
    setHeadImgSp:function(sp){
        this.addChild(sp);
        sp.setPosition(cc.p(50, 0));
    },
    getBtn:function(normal, down, tag){
        if(down == null)
            down = normal;

        var normal_sp = cc.Sprite.create(normal);
        var down_sp = cc.Sprite.create(down);
        var btn = cc.MenuItemSprite.create(normal_sp, down_sp, this.onClick, this)
        btn.setTag(tag);
        return btn;
    }
});

var TY_COIN = 1;
var count_int = 0;
var ResultLayer = cc.Layer.extend({
    bInit:false,
    init:function(){
        if(this.bInit)
            return;

        //add a gray layer
        var color = cc.c4b(123,123,123,123);
        var grayLayer = cc.LayerColor.create(color, winSize.width, winSize.height);
        //grayLayer.setAnchorPoint(cc.p(0,0));
        grayLayer.setPosition(cc.p(-20,-130));
        this.addChild(grayLayer);
        //
        this.bkImg = cc.Sprite.create(s_modal_box_copy2);
        this.bkImg.setAnchorPoint(cc.p(0, 0));
        this.addChild(this.bkImg);
        var size = this.bkImg.getContentSize();

        var t_x = 70;
        var t_y = size.height-60;//this.bkImg.getContentSize().height - 20;
        var t_h = 77;
        var img_w = 35;
        var img_h = -20;
        var f_sc = 1.0;
        this.lbTitle = cc.LabelBMFont.create("Results", s_Arial_fnt);
        this.lbTitle.setPosition(cc.p(t_x, t_y));
        this.lbTitle.setAnchorPoint(cc.p(0, 0));
        this.addChild(this.lbTitle);

        this.lbScore = cc.LabelBMFont.create(this.getString(0,0), s_Arial_fnt);
        this.addChild(this.lbScore);
        this.lbScore.setAnchorPoint(cc.p(0, 0));
        this.lbScore.setPosition(cc.p(t_x, t_y - t_h));
        this.imgScore = cc.Sprite.create(s_scores64);
        this.addChild(this.imgScore);
        this.imgScore.setPosition(cc.p(t_x-img_w, t_y-t_h-img_h));

        this.lbCoin = cc.LabelBMFont.create(this.getString(0, TY_COIN), s_Arial_fnt);
        this.addChild(this.lbCoin);
        this.lbCoin.setAnchorPoint(cc.p(0, 0));
        this.lbCoin.setPosition(cc.p(t_x, t_y - t_h*2));
        this.imgCoin = cc.Sprite.create(s_coin_bundle64);
        this.addChild(this.imgCoin);
        this.imgCoin.setPosition(cc.p(t_x-img_w, t_y-t_h*2-img_h));

        this.closeItem = cc.MenuItemImage.create(
            s_close_button,
            s_close_button,
            this.onClick,this);
        this.closeItem.setPosition(cc.p(size.width - 30, size.height-30));
        this.menu = cc.Menu.create(this.closeItem);
        this.addChild(this.menu);
        this.menu.setPosition(cc.p(0, 0));
    },
    onClick:function(sender){
        _menuLayer.disResult(false);
    },
    setScore:function(num){
        this.lbScore.setString(this.getString(num, 0));
    },
    setCoin:function(num){
        this.lbCoin.setString(this.getString(num, TY_COIN));
    },
    setNum:function(score, coin){
        this.setScore(score);
        this.setCoin(coin);
    },
    getString:function(num, type){
        var str;
        switch (type){
            case TY_COIN:
                str = "and grabbed " + num + " coins!";
                break;
            default :
                str = "You smashed " + num + " friends";
                break;
        }
        return str;
    }
});


//cc.ParticleExplosionQ = cc.ParticleSystemQuad.extend(/** @lends cc.ParticleExplosion# */{
//    /**
//     * initialize an explosion particle system
//     * @return {Boolean}
//     */
//    init:function () {
//        //return this.initWithTotalParticles(700);
//        return this.initWithTotalParticles((cc.renderContextType === cc.WEBGL) ? 700 : 300);
//    },
//
//    /**
//     * initialize an explosion particle system with number Of Particles
//     * @param {Number} numberOfParticles
//     * @return {Boolean}
//     */
//    initWithTotalParticles:function (numberOfParticles) {
//        if (cc.ParticleSystemQuad.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
//            // duration
//            this._duration = 0.1;
//
//            this._emitterMode = cc.PARTICLE_MODE_GRAVITY;
//
//            // Gravity Mode: gravity
//            this.modeA.gravity = cc.p(0, 0);
//
//            // Gravity Mode: speed of particles
//            this.modeA.speed = 170;
//            this.modeA.speedVar = 140;
//
//            // Gravity Mode: radial
//            this.modeA.radialAccel = 0;
//            this.modeA.radialAccelVar = 0;
//
//            // Gravity Mode: tagential
//            this.modeA.tangentialAccel = 0;
//            this.modeA.tangentialAccelVar = 0;
//
//            // angle
//            this._angle = 90;
//            this._angleVar = 360;
//
//            // emitter position
//            var winSize = cc.Director.getInstance().getWinSize();
//            this.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
//            this._posVar = cc.PointZero();
//
//            // life of particles
//            this._life = 0.30;
//            this._lifeVar = 0.21;
//
//            // size, in pixels
//            this._startSize = 15.0;
//            this._startSizeVar = 10.0;
//            this._endSize = cc.PARTICLE_START_SIZE_EQUAL_TO_END_SIZE;
//
//            // emits per second
//            this._emissionRate = this._totalParticles / this._duration;
//
//            // color of particles
//            this._startColor.r = 0.7;
//            this._startColor.g = 0.1;
//            this._startColor.b = 0.2;
//            this._startColor.a = 1.0;
//            this._startColorVar.r = 0.5;
//            this._startColorVar.g = 0.5;
//            this._startColorVar.b = 0.5;
//            this._startColorVar.a = 0.0;
//            this._endColor.r = 0.5;
//            this._endColor.g = 0.5;
//            this._endColor.b = 0.5;
//            this._endColor.a = 0.0;
//            this._endColorVar.r = 0.5;
//            this._endColorVar.g = 0.5;
//            this._endColorVar.b = 0.5;
//            this._endColorVar.a = 0.0;
//
//            // additive
//            this.setBlendAdditive(false);
//            return true;
//        }
//        return false;
//    }
//});

/**
 * Create an explosion particle system
 * @return {cc.ParticleExplosion}
 *
 * @example
 * var emitter = cc.ParticleExplosion.create();
 */
//cc.ParticleExplosionQ.create = function () {
//    var ret = new cc.ParticleExplosionQ();
//    if (ret.init()) {
//        return ret;
//    }
//    return null;
//};