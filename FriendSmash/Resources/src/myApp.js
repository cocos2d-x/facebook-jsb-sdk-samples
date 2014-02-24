/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var worldWidth = 480;
var worldHeight = 800;
var SIZE_MOD = 7;
var winSize = cc.size(480,800);

var app_id = "290786477730812";
var app_secret = "2cdc7b30f1135b0380b32baaef3adfd8";
var app_namespace = "facesample";

var app_url = "http://apps.facebook.com/' . $app_namespace . '/";
var scope = "email,publish_actions";

var gLoginStatus = false;   //global login status.
var stManager;      //global varibale, manage game state.
var g_useFacebook = false;	//global varibale, is use facebook.

var StManager = cc.Class.extend({
    stArr:[],
    curSt:-1,
    scene:null,
    init:function(sc){
        this.scene = sc;
        this.addLayers();
    },
    addLayers:function(){
        //menu
        var layer = new MyLayer();
        layer.init();
        this.stArr[ST_MENU] = layer;

        //player
        var player = new PlayLayer()
        player.init()
        this.stArr[ST_PLAY] = player;

        for(var i=0; i<this.stArr.length; i++){
            var ly = this.stArr[i];
            ly.setDisplay(false);
            this.scene.addChild(ly);
        }

        this.changeState(ST_MENU);
    },
    changeState:function(st){
        if(this.curSt == st)
            return;
        if(this.curSt >= 0 && this.stArr[this.curSt] != null)
            this.stArr[this.curSt].setDisplay(false);

        this.stArr[st].setDisplay(true);
        this.curSt = st;
    }

});

var _menuLayer = null;
var MyLayer = cc.Layer.extend({
    //balls:[],
    resultLayer:null,
    init:function () {
        this._super();
        this.addBackground();
    },
    setDisplay:function(visble){
        this.setVisible(visble);
    },
    addBackground:function(){
        this.headLayer = new HeadLayer();
        this.headLayer.init();
        this.headLayer.setPosition(cc.p(10, winSize.height - 100));
        this.addChild(this.headLayer);
        
        this.menuLayer = new MenuLayer();
        this.menuLayer.init();
        this.addChild(this.menuLayer);
        
        //just for a global variable.
        _menuLayer = this;
    },
    disResult:function(display){
        if(display){
            this.resultLayer = new ResultLayer();
            this.resultLayer.init();
            this.resultLayer.setNum(gScore, gCoins);
            this.resultLayer.setPosition(cc.p(23, 120));
            this.addChild(this.resultLayer);
            this.menuLayer.setMenuTouchEnable(false);
        }
        else{
            if(this.resultLayer != null){
                this.resultLayer.removeFromParent(true);
                this.menuLayer.setMenuTouchEnable(true);
            }
        }
    }
});

//count
var count = 0;
var gGameBombs;
var gBombsUsed;
var gTickGameInterval;
var gTickSpeed;
var gFriendID;
var gScore = 0;
var gCoins = 0;
var gContext;
var gCanvasElement;
var gSpawnTimer;
var gScoreUIText;
var gSmashUIText;
var gDoingGameover;
var gGameOverEntity;
var gLives;
var gInitialLives;
var gExplosionParticles = [];
var gBombImages = [];
var gEntities = [];
var gLifeImages = [];
var gExplosionTimerLength = 100;
var gExplosionTimer;

var TO_RADIANS = Math.PI/180;

var IMG_HEADER = "nonfriend_";
var _PNG = ".png";
//
var lifeLayer;
var lifeCount = 3;

var PlayLayer = cc.Layer.extend({
    title:null,
    score:null,
    life:null,
    lbScore:null,
    curScore:-1,
    init:function(){
        this.title = cc.LabelBMFont.create("smash ani", s_Arial_fnt);
        this.score = cc.LabelBMFont.create("score:", s_Arial_fnt);
        this.lbScore = cc.LabelBMFont.create("731", s_Arial_fnt);
        lifeLayer = new LifeLayer();

        this.title.setPosition(cc.p(10, winSize.height - 30));
        this.title.setAnchorPoint(cc.p(0, 0.5));
        this.addChild(this.title);
        this.score.setPosition(cc.p(378, winSize.height - 30));
        this.addChild(this.score);
        this.lbScore.setPosition(cc.p(421, winSize.height - 32));
        this.lbScore.setAnchorPoint(cc.p(0, 0.5));
        this.addChild(this.lbScore);
        lifeLayer.setPosition(cc.p(5, winSize.height - 130));
        this.addChild(lifeLayer);

        this.setTouchEnabled(true);

        this.gameLayer = new GameLayer();
        this.gameLayer.init();
        this.addChild(this.gameLayer);

        this.scheduleUpdate();
    },
    setTitle:function(name){
        this.title.setString("smash "+name+"!");
    },
    endGame:function(){
        this.gameLayer.endGame();
    },
    setDisplay:function(visble){
        this.setVisible(visble);

        if(visble){
            lifeLayer.init(lifeCount);
            this.gameLayer.startGame(true);
        }
    },
    update:function(dt){
        if(count % 300 == 0)
        {
            //cc.log("update:", count, gEntities.length);
        }
        count ++;

        if(this.curScore != gScore){
            this.curScore = gScore;
            this.lbScore.setString(this.curScore);
        }
    }
});

var BackLayer = cc.Layer.extend({
    init:function(){
    	//just add a const background.
        var bkImg = cc.Sprite.create(s_frontscreen_background);
        this.addChild(bkImg);
        bkImg.setAnchorPoint(cc.p(0, 0));
        bkImg.setPosition(cc.p(0, -70));
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var back = new BackLayer();
        back.init();
        this.addChild(back);
        stManager = new StManager();;
        stManager.init(this);
    }
});

// send Facebook Instrumentation
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://www.facebook.com/impression.php");
xhr.send("plugin=featured_resources&payload=" +
         encodeURIComponent('"{\\"resource\\":\\"chukong_cocos2dx\\",\\"appid\\":\\"151257628415336\\",\\"version\\":\\2.3\\"}"'));

