import { Cookie } from "helpers/cookie";
import { IResponseMessage, IUserInfo } from "models/Apps";
import UserService from "services/UserService";
import PermissionService from "services/PermissionService";
import { HubConnectionBuilder } from "@microsoft/signalr";

export const Actions: any = {
    ChangeLoading: (isLoading: boolean) => async (dispatch:any, getState:any) =>  {
        dispatch({
            type: "ChangeLoading",
            isLoading: isLoading
        })
    },
    SendEmailRestorePassword: (address:any, email:any) => async (dispatch:any, getState:any) => {
        let res:IResponseMessage = await UserService.SendEmailRestorePassword(address, email);  
        return res;
    },
    UserSocialLogin:(inputSocialLogin: any) => async (dispatch:any, getState:any) =>  {
        let isLogged = false;
        //console.log('🌐 UserSocialLogin called with:', inputSocialLogin);
        let userRes:IResponseMessage = await UserService.SocialLogin(inputSocialLogin); 
        console.log('📱 Social login response:', userRes);
        if(userRes && userRes.Success)
        {
            if(userRes.Data === false)
            {
                //console.log('❌ Social login failed - user not exists');
                return false;
            }
            else
            {
                console.log('🎭 Social user roles:', userRes.Data.Roles);
                let permRes:IResponseMessage = await PermissionService.GetMenusByRoles(userRes.Data.Roles);
                //console.log('📋 Social GetMenusByRoles response:', permRes);
                let menus = [];
                if(permRes && permRes.Success)
                {
                    menus = permRes.Data.Menus;                
                    console.log('🍕 Social user menus:', menus);
                }            
                let accessToken = userRes.Data.AccessToken;
                Cookie.setCookie("Token", accessToken, null);
                let userInfo:IUserInfo = {
                    Roles: userRes.Data.Roles,
                    UserId: userRes.Data.UserId,
                    UserName: userRes.Data.UserName,
                    RoleName: userRes.Data.RoleName,
                    Menus: menus
                }
                console.log('👤 Final Social UserInfo:', userInfo);
                Cookie.setCookie("UserInfo", JSON.stringify(userInfo), null)
                console.log('🍪 Social UserInfo saved to cookie');
                dispatch({
                    type: "ChangeAuthentication",
                    isAuthenticated: true
                })
                return true;
            }
        }
        return isLogged;
    },
    UserLogin: (inputLogin: any) => async (dispatch:any, getState:any) =>  {
        //console.log('🔐 UserLogin called with:', inputLogin);
        let userRes:IResponseMessage = await UserService.Login(inputLogin);        
        //console.log('📝 Login response:', userRes);
        if(userRes && userRes.Success)
        {
            //console.log('🎭 User roles:', userRes.Data.Roles);
            let permRes:IResponseMessage = await PermissionService.GetMenusByRoles(userRes.Data.Roles);
            //console.log('📋 GetMenusByRoles response:', permRes);
            let menus = [];
            if(permRes && permRes.Success)
            {
                menus = permRes.Data.Menus;                
                //console.log('🍕 User menus:', menus);
            }            
            let accessToken = userRes.Data.AccessToken;
            Cookie.setCookie("Token", accessToken, null);
            let userInfo:IUserInfo = {
                Roles: userRes.Data.Roles,
                UserId: userRes.Data.UserId,
                UserName: userRes.Data.UserName,
                RoleName: userRes.Data.RoleName,
                Menus: menus
            }
            console.log('👤 Final UserInfo:', userInfo);
            Cookie.setCookie("UserInfo", JSON.stringify(userInfo), null)
            //console.log('🍪 UserInfo saved to cookie');
            dispatch({
                type: "ChangeAuthentication",
                isAuthenticated: true
            })
        }                
    },
    UserLogout: () => async (dispatch:any, getState:any) =>  {
        Cookie.deleteCookie("Token");
        Cookie.deleteCookie("UserInfo");
        dispatch({
            type: "ChangeAuthentication",
            isAuthenticated: false
        })
    },    
    GetUserInfo: () => async (dispatch:any, getState:any) =>  {
        let res:IResponseMessage = await UserService.Info();               
        if(res && res.Success)
        {           
            return res.Data;
        }               
        return null;
    },  
    EditUserInfo: (inputProfile: any) => async (dispatch:any, getState:any) =>  {
        let res:IResponseMessage = await UserService.EditInfo(inputProfile);            
        return res;
    }, 
    ChangePassword: (inputChangePassword: any) => async (dispatch:any, getState:any) =>  {
        let res:IResponseMessage = await UserService.ChangePassword(inputChangePassword);            
        return res;
    },  
    ChangePasswordNew: (inputChangePasswordNew: any) => async (dispatch:any, getState:any) =>  {
        let res:IResponseMessage = await UserService.ChangePasswordNew(inputChangePasswordNew);            
        return res;
    },            
    UserSignup: (inputSignup: any) => async (dispatch:any, getState:any) =>  {
        let res:IResponseMessage = await UserService.Signup(inputSignup);              
        return res;      
    },
    GetMenusByRoles: (roles: any) => async (dispatch:any, getState:any) =>  {
        console.log('📋 GetMenusByRoles action called with roles:', roles);
        let res:IResponseMessage = await PermissionService.GetMenusByRoles(roles);        
        console.log('📋 GetMenusByRoles action response:', res);
        return res;      
    }
}