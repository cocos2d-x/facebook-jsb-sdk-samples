#include "ScriptingCore.h"
#include "FacebookInterface.h"

JSBool JSB_Facebook_login(JSContext *cx, uint32_t argc, jsval *vp){
	int cbIndex;
	JSString * str = NULL;
	
	if (argc == 1)
		JS_ConvertArguments(cx,1,JS_ARGV(cx,vp),"i",&cbIndex);
	else
		JS_ConvertArguments(cx,2,JS_ARGV(cx,vp),"iS",&cbIndex,&str);
	
	if (str)
	{
		JSStringWrapper wrapper(str);
		FacebookInterface::login(cbIndex,wrapper);
	} 
	else
		FacebookInterface::login(cbIndex,NULL);

	return JS_TRUE;
}

JSBool JSB_Facebook_logout(JSContext *cx, uint32_t argc, jsval *vp){
	int cbIndex;

	JS_ConvertArguments(cx,1,JS_ARGV(cx,vp),"i",&cbIndex);
	
	FacebookInterface::logout(cbIndex);

	return JS_TRUE;
}

JSBool JSB_Facebook_getLoginStatus(JSContext *cx, uint32_t argc, jsval *vp){
	jsval *argv = JS_ARGV(cx, vp);	
	
	int cbIndex = JSVAL_TO_INT(argv[0]);
	bool force = JSVAL_TO_BOOLEAN(argv[1]);
	
	FacebookInterface::getLoginStatus(cbIndex,force);

	return JS_TRUE;
}

JSBool JSB_Facebook_api(JSContext *cx, uint32_t argc, jsval *vp){
	std::string graphPath ;
	std::string method ;
	std::string params ;
	std::string errorRet;	

	jsval *argv = JS_ARGV(cx, vp);	
	jsval_to_std_string(cx, argv[0], &graphPath);

  const char* pMethod = NULL;
	if(!JSVAL_IS_VOID(argv[1])){
		jsval_to_std_string(cx, argv[1], &method);
		pMethod = method.c_str();
	}
	const char* pParams = NULL;
	if(!JSVAL_IS_VOID(argv[2])){
		jsval_to_std_string(cx, argv[2], &params);
		pParams = params.c_str();
	}

	errorRet = FacebookInterface::api(graphPath.c_str(),pMethod,pParams,JSVAL_TO_INT(argv[3]));
		
	if (errorRet.length() > 0)
		JS_SET_RVAL(cx, vp, std_string_to_jsval(cx,errorRet));
	else
		JS_SET_RVAL(cx, vp, JSVAL_VOID);

	return JS_TRUE;
}

JSBool JSB_Facebook_ui(JSContext *cx, uint32_t argc, jsval *vp){
	std::string params ;
	int cbIndex;

	jsval *argv = JS_ARGV(cx, vp);
	jsval_to_std_string(cx, argv[0], &params);
	cbIndex = JSVAL_TO_INT(argv[1]);

	FacebookInterface::ui(params.c_str(),cbIndex);

	return JS_TRUE;
}

void register_facebook_js(JSContext* cx, JSObject* global){
	jsval nsval;
	JSObject *facebookJsbObject;

	JS_GetProperty(cx, global, "FacebookJsb", &nsval);
	if (nsval == JSVAL_VOID) {
		facebookJsbObject = JS_NewObject(cx, NULL, NULL, NULL);
		nsval = OBJECT_TO_JSVAL(facebookJsbObject);
		JS_SetProperty(cx, global, "FacebookJsb", &nsval);
	} else 
		JS_ValueToObject(cx, nsval, &facebookJsbObject);

	JS_DefineFunction(cx, facebookJsbObject, "login", JSB_Facebook_login, 2, JSPROP_READONLY | JSPROP_PERMANENT);
	JS_DefineFunction(cx, facebookJsbObject, "logout", JSB_Facebook_logout, 1, JSPROP_READONLY | JSPROP_PERMANENT);
	JS_DefineFunction(cx, facebookJsbObject, "getLoginStatus", JSB_Facebook_getLoginStatus, 2, JSPROP_READONLY | JSPROP_PERMANENT);
	JS_DefineFunction(cx, facebookJsbObject, "api", JSB_Facebook_api, 4, JSPROP_READONLY | JSPROP_PERMANENT);
	JS_DefineFunction(cx, facebookJsbObject, "ui", JSB_Facebook_ui, 2, JSPROP_READONLY | JSPROP_PERMANENT);
}