import { IResponseMessage } from "models/Apps";
import UserService from "services/UserService";
import OrganService from "services/OrganService";
export const Actions: any = { 
    GetItems: async (organId:any, dispatch:any)  =>  {
        let res:IResponseMessage = await UserService.GetByOrganId(organId);               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }                       
    },
    GetItemsAndSearch: async (loginName:any, isActive:any, dispatch:any)  =>  {
        let res:IResponseMessage = await UserService.GetItems(loginName, isActive);               
        if(res && res.Success)
        {                       
            dispatch({
                type: "GetItems",
                items: res.Data.Items
            })
        }                       
    },
    getTree: async (dispatch:any) => {
        let res:IResponseMessage = await OrganService.GetTree();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetTree",
                tree: res.Data
            })
        }    
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await UserService.DeleteById(id);               
        return res;
    }
}