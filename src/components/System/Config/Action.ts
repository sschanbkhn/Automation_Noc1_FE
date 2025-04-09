import { IResponseMessage } from "models/Apps";
import ConfigService from "services/ConfigService";

export const Actions: any = { 
    GetItems: async (type:any, dispatch:any)  =>  {
        let res:IResponseMessage = await ConfigService.GetItems(type);               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data.Items
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await ConfigService.DeleteById(id);               
        return res;
    }
}