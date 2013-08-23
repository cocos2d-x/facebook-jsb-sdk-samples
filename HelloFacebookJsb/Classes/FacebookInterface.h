#ifndef  __INTERFACE_FACEBOOK_H_
#define  __INTERFACE_FACEBOOK_H_

#include "string"

class FacebookInterface
{
public:
	static void login(int cbIndex,const char* scope);
	static void logout(int cbIndex);
	static void getLoginStatus(int cbIndex,bool force);
	static std::string api(const char* graphPath,const char* method,const char* params,int cbIndex);
	static void ui(const char* params,int cbIndex);

};

#endif  //__INTERFACE_FACEBOOK_H_