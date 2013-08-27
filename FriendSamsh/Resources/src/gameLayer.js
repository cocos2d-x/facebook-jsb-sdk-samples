/**
 * Created with JetBrains WebStorm.
 * User: cocos
 * Date: 13-8-14
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */

/*
  随机发放好友、非好友、coin。
  可以点击。
  点击正确，得分以及特效
  点击coin，得金币
  点击错误：动画，游戏结束。
*/
var timer=0;
var tSpace=0;

var arrName = ["Einstein", "Xzibit", "Goldsmith",
        "Sinatra", "George", "Jacko",
        "Rick", "Keanu", "Arnie", "Jean-Luc"];

var arrEffects = [];
var showEffect = 0;

var GameLayer = cc.Layer.extend({
    init:function(){
        cc.log("gamelayer init.");
        var sp = cc.Sprite.create("res/ball.png");
        this.addChild(sp);
        sp.setPosition(cc.p(100, 100));

        //this.scheduleUpdate();
        this.setTouchEnabled(true);
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);

        //this.startGame(true);
    },
    initData:function(){
        gDoingGameover = false;
        gSpawnTimer = 60*60;
        gTickSpeed = 1;
        gScore = 0;
        gCoins = 0;
        timer = 0;
        tSpace = 100;
        gFriendID = getRand(10);
        friendName = arrName[gFriendID];
        this.getParent().setTitle(friendName);
        g_useFacebook = false;
    },
    startGame:function(start){
        if(start)
        {
            this.initData();
            this.scheduleUpdate();
        }
        //else this.unscheduleUpdate();
    },
    onTouchBegan:function(event){
        //cc.log("touch began.");
        var pClick = event.getLocation();
        showEffect = 0;
        for(var i=0; i<gEntities.length; i++)
        {
            if(gEntities[i] != null)
            {
                var pos = gEntities[i].getPosition();
                var size = gEntities[i].getContentSize();
                //var angle = gEntities[i];
                if(isInSize(pClick, pos, size)){
                    gEntities[i].isClicked(i, pClick);
                }
            }
        }

        var effect = new plusSpr();
//        cc.log("showEffect: ", showEffect);
        switch (showEffect){
            case TYPE_ADD_1:
                effect.init1(TYPE_ADD_1);
                //this.disParticle();
                break;
            case TYPE_ADD_2:
            {
                effect.init1(TYPE_ADD_2);
                this.disParticle();
            }
                break;
            case TYPE_ADD_3:
            {
                effect.init1(TYPE_ADD_3);
                this.disParticle();
            }
                break;
            default:
                effect = null;
                break;
        }
        if(effect != null)
        {
            //effect.setPosition(cc.p(150, 200));
            effect.spawn();
            effect.setPosition(pClick);
            this.addChild(effect);
            arrEffects.push(effect);
            //cc.log("showEffect: ------", showEffect , pClick);
        }
    },
    addEffect:function(num){
        showEffect += 1;
    },
    disParticle:function(){
        cc.log("will addParticle.");
        //
//         this._emitter = cc.ParticleExplosionQ.create();
//         this.addChild(this._emitter, 2);
// 
//         this._emitter.setTexture(cc.TextureCache.getInstance().addImage(s_sparkleparticle));
//         if (this._emitter.setShapeType)
//             this._emitter.setShapeType(cc.PARTICLE_TEXTURE_MODE);
// 
//         this._emitter.setAutoRemoveOnFinish(true);
    },
//    onTouchesBegan:function(event)
//    {
//        cc.log("onTouchesBegan");
//        this.logTH();
//
//        // Frenzy?
//        if (!(gScore % 10))
//        {
//            for (var i=0; i<Math.floor((gScore/20)); ++i) {
//                this.spawnEntity(true);
//            }
//        }
//    },
    logTH:function(){
        //cc.log("--------log begin--------");
//        cc.log("gDoingGameover: ", gDoingGameover);
//        cc.log("gSpawnTimer: ", gSpawnTimer);
//        cc.log("gTickSpeed: ", gTickSpeed);
//        cc.log("gScore: ", gScore);
//        cc.log("gFriendID: ", gFriendID);
//        cc.log("g_useFacebook: ", g_useFacebook);
        //cc.log("winSize.height: ", winSize.height);
        //cc.log("--------log end--------");
    },
    update:function(dt){
        if(timer%tSpace==0)
        {
            this.spawnEntity(false);
        }

        if(!gDoingGameover)
        {
            for(var i=0; i<gEntities.length; i++)
            {
                if(gEntities[i] != null)
                {
                    if(!gEntities[i].inScene){
                        gEntities[i].removeFromParent(true);
                        delElement(gEntities, i);
                    }
                }

                if(arrEffects[i] != null){
                    if(!arrEffects[i].inScene){
                        arrEffects[i].removeFromParent(true);
                        delElement(arrEffects, i);
                    }
                }
            }

            for(var i=0; i<gEntities.length; i++)
            {
                if(gEntities[i] != null)
                {
                    if(gEntities[i].inScene)
                    {
                        gEntities[i].tick();
                    }
                }
            }

            for(var i=0; i<arrEffects.length; i++){
                if(arrEffects != null){
                    arrEffects[i].tick();
                }
            }
        }

        timer ++;
    },
    endGame:function(){
        cc.log("endGame.");
        this.unscheduleUpdate();
        this.removeAllChildren();
        gEntities = [];
        this.startGame(false);
        stManager.changeState(ST_MENU);
        _menuLayer.disResult(true);
    },
    spawnEntity:function(forceFriendsOnly) {
        var entityType = forceFriendsOnly ? 0 : getRandom(0, 1);
        //cc.log("entityType: ", entityType);
        var newEntity = new entity();

        if (entityType < 0.6 && gFriendID != null) {
            if (g_useFacebook) {
                newEntity.init1(gFriendID, true);
            } else {
                newEntity.init1('res/Art/nonfriend_' + (gFriendID+1) + '.png', true);
            }
        }
        else if(entityType < 0.7 ) {
            newEntity.init1('res/Art/coin64.png', false);
            newEntity.isCoin = true;
        }
        else {
            var nCelebToSpawn = Math.floor(getRandom(0, 10));
            while (nCelebToSpawn == gFriendID) {
                nCelebToSpawn = Math.floor(getRandom(0, 10));
            }
            newEntity.init1('res/Art/nonfriend_' + (nCelebToSpawn+1) + '.png', false);
        }

        newEntity.spawn();
        this.addChild(newEntity);
        gEntities.push(newEntity);
    }
});

var isInSize = function(pos, tar, size){
    if( pos.x < tar.x - size.width/2    ||
        pos.x > tar.x + size.width/2    ||
        pos.y < tar.y - size.height/2   ||
        pos.y > tar.y + size.height/2){
        return false;
    }

    return true;
}

var getRandom = function(min, max) {
    var range = max-min;
    return Math.random() * range + min;
}

var TYPE_ADD_1 = 1;
var TYPE_ADD_2 = 2;
var TYPE_ADD_3 = 3;
var PLUS_S = "plus_";
var URL_ART = "res/Art/";

var plusSpr = cc.Sprite.extend({
    img:null,
    life:-1,
    init1:function(type){
        var img = URL_ART+PLUS_S+type+_PNG;
        //this.initWithFile(img);
        this.init(img);
        this.life = 30;
        this.inScene = true;
    },
    spawn:function() {
        this.velocityY = 1;
    },
    tick:function(){
        this.posY = this.getPositionY() + this.velocityY;
        this.setPositionY(this.posY);
        this.life --;
        if(this.life < 0){
            this.inScene = false;
        }
    }
});

var particle = cc.Sprite.extend({
    init:function(){
        //particle explosion.
//        this._emitter = cc.ParticleExplosion.create();
//        this..addChild(this._emitter, 10);
//
//        this._emitter.setTexture(cc.TextureCache.getInstance().addImage(s_stars1));
//        if (this._emitter.setShapeType)
//            this._emitter.setShapeType(cc.PARTICLE_STAR_SHAPE);
//
//        this._emitter.setAutoRemoveOnFinish(true);
    },
    tick:function(){

    }
});

var entity = cc.Sprite.extend ({
    init1:function(src, isFriend) {
        //this.initWithFile(src);
        this.init(src);
        this.positionX = 0;
        this.positionY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotationalVelocity = 0;
        this.rotationAngle = 0;
        this.isFriend = isFriend;
        this.image = src;
        //this.image.setPosition(cc.p(getRand(winSize.width), 0));
        //this.addChild(this.image);
        this.isCoin = false;
        this.middleTime = 0;
        this.tickY = 0;
        this.rot = 9;
        this.inScene = true;
    },
    spawn:function() {
        var sideMargin = 40;
        var gCanvasWidth = winSize.width;
        var gCanvasHeight = 60;
        this.positionX = getRandom(-sideMargin, gCanvasWidth + sideMargin);
        this.positionY = gCanvasHeight + 30;
        this.setPosition(this.positionX, this.positionY);

        this.rotationalVelocity = getRandom(-this.rot, this.rot);

//        var distanceToMiddle = getRandom(220, 260) - this.positionX;
//        this.velocityX = distanceToMiddle * getRandom(0.01, 0.015);
//        this.velocityY = getRandom(10, 13);
        var distanceToMiddle = getRandom(220, 260) - this.positionX;
        this.velocityX = distanceToMiddle * getRandom(0.01, 0.015);
        this.velocityY = getRandom(9, 12);

        this.middleTime = distanceToMiddle/this.velocityX;
        this.tickY = -this.velocityY / this.middleTime;

        //cc.log("position:", this.positionX, this.positionY);
        //cc.log("velocity: ", this.velocityX, this.velocityY);
    },
    tick:function() {
        //this.image.setScaleX = this.image.width;
        //this.image.setScaleY = this.image.height;
        this.positionX += this.velocityX;
        this.positionY += this.velocityY;
        this.setPosition(this.positionX, this.positionY);
        this.rotationAngle += this.rotationalVelocity;
        this.setRotation(this.rotationAngle);
        this.velocityY += this.tickY;

        if(isOutOfSize(this.positionX, this.positionY)){
            this.inScene = false;
            if(this.isFriend){
                lifeLayer.loseLife(1);
            }
        }
    },
//    onEnter:function () {
//    if(sys.platform == "browser")
//        cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 1, true);
//    else
//        cc.registerTargettedDelegate(1,true,this);
//    this._super();
//    },
//    onExit:function () {
//        if(sys.platform == "browser")
//            cc.Director.getInstance().getTouchDispatcher().removeDelegate(this);
//        else
//            cc.unregisterTouchDelegate(this);
//
//        this._super();
//    },
//    onTouchBegan:function(event){
//        //cc.log("on touch began", event);
//        //cc.log("point: ", event.getLocation(), this.getPosition());
//        var mouseP = event.getLocation();
//        if(this.isInSelf(mouseP))
//        {
//            return true;
//        }
//        //if(event._point)
//        return false;
//    }
    isClicked:function(sender, point){
        //cc.log("click me.", sender);

        if(this.isCoin)
        {
            gCoins ++;
            //cc.log("gCoins: ", gCoins);
            //remove from screen
            this.inScene = false;

            return;
        }
        if(this.isFriend){
            gScore ++;
            //cc.log("gScore: ", gScore);
            //remove from screen
            this.inScene = false;

            //加一分
            this.getParent().addEffect(1);
        }
        else{
            //this.getParent().endGame();
            //add放大特效，and gameover。
            this.getParent().unscheduleUpdate();
            cc.log("scale and end game.");
            var scale = cc.ScaleTo.create(0.6, 5, 5);
            var rot = cc.RotateBy.create(0.6, 90, 90);
            this.runAction(rot);
            var seq = cc.Sequence.create(scale,
                cc.CallFunc.create(this.endGame, this));
            this.runAction(scale);
            this.runAction(seq);
        }
    },
    endGame:function(){
        cc.log("in here, endgame.");
        this.getParent().endGame();
    }
});

var delElement = function(arr, idx){
    for(var i=idx; i<arr.length-1; i++){
        arr[i] = arr[i+1];
    }
    arr.pop();
}

var isOutOfSize = function(x, y){
    if(x<-60 || x > winSize.width+60 ||
       y<-60 || y > winSize.height ){
        return true;
    }

    return false;
}

var getRand = function(n)
{
    var temp = Math.random() * (n);
    //cc.log(temp);
    temp = 0|(temp);
    return temp;
}
