/**
 * Created with JetBrains WebStorm.
 * User: LinWenhai
 * Date: 13-8-5
 * Time: 上午11:31
 * To change this template use File | Settings | File Templates.
 */

var FB = FB || {};
var FacebookJsb = FacebookJsb || {};

FB.cbArray = [];
FB.vaildMethod = []

FB.login = function(cb,opts){
    var argNum = arguments.length;

    if(argNum > 0){
        var type_cb = typeof cb;

        if(type_cb != 'function')
            throw "Expression is of type " +type_cb+ ",not function";

        var cbIndex = this.cbArray.indexOf(cb);
        if(cbIndex == -1)
            cbIndex = this.cbArray.push(cb) - 1;

        if(argNum == 2){
            if(opts.scope != undefined && typeof(opts.scope) == 'string')
                FacebookJsb.login(cbIndex,opts.scope);
            else
                FacebookJsb.login(cbIndex);
        }
        else
            FacebookJsb.login(cbIndex);
    }
    else
        FacebookJsb.login(-1);
};

FB.getLoginStatus = function(cb,force){
    var argNum = arguments.length;
    if(argNum > 0){
        var type_cb = typeof cb;
        if(type_cb != 'function')
            throw "Expression is of type " +type_cb+ ",not function";

        var cbIndex = this.cbArray.indexOf(cb);
        if(cbIndex == -1)
            cbIndex = this.cbArray.push(cb) - 1;

        if(argNum == 2){
            if(force === 'true')
                FacebookJsb.getLoginStatus(cbIndex,true);
            else
                FacebookJsb.getLoginStatus(cbIndex,false);
        }
        else
            FacebookJsb.getLoginStatus(cbIndex,false);
    }
};

FB.logout = function(cb){
    var argNum = arguments.length;
    if(argNum > 0){
        var type_cb = typeof cb;
        if(type_cb != 'function')
            throw "Expression is of type " +type_cb+ ",not function";

        var cbIndex = this.cbArray.indexOf(cb);
        if(cbIndex == -1)
            cbIndex = this.cbArray.push(cb) - 1;
        FacebookJsb.logout(cbIndex);
    }
    else
        FacebookJsb.logout(-1);
};

//path,method,params,cb
FB.api = function(par1,par2,par3,par4){
    var typePath = typeof par1;
    if(typePath != 'string')
        throw "Expression is of type " +typePath+ ",not object";
    else if(par1.length == 0)
        throw "The passed argument could not be parsed as a url.";

    var method;
    var params;
    var callback;

    for(var index=1; index<arguments.length; index++){
        switch (typeof  arguments[index]){
            case 'string':
                method = arguments[index];
                break;
            case 'object':
                params = arguments[index];
                break;
            case 'function':
                callback = arguments[index];
                break;
        }
    }

    if(method && method != 'get' && method != 'post' && method != 'delete')
        throw 'Invalid method passed to ApiClient: '+method;

    var cbIndex = -1;
    if(callback){
        cbIndex = this.cbArray.indexOf(callback);
        if(cbIndex == -1)
            cbIndex = this.cbArray.push(callback) - 1;
    }

    var error = FacebookJsb.api(par1,method,JSON.stringify(params),cbIndex);
    if(error != null){
       var errorObj = eval('('+error+')');
       throw  errorObj;
    }
};

FB.ui = function(params,cb){
    var argNum = arguments.length;
    if(argNum == 2){
        var cbIndex = this.cbArray.indexOf(cb);
        if(cbIndex == -1)
            cbIndex = this.cbArray.push(cb) - 1;
        FacebookJsb.ui(JSON.stringify(params),cbIndex);
    }
};

FB.callback = function(index,params){
    if(index >= 0 && index < this.cbArray.length){
        var argNum = arguments.length;
        if(argNum == 2){
            var response = eval('('+params+')');
            this.cbArray[index](response);
        }
        else
            this.cbArray[index]();
    }
} ;