facebook-jsb-sdk-samples
========================

This cross-platform project implements Facebook's friend smash game using pure Javascript. The same code can be deployed to iOS and Android using Cocos2d-x/JSB, and to browser using Cocos2d-x-html5. 

Download
-------------

```shell
$ cd facebook-jsb-sdk-samples
$ git submodule update --init
$ cd cocos2dx
$ git submodule update --init
```	

iOS build
-------------

Open FriendSmash/proj.ios/FriendSmash.xcodeproj in Xcode. Build and run. 


Android build
-------------

```shell
$ cd FriendSmash/proj.android
$ export NDK_ROOT=*path_to_ndk*	
$ android list target
$ android update project -p . -t *device_type_id*
$ android update project -p ../../cocos2d-x/cocos2dx/platform/android/java/ -t *device_type_id*
$ android update project -p ../../facebook-jsb-sdk/FB-Android-JSB/facebook-android-sdk-3.5  -t *device_type_id*
$ ./build_native.sh
$ ant debug install
```	

HTML5 build
-------------

```shell
$ cd FriendSmash/proj.html5
$ sudo python -m SimpleHTTPServer 80   // NEED port 80 to make Facebook Auth work on localhost
```

... and then open this url in a browser: http://localhost


