#include "LoadUrlImage.h"
#include "ScriptingCore.h"

JSBool JSB_LoadUrlImage_loadUrlImage(JSContext *cx, uint32_t argc, jsval *vp){
	std::string url ;
	
	jsval *argv = JS_ARGV(cx, vp);	
	jsval_to_std_string(cx, argv[0], &url);	

	LoadUrlImage::loadUrlImage(url.c_str(),JSVAL_TO_INT(argv[1]));

	return JS_TRUE;
}

void register_LoadUrlImage_js(JSContext* cx, JSObject* global){
	jsval nsval;
	JSObject *pJsbObject;

	JS_GetProperty(cx, global, "LoadUrlImage", &nsval);
	if (nsval == JSVAL_VOID) {
		pJsbObject = JS_NewObject(cx, NULL, NULL, NULL);
		nsval = OBJECT_TO_JSVAL(pJsbObject);
		JS_SetProperty(cx, global, "LoadUrlImage", &nsval);
	} else 
		JS_ValueToObject(cx, nsval, &pJsbObject);

	JS_DefineFunction(cx, pJsbObject, "loadUrlImage", JSB_LoadUrlImage_loadUrlImage, 2, JSPROP_READONLY | JSPROP_PERMANENT);	
}