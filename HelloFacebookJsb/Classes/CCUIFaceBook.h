//
//  CCUIFaceBook.h
//  GreTest
//
//  Created by lyy on 13-7-23.
//
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UIKit.h>
#import "CCUIKit.h"
#import <FacebookSDK/FacebookSDK.h>
#import "AppController.h"



@interface CCUIFaceBook : NSObject <FBLoginViewDelegate,FBWebDialogsDelegate>
{
    int indexNUm;
    
    NSString * _token;
    NSString * _userID;
    NSString * _expiresIn;
    NSString * _signedRequest;
    NSString * _status;
    NSString * _logInfo;
}

@property (strong, nonatomic) CCUIFaceBook * g_CCUIFaceBook;
@property (strong, nonatomic) FBProfilePictureView *profilePic;
@property (strong, nonatomic) id<FBGraphUser> loggedInUser;
@property (strong, nonatomic) FBSession *session;
@property (strong, nonatomic) NSString * token;
@property (strong, nonatomic) NSString * userID;
@property (strong, nonatomic) NSString * expiresIn;
@property (strong, nonatomic) NSString * signedRequest;
@property (strong, nonatomic) NSString * status;
@property (strong, nonatomic) NSString * logInfo;

+ (CCUIFaceBook *)shareCCUIFaceBook;
- (bool)initFacebook;
- (bool)logInFacebook:(int)tag Scope:(NSString *)scope;
- (NSString *)logOutFacebook:(int)tag;
- (NSString *)getActiveSessionState:(int)cbIndex Force:(bool)force;
- (NSString *)intervalSinceNow: (NSDate *) d;
////////////////////
- (NSString *)requestWithGraphPath:(NSString *)graphPath HTTPMethod:(NSString *)method Parameters:(NSString *)parameters index:(int)cbIndex;
- (void)requestApiCallBack:(int)cbIndex Info:(NSString *) JsonString;
/////////////////
-(void)UI:(NSString *)paramStr Index:(int)cbIndex;

@end