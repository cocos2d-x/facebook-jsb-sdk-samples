/**
 * Created with JetBrains WebStorm.
 * User: LinWenhai
 * Date: 13-8-22
 * Time: 下午4:15
 * To change this template use File | Settings | File Templates.
 */
var LoadUrlImage = LoadUrlImage || {};

 var LoadCallback = {
    imageKey:null,
    cb:null,

    callback:function(){
         this.cb(this.imageKey);
    }
	
	
};

LoadUrlImage.cbArray = [];
LoadUrlImage.addImageAsync = function(url, cb){
    var type_cb = typeof cb;

    if(type_cb != 'function')
        throw "Expression is of type " +type_cb+ ",not function";

    if(sys.platform == "browser"){
        var tc = Object.create(LoadCallback);
        tc.imageKey = url;
		tc.cb = cb;
        cc.TextureCache.getInstance().addImageAsync(url, tc, tc.callback);
    }
    else{
        var cbIndex = this.cbArray.indexOf(cb);
        if(cbIndex == -1)
            cbIndex = this.cbArray.push(cb) - 1;
        this.loadUrlImage(url,cbIndex);
    }
};

LoadUrlImage.callback = function(cbIndex,imageKey){
    this.cbArray[cbIndex](imageKey);
};
