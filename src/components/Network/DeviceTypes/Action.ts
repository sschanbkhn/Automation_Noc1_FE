import { IResponseMessage } from "models/Apps";
import Net_DeviceTypesService from "services/Net_DeviceTypesService";

export const Actions: any = { 
    GetItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await Net_DeviceTypesService.GetItems();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data.Items
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await Net_DeviceTypesService.DeleteById(id);               
        return res;
    }
}