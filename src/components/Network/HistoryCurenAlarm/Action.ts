import { IResponseMessage } from "models/Apps";
import Net_DevicesService from "services/Net_DevicesService";
import Net_HistoryCurenAlarmService from "services/Net_HistoryCurenAlarmService";

export const Actions: any = { 
    GetItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await Net_HistoryCurenAlarmService.GetList();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await Net_HistoryCurenAlarmService.DeleteById(id);               
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