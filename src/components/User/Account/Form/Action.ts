import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import UserService from "services/UserService";
import RoleService from "services/RoleService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, treeId: String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await UserService.GetItem(id);               
            if(res && res.Success)
            {          
                res.Data.ParentId = treeId;           
                dispatch({
                    type: "GetItem",
                    item: res.Data
                })
            }          
        }
        else
        {
            let itemNew: IModelItem = { 
                Id: Guid.Empty,
                FullName: "",
                UserName: "",
                Email: "",
                PassWord: "",
                Phone: "",
                Address: "",
                IsActive: true,
                RoleId: "",
                OrgainId: treeId,
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, organId: any, roleId: any, dispatch:any) => {   
        if(!organId)        
            organId = Guid.Empty;        
        if(!roleId)        
            roleId = Guid.Empty;        
        let res:IResponseMessage = await UserService.CreateItem(item, organId, roleId);               
        return res;
    },
    UpdateItem: async (item: IModelItem, organId: any, roleId: any, dispatch:any) => {      
        if(!organId)        
            organId = Guid.Empty;        
        if(!roleId)        
            roleId = Guid.Empty;  
        let res:IResponseMessage = await UserService.UpdateItem(item, organId, roleId);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, userName: any, email: any, dispatch:any) => {        
        let res:IResponseMessage = await UserService.CheckDuplicateAttributes(id, userName, email);               
        return res;
    },
    GetCategories: async (key:any, dispatch:any) => {        
        let res:IResponseMessage = await RoleService.GetCategories();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetCategories",
                key: key,
                items: res.Data
            })
        }          
        return res;
    }
}