//
//  CCUIFaceBook.cpp
//  GreTest
//
//  Created by lyy on 13-7-23.
//
//

#include "CCUIFaceBook.h"

#import "CCUIKit.h"

#import "EAGLView.h"
#import "AppDelegate.h"
#import <FacebookSDK/FacebookSDK.h>
#import <CoreLocation/CoreLocation.h>
#include <json.h>

using namespace std;

@implementation CCUIFaceBook
@synthesize loggedInUser = _loggedInUser;
@synthesize profilePic = _profilePic;
@synthesize session = _session;
@synthesize token = _token;
@synthesize userID = _userID;
@synthesize expiresIn = _expiresIn;
@synthesize signedRequest = _signedRequest;
@synthesize status = _status;
@synthesize logInfo = _logInfo;

- (id)init
{
    self = [super init];
    if (self)
    {
        
    }
    return self;
}

- (void)dealloc
{
    [super dealloc];
}
+ (CCUIFaceBook *)shareCCUIFaceBook
{
    static CCUIFaceBook * g_CCUIFaceBook;
    if (!g_CCUIFaceBook)
    {
        g_CCUIFaceBook = [[CCUIFaceBook alloc] init];
        
    }
    return  g_CCUIFaceBook;
}
-(bool)initFacebook
{
    [FBAppEvents activateApp];
    [FBAppCall handleDidBecomeActive]; 
    return true;
}

-(bool) logInFacebook:(int)tag Scope:(NSString *)scope
{
    methodTag = tag;

    if ([[FBSession activeSession] isOpen])
    {
        return false;
    }
    [FBSession openActiveSessionWithReadPermissions:@[@"basic_info"]
                                       allowLoginUI:YES
                                  completionHandler:^(FBSession *session,
                                                      FBSessionState status,
                                                      NSError *error)
                                  {
                                      self.session = session;

                                      std:: map<std::string, std::string> Info;
                                      self.token = session.accessTokenData.accessToken;
                                      Info["token"] = [_token UTF8String];
                                      self.userID = session.appID;
                                      NSDate * expiresData = (NSDate * )session.accessTokenData.expirationDate;
                                      self.expiresIn = [self intervalSinceNow: expiresData];
                                      NSArray * expiresArray = [self.expiresIn componentsSeparatedByString:@"."];
                                      self.expiresIn = expiresArray[0];
                                      NSArray * permissions = session.accessTokenData.permissions;
                                      self.signedRequest = @"";
                                      int state = session.state;
                                
                                      switch (state)
                                      {
                                          case FBSessionStateOpen:
                                              self.status = @"connected";
                                              break;
                                          case FBSessionStateClosedLoginFailed:
                                              self.status = @"not_authorized";
                                              break;
                                          case FBSessionStateClosed:
                                              self.status = @"unknown";
                                              break;
                                              
                                          default:
                                              break;
                                      }
                                      
                                      self.logInfo = [NSString stringWithFormat:@"{\"authResponse\":{\"accessToken\":\"%@\",\"userID\":\"%@\",\"expiresIn\":\"%@\",\"signedRequest\":\"%@\"},\"status\":\"%@\"}",self.token,self.userID,self.expiresIn,self.signedRequest,self.status];
                                      
                                      CCUIKit::shareCCUIKit()->logInFacebookCallBack(tag, [self.logInfo UTF8String]);
                                  }];
    return true;
}
- (NSString *)logOutFacebook:(int)tag
{
    if (![[FBSession activeSession] isOpen])
    {
        return self.logInfo;
    }
   
    [[FBSession activeSession] closeAndClearTokenInformation];
    return @"null";
}
- (NSString *)getActiveSessionState:(int)cbIndex Force:(bool)force
{
    return self.logInfo;
}
- (NSString *)intervalSinceNow: (NSDate *) d
{
    NSTimeInterval late=[d timeIntervalSince1970]*1;

    NSDate* dat = [NSDate dateWithTimeIntervalSinceNow:0];
    NSTimeInterval now=[dat timeIntervalSince1970]*1;
    NSString *timeString=@"";
    
    NSTimeInterval cha=late - now;
    timeString = [NSString stringWithFormat:@"%f", cha];

    [d release];
    return timeString;
}
/////////////////////////////
- (NSString *)requestWithGraphPath:(NSString *)graphPath HTTPMethod:(NSString *)method Parameters:(NSString *)parameters index:(int)cbIndex
{
    if ([parameters isEqualToString:@"{\"redirect\":false}"])
    {
        //parameters = @"{\"redirect\":\"false\"}";
    }
    
    if (!self.session)
    {
        return @"{\"message\":\"An active access token must be used to query information about the current user.\",\"type\":\"OAuthException\",\"code\": 2500}";
    }
    indexNUm  = cbIndex;
    id params = nil;
    if (![parameters isEqualToString:@"null"])
    {
       NSData * paramData = [parameters dataUsingEncoding:NSASCIIStringEncoding];
       NSError *error = nil;
       params = [NSJSONSerialization JSONObjectWithData:paramData
                                                            options:NSJSONReadingAllowFragments
                                                              error:&error];
        
        
    }
    if ([method isEqualToString:@"null"])
    {
        method = @"GET";
    }
    FBRequest* request = [FBRequest requestWithGraphPath:graphPath
                         parameters:params
                         HTTPMethod:method];
    
    [request startWithCompletionHandler:^(FBRequestConnection *connection,
                                          id result,
                                          NSError *error)
    {
        if (error)
        {
            [[CCUIFaceBook shareCCUIFaceBook] requestApiCallBack:cbIndex Info:[NSString stringWithFormat:@"{\"error\":\"%@\"}\"",[error domain]]];
            return ;
        }
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:result
                                                           options:NSJSONWritingPrettyPrinted
                                                             error:&error];
        NSString *jsonString = [[NSString alloc] initWithData:jsonData
                                                  encoding:NSUTF8StringEncoding];
        [[CCUIFaceBook shareCCUIFaceBook] requestApiCallBack:cbIndex Info:jsonString];
        
    }];
    return @"";
}
- (void)requestApiCallBack:(int) cbIndex Info:(NSString *) JsonString
{
    CCUIKit::shareCCUIKit()->requestApiCallBack(cbIndex,[JsonString UTF8String]);
}
//////////////////////////////
-(void)UI:(NSString *)paramStr Index:(int)cbIndex;
{
    NSData * paramData = [paramStr dataUsingEncoding:NSASCIIStringEncoding];
    NSError *error = nil;
    NSDictionary * aParameters = [NSJSONSerialization JSONObjectWithData:paramData
                                                                 options:NSJSONReadingAllowFragments
                                                                   error:&error];
    NSMutableDictionary * parameters = [[NSMutableDictionary alloc] initWithDictionary:aParameters copyItems:true];
    NSString * dialog = [parameters objectForKey:@"method"];
    [parameters removeObjectForKey:@"method"];
    
    [FBWebDialogs presentDialogModallyWithSession:self.session
                                           dialog:dialog
                                       parameters:parameters
                                          handler:^(FBWebDialogResult result,
                                                    NSURL * resultURL,
                                                    NSError *error)
     {
         CCUIKit::shareCCUIKit()->uiCallBack(cbIndex,"null");
     }
                                         delegate:self
     ];
}

#pragma mark - FBWebDialogsDelegate
- (void)webDialogsWillPresentDialog:(NSString *)dialog
                         parameters:(NSMutableDictionary *)parameters
                            session:(FBSession *)session
{
    NSString * params = @"";
    NSString * sessionStr = @"";
    CCUIKit::shareCCUIKit()->webDialogsWillPresentDialog([dialog UTF8String],[params  UTF8String],[sessionStr UTF8String]);
}

- (BOOL)webDialogsDialog:(NSString *)dialog
              parameters:(NSDictionary *)parameters
                 session:(FBSession *)session
     shouldAutoHandleURL:(NSURL *)url
{
    return true;
}


- (void)webDialogsWillDismissDialog:(NSString *)dialog
                         parameters:(NSDictionary *)parameters
                            session:(FBSession *)session
                             result:(FBWebDialogResult *)result
                                url:(NSURL **)url
                              error:(NSError **)error
{
    
    NSString * params = @"";
    NSString * sessionStr = @"";
    NSURL* aUrl = *url;
    NSString * urlStr = (NSString *)[aUrl absoluteString];
    FBWebDialogResult aResult = * result;

    CCUIKit::shareCCUIKit()->webDialogsWillDismissDialog([dialog UTF8String],[params UTF8String],[sessionStr UTF8String],(int )aResult,[urlStr UTF8String]);
}


@end