import { IResponseMessage } from "models/Apps";
import ResourceService from "services/ResourceService";
import RoleService from "services/RoleService";
import PermissionService from "services/PermissionService";
export const Actions: any = { 
    ResetMenu: async (data:any, dispatch:any) => {                
        let resRemove:IResponseMessage = await ResourceService.RemoveAllMenu();
        if(resRemove && resRemove.Success)
        {
            let resInit:IResponseMessage = await ResourceService.InitMenu(data);
            return resInit;
        }
        return null;
    },
    ResetFunc: async (dispatch:any) => {                
        let resRemove:IResponseMessage = await ResourceService.RemoveAllFunc();
        if(resRemove && resRemove.Success)
        {
            let resInit:IResponseMessage = await ResourceService.InitFunc();
            return resInit;
        }
        return null;
    },
    GetRolelItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await RoleService.GetItems();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetRoleItems",
                items: res.Data.Items
            })
        }                       
    },
    GetMenuItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await ResourceService.GetMenu();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetMenuItems",
                items: res.Data
            })
        }                       
    },
    GetFuncItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await ResourceService.GetFunc();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetFuncItems",
                items: res.Data
            })
        }                       
    },
    SaveWithRoleId: async (data:any, roleId:any, isFunc:any, dispatch:any) => {
        let res:IResponseMessage = await PermissionService.SaveWithRoleId(data, roleId, isFunc); 
        return res;
    },
    GetByRoleId: async (roleId:any, isFunc:any, dispatch:any) => {
        let res:IResponseMessage = await PermissionService.GetByRoleId(roleId, isFunc);    
        if(res && res.Success)
        {
            let resourceIds = [];
            for(let i = 0;i < res.Data.length;i++)
            {
                resourceIds.push(res.Data[i].ResourceId);
            }            
            if(isFunc == true)
            {
                dispatch({
                    type: "GetFuncChecked",
                    items: resourceIds
                })
            }
            else
            {
                dispatch({
                    type: "GetMenuChecked",
                    items: resourceIds
                })
            }
        }
    }
}