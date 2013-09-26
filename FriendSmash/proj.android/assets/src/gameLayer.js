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
        this.setTouchEnabled(true);
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
    },
    initData:function(){
        gDoingGameover = false;
        gSpawnTimer = 60*60;
        gTickSpeed = 1;
        gScore = 0;
        gCoins = 0;
        timer = 0;
        tSpace = 100;
        gFriendInfo = getOneFriendId();
        if(gFriendInfo){
            gFriendID = gFriendInfo.id;
            friendName = gFriendInfo.name;
            FB.api("/"+gFriendID+"/picture", {"width":"90","height":"90"}, this.friendInfoCallback.bind(this));
        }
        else{
            gFriendID = getRand(10);
            friendName = arrName[gFriendID];
        }
        this.getParent().setTitle(friendName);
    },
    friendInfoCallback:function(response){
        if(response){
            var url = response.data.url;
            LoadUrlImage.addImageAsync(url, this.loadImg.bind(this));
        }
    },
    loadImg:function(response){
        if(response){
            this.friendImg = response;
        }
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
            effect.spawn();
            effect.setPosition(pClick);
            this.addChild(effect);
            arrEffects.push(effect);
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
        this.unscheduleUpdate();
        this.removeAllChildren();
        gEntities = [];
        this.startGame(false);
        stManager.changeState(ST_MENU);
        _menuLayer.disResult(true);
    },
    spawnEntity:function(forceFriendsOnly) {
        var entityType = forceFriendsOnly ? 0 : getRandom(0, 1);
        var newEntity = new entity();

        if (entityType < 0.6 && gFriendID != null) {
            if (g_useFacebook) {
            	if(this.friendImg)
                	newEntity.init1(this.friendImg, true);
                else{
            		var nCelebToSpawn = Math.floor(getRandom(0, 10));
            		while (nCelebToSpawn == gFriendID) {
                		nCelebToSpawn = Math.floor(getRandom(0, 10));
            		}
                	newEntity.init1('res/Art/nonfriend_' + (nCelebToSpawn+1) + '.png', false);
                }
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
        this.init(src);
        this.positionX = 0;
        this.positionY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotationalVelocity = 0;
        this.rotationAngle = 0;
        this.isFriend = isFriend;
        this.image = src;
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

        var distanceToMiddle = getRandom(220, 260) - this.positionX;
        this.velocityX = distanceToMiddle * getRandom(0.01, 0.015);
        this.velocityY = getRandom(9, 12);

        this.middleTime = distanceToMiddle/this.velocityX;
        this.tickY = -this.velocityY / this.middleTime;
    },
    tick:function() {
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

            //add one score.
            this.getParent().addEffect(1);
        }
        else{
            //gameover。
            this.getParent().unscheduleUpdate();
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
    temp = 0|(temp);
    return temp;
}
