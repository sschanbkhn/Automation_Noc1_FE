import { IResponseMessage } from "models/Apps";
import CategoryService from "services/CategoryService";

export const Actions: any = { 
    GetItems: async (type:any,dispatch:any)  =>  {
        let res:IResponseMessage = await CategoryService.GetItems(type);               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data.Items
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await CategoryService.DeleteById(id);               
        return res;
    }
}