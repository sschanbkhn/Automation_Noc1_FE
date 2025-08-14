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
        let userRes:IResponseMessage = await UserService.SocialLogin(inputSocialLogin); 
        if(userRes && userRes.Success)
        {
            if(userRes.Data === false)
            {
                return false;
            }
            else
            {
                let permRes:IResponseMessage = await PermissionService.GetMenusByRoles(userRes.Data.Roles);
                let menus = [];
                if(permRes && permRes.Success)
                {
                    menus = permRes.Data.Menus;                
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
                Cookie.setCookie("UserInfo", JSON.stringify(userInfo), null)
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
        let userRes:IResponseMessage = await UserService.Login(inputLogin);        
        if(userRes && userRes.Success)
        {
            let permRes:IResponseMessage = await PermissionService.GetMenusByRoles(userRes.Data.Roles);
            let menus = [];
            if(permRes && permRes.Success)
            {
                menus = permRes.Data.Menus;                
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
            Cookie.setCookie("UserInfo", JSON.stringify(userInfo), null)
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
        let res:IResponseMessage = await PermissionService.GetMenusByRoles(roles);        
        return res;      
    }
}