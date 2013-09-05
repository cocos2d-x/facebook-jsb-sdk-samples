//
//  CCUIKit.h
//  GreTest
//
//  Created by lyy on 13-7-23.
//
//

#ifndef CCUIKit_h

#define CCUIKit_h

#include "cocos2d.h"
#include <string>
#include <map>

USING_NS_CC;

class CCUIKit : public CCLayer
{
    
public:
    
    CCUIKit();
    
    ~CCUIKit();
    
    CREATE_FUNC(CCUIKit);

    static CCUIKit * shareCCUIKit();
    void setCCUIKit(CCUIKit  * aCCUIKit);
    
    bool initFacebook();
    bool logInFacebook(int cbIndex,const char* scope);
    bool logInFacebookCallBack(int cbIndex,const char*  logInfo);
    const char * logOutFacebook(int cbIndex);
    const char * getActiveSessionState(int cbIndex,bool force);
////////////////////////////////////////////////
    std::string requestWithGraphPath(const char * graphPath, const char * method, const char * parameters,int cbIndex);
    void requestApiCallBack(int cbIndex,const char * JsonString);
//////////////////////////////////////////////
    void ui(const char* params,int cbIndex);
    void uiCallBack(int  cbIndex,const char * result);
    void WebDialogsCallBack(const char *  resultURL,int result);
    void webDialogsWillPresentDialog(const char *dialog,const char *parameters,const char  *session);
    void webDialogsWillDismissDialog(const char *dialog,const char *parameters,const char  *session,int result,const char  *url);
    
};



#endif