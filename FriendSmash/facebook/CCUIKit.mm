//
//  CCUIKit.cpp
//  GreTest
//
//  Created by lyy on 13-7-23.
//
//

#include "CCUIKit.h"
#include "AppDelegate.h"
#include "CCUIFaceBook.h"
#include "FacebookInterface.h"


static CCUIKit * g_CCUIKit = NULL;
using namespace std;

CCUIKit::CCUIKit()
{
    ;
}
CCUIKit::~CCUIKit()
{
    ;
}
CCUIKit * CCUIKit::shareCCUIKit()
{
    if (!g_CCUIKit)
    {
        g_CCUIKit = new CCUIKit();
    }
    return g_CCUIKit;
}

void CCUIKit::setCCUIKit(CCUIKit * aCCUIKit)
{
    g_CCUIKit = aCCUIKit;
}

bool CCUIKit::initFacebook()
{
    return [[CCUIFaceBook shareCCUIFaceBook] initFacebook];
}

bool CCUIKit::logInFacebook(int cbIndex,const char* scope)
{
    NSString * aScope = @"";
    return [[CCUIFaceBook shareCCUIFaceBook] logInFacebook:cbIndex Scope:aScope];
}
bool CCUIKit::logInFacebookCallBack(int cbIndex,const char*  logInfo)
{
    FacebookInterface::callbackJs(cbIndex,logInfo);
    
    return true;
}
const char * CCUIKit::logOutFacebook(int cbIndex)
{
    [[CCUIFaceBook shareCCUIFaceBook] logOutFacebook:cbIndex];
    return "null";
}
const char * CCUIKit::getActiveSessionState(int cbIndex,bool force)
{
    FacebookInterface::callbackJs(cbIndex, CCUIKit::shareCCUIKit()->getActiveSessionState(cbIndex,[[[CCUIFaceBook shareCCUIFaceBook] getActiveSessionState:cbIndex Force:force] UTF8String]));
    return "";
}
////////////////////////////////////////////////////

string CCUIKit::requestWithGraphPath(const char * graphPath, const char * method, const char * parameters,int cbIndex)
{
    NSString * iosGraphPath = [NSString stringWithUTF8String:graphPath];
    NSString * iosMethod = [NSString stringWithUTF8String:method];
    NSString * iosParameters = [NSString stringWithUTF8String:parameters];

    return [[[CCUIFaceBook shareCCUIFaceBook] requestWithGraphPath:iosGraphPath
                                                        HTTPMethod:iosMethod
                                                        Parameters:iosParameters
                                                     index:cbIndex] UTF8String];
   
}
void CCUIKit::requestApiCallBack(int cbIndex,const char * JsonString)
{
    FacebookInterface::callbackJs(cbIndex, JsonString);
}
////////////////////////////////////////////////////
void CCUIKit::ui(const char* params,int cbIndex)
{
    NSString * iosParams = [NSString stringWithUTF8String:params];
    
    [[CCUIFaceBook shareCCUIFaceBook] UI:iosParams Index:cbIndex];
	
}
void CCUIKit::uiCallBack(int  cbIndex,const char * result)
{
   FacebookInterface::callbackJs(cbIndex,result);
}
void CCUIKit::WebDialogsCallBack(const char *  resultURL,int result)
{
    ;
}
void CCUIKit::webDialogsWillPresentDialog(const char *dialog,const char *parameters,const char  *session)
{
    ;
}
void CCUIKit::webDialogsWillDismissDialog(const char *dialog,const char *parameters,const char  *session,int result,const char  *url)
{
    ;
}

