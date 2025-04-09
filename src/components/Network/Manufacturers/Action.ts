import { IResponseMessage } from "models/Apps";
import Net_ManufacturersService from "services/Net_ManufacturersService";

export const Actions: any = { 
    GetItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await Net_ManufacturersService.GetItems();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data.Items
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await Net_ManufacturersService.DeleteById(id);               
        return res;
    }
}