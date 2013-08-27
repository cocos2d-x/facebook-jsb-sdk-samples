/**
 * Created with JetBrains WebStorm.
 * User: LinWenhai
 * Date: 13-8-6
 * Time: 下午1:52
 * To change this template use File | Settings | File Templates.
 */

var menuItemText = ['login','logout','getLoginStatus','UserInformation','FriendsInformation',
    'record score','post story','send request','graph api:post','graph api:delete'];

var FacebookTest = cc.Layer.extend({
    postId:null,
    postCallbackBind:null,
    deleteCallbackBind:null,

    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        var bRet = false;
        if (this._super()) {
            var bgSprite = cc.Sprite.create("res/HelloWorld.png");
            bgSprite.setPosition(cc.p(512,384));
            this.addChild(bgSprite);

            var menu = cc.Menu.create();
            menu.setPosition(cc.p(0, 0));
            this.addChild(menu);

            var fontColor = cc.c3b(237,28,36);
            var fontSize = 42;
            var menuItem;
            var posX;
            var posY;
            for(var i=0;i<menuItemText.length;i++){
                menuItem = cc.MenuItemFont.create(menuItemText[i],this.menuCallback,this);
                menuItem.setFontSize(fontSize);
                menuItem.setColor(fontColor);
                menuItem.setTag(i+1);

                posX = 252+512 * parseInt(i/5);
                posY = 250+100*(i%5);
                menuItem.setPosition(cc.p(posX,posY));
                menu.addChild(menuItem);
            }

            var closeItem = cc.MenuItemImage.create(
                "res/CloseNormal.png",
                "res/CloseSelected.png",
                this.menuCloseCallback,
                this
            );
            closeItem.setPosition(cc.p(1000, 20));
            menu.addChild(closeItem);

            this.postCallbackBind = this.postCallback.bind(this);
            this.deleteCallbackBind = this.deleteCallback.bind(this);
            bRet = true;
        }
        return bRet;
    },
    menuCloseCallback:function (sender) {
       cc.Director.getInstance().end();
    },
    menuCallback:function(sender){
        switch(sender.getTag()){
            case 1:{
                try{
                    FB.login(this.loginCallback,{scope:'publish_stream'});
                }
                catch(error){
                    cc.log("catch error:"+JSON.stringify(error));
                }
                break;
            }
            case 2:
                FB.logout(this.logoutCallback);
                break;
            case 3:{
                FB.getLoginStatus(this.loginStatusCallback);
                break;
            }
            case 4:{
                FB.api("/me",this.meInformationCallback);
                break;
            }
            case 5:{
                FB.api('/me/friends', this.friendsInformationCallback);
                break;
            }
            case 6:{
                FB.api('/me/scores/', 'post', { score: 999999 }, this.scoreCallback);
                break;
            }
            case 7:{
                FB.ui(
                    {
                        method: 'feed',
                        name: 'The Facebook SDK for Javascript bindings',
                        caption: 'Bringing Facebook to the android and ios',
                        description: 'test feed method',
                        link: 'https://developers.facebook.com/docs/reference/javascript/',
                        picture: 'http://www.fbrell.com/public/f8.jpg'
                    },
                    this.feedCallback);
                break;
            }
            case 8:{
                FB.ui({method: 'apprequests',
                    title:'Challenge',
                    message: 'I just smashed 999999 friends! Can you beat it?'
                }, this.sendRequestCallback);
                break;
            }
            case 9:{
                try{
                    var body = 'test post story by graph api';
                    FB.api('/me/feed', 'post', { message: body }, this.postCallbackBind);
                }
                catch(err){
                    if(err.message != undefined)
                        cc.log("errMessage:"+err.message);
                }
                break;
            }
            case 10:{
                cc.log("this.postId:"+this.postId);
                if(this.postId != null){
                    FB.api(this.postId, 'delete', this.deleteCallbackBind);
                }
                break;
            }
        }
    },
    loginCallback:function(response){
        cc.log("FacebookTest login:"+JSON.stringify(response));
        if(response.authResponse)
            cc.log("FacebookTest login:User login succeed.");
        else
            cc.log("FacebookTest login:User cancelled login or did not fully authorize.");
    },
    logoutCallback:function(response){
        cc.log("FacebookTest logout:"+JSON.stringify(response));
        if(response.status == 'unknown')
            cc.log("FacebookTest logout:User logout succeed.");
        else
            cc.log("FacebookTest logout:User logout fail.");
    },
    loginStatusCallback:function(response){
        cc.log("FacebookTest loginStatusCallback:"+JSON.stringify(response));
    },
    meInformationCallback:function(response){
        cc.log("FacebookTest requestMeCallback:"+JSON.stringify(response));
    },
    friendsInformationCallback:function(response){
        cc.log("FacebookTest friendsInformationCallback:"+JSON.stringify(response));
    },
    scoreCallback:function(response){
        cc.log("FacebookTest scoreCallback:"+JSON.stringify(response));
    },
    postCallback:function(response){
        cc.log("FacebookTest postCallback:"+JSON.stringify(response));
        if (response && response.id) {
            this.postId = response.id;
            cc.log('Post was published.');
        } else {
            cc.log('Post was not published.');
        }
    },
    feedCallback:function(response){
        cc.log("FacebookTest feedCallback:"+JSON.stringify(response));
        if (response && response.post_id) {
            cc.log('Feed was published:'+response.post_id);
        } else {
            cc.log('Feed was not published.');
        }
    },
    sendRequestCallback:function(response){
        cc.log("FacebookTest sendRequestCallback:"+JSON.stringify(response));
    },
    deleteCallback:function(response){
        cc.log("FacebookTest deleteCallback:"+JSON.stringify(response));
        if (!response || response.error) {
            cc.log('Error occured');
        } else {
            cc.log('Post was deleted');
            this.postId = null;
        }
    }
});

var MyScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.Scene );
    },

    onEnter:function () {
        this._super();
        var layer = new FacebookTest;
        this.addChild(layer);
    }
});