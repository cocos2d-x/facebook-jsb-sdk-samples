facebook-jsb-sdk-samples
========================

Samples for Facebook jsb SDK

1. Download all submodules: 

$ cd facebook-jsb-sdk-samples
$ git submodule update --init

$ cd cocos2dx
$ git submodule update --init
	


2. Build iOS version:

Open FriendSmash/proj.ios/FriendSmash.xcodeproj in Xcode. Build and run. 

	
	
3. Build Android version from command line:  

$ cd FriendSmash/proj.android

export NDK_ROOT=/path/to/ndk	

$ android list target
$ android update project -p . -t *device_type_id*
$ android update project -p ../../cocos2d-x/cocos2dx/platform/android/java/ -t *device_type_id*
$ android update project -p ../../facebook-jsb-sdk/FB-Android-JSB/facebook-android-sdk-3.5  -t *device_type_id*

$ ./build_native.sh

$ ant debug install