#include "LoadUrlImage.h"
#include "ScriptingCore.h"

USING_NS_CC;
USING_NS_CC_EXT;

extern jsval anonEvaluate(JSContext *cx, JSObject *thisObj, const char* string);

LoadUrlImage* gLoadUrlImage = nullptr;
JSObject *jsLoadUrlImageObject = NULL;

LoadUrlImage::LoadUrlImage(){

}

LoadUrlImage* LoadUrlImage::getInstance(){
	if (gLoadUrlImage == nullptr)
		gLoadUrlImage = new LoadUrlImage();
	return gLoadUrlImage;
}

void LoadUrlImage::callJsFunction(int cbIndex,const char* imageKey){
	ScriptingCore* sc = ScriptingCore::getInstance();
	JSContext *cx = sc->getGlobalContext();
	if (jsLoadUrlImageObject == NULL)
		jsLoadUrlImageObject = JSVAL_TO_OBJECT(anonEvaluate(cx, sc->getGlobalObject(), "(function () { return LoadUrlImage; })()"));

	if (imageKey)
	{
		jsval argv[2];
		argv[0] = INT_TO_JSVAL(cbIndex);	
		argv[1] = c_string_to_jsval(cx,imageKey);

		jsval res;
		JS_CallFunctionName(cx, jsLoadUrlImageObject, "callback", 2, argv, &res);
	} 
	else
	{
		jsval argv[1];
		argv[0] = INT_TO_JSVAL(cbIndex);			

		jsval res;
		JS_CallFunctionName(cx, jsLoadUrlImageObject, "callback", 1, argv, &res);
	}
	
}

void LoadUrlImage::loadUrlImage(const char* url,int cbIndex){
	getInstance();
	std::string strUrl = url;

	CCHttpRequest* request = new CCHttpRequest();
	request->setUrl(url);
	request->setRequestType(CCHttpRequest::kHttpGet);
	request->setResponseCallback(gLoadUrlImage, httpresponse_selector(LoadUrlImage::onLoadCompleted));
	request->setUserData((void*)cbIndex);
	
	request->setTag(strUrl.substr(strUrl.find_last_of('/')).c_str());
	CCHttpClient::getInstance()->send(request);
	request->release();
	CCLog("loadUrlImage");
}

CCImage::EImageFormat getImageFormat(std::string lowerCase){
	CCImage::EImageFormat eImageFormat = CCImage::kFmtUnKnown;

	if(lowerCase.size() == 0)
		return eImageFormat;

	for (unsigned int i = 0; i < lowerCase.length(); ++i)
		lowerCase[i] = tolower(lowerCase[i]);

	if (std::string::npos != lowerCase.find(".png"))
		eImageFormat = CCImage::kFmtPng;
	else if (std::string::npos != lowerCase.find(".jpg") || std::string::npos != lowerCase.find(".jpeg"))
		eImageFormat = CCImage::kFmtJpg;
	else if (std::string::npos != lowerCase.find(".tif") || std::string::npos != lowerCase.find(".tiff"))
		eImageFormat = CCImage::kFmtTiff;
	else if (std::string::npos != lowerCase.find(".webp"))
		eImageFormat = CCImage::kFmtWebp;
	
	return eImageFormat;
}

void LoadUrlImage::onLoadCompleted(cocos2d::extension::CCHttpClient *sender, cocos2d::extension::CCHttpResponse *response){
	if (!response)
		return;

	int statusCode = response->getResponseCode();	
	CCLog("response code: %d", statusCode);

	if (!response->isSucceed()) 
	{
		CCLog("response failed");
		CCLog("error buffer: %s", response->getErrorBuffer());
		return;
	}
	std::string pathKey = "url_";
	pathKey += response->getHttpRequest()->getTag();	
	
	std::vector<char> *buffer = response->getResponseData();		
	std::string bufffff(buffer->begin(),buffer->end());

	CCImage* pImage = new CCImage();
	bool bRet = pImage->initWithImageData((void*)bufffff.c_str(),buffer->size(),getImageFormat(pathKey));
	if(!bRet){
		CCLog("LoadUrlImage::onLoadCompleted -->initWithImageData fail");
		return;
	}
		
	const char* imageKsy = pathKey.c_str();
	CCTexture2D * texture2d = CCTextureCache::sharedTextureCache()->addUIImage(pImage,imageKsy);
	int cbIndex = (int)(response->getHttpRequest()->getUserData());
	if (texture2d)
	{
		CCLog("load urlImage succeed");		
		callJsFunction(cbIndex,imageKsy);
	}
	else
	{
		CCLog("load urlImage fail");
		callJsFunction(cbIndex,nullptr);
	}	
	CC_SAFE_RELEASE(pImage);
}