import { IResponseMessage } from "models/Apps";
import RoleService from "services/RoleService";

export const Actions: any = { 
    GetItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await RoleService.GetItems();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data.Items
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await RoleService.DeleteById(id);               
        return res;
    }
}