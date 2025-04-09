import { IResponseMessage } from "models/Apps";
import Net_DevicesService from "services/Net_DevicesService";
import Net_CurenAlarmService from "services/Net_CurenAlarmService";

export const Actions: any = { 
    GetItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await Net_CurenAlarmService.GetList();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await Net_CurenAlarmService.DeleteById(id);               
        return res;
    },
    GetItem_Device: async (dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicesService.GetCategories();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_Device",
                items: res.Data
            })
        }          
        return res;
    },
}