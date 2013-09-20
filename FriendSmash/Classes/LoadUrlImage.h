
#ifndef __LOAD_URL_IMAGE__
#define __LOAD_URL_IMAGE__

#include "cocos2d.h"
#include "cocos-ext.h"

class LoadUrlImage : public cocos2d::CCObject
{
public:
	static LoadUrlImage* getInstance();
	
	//download image from network and add to CCTextureCache,not save to disk
	static void loadUrlImage(const char* url,int cbIndex);

	//onHttpRequestCompleted
	void onLoadCompleted(cocos2d::extension::CCHttpClient *sender, cocos2d::extension::CCHttpResponse *response);
	
private:
	LoadUrlImage();
	static void callJsFunction(int cbIndex,const char* imageKey);

};


#endif