import { IResponseMessage } from "models/Apps";
import Net_DevicesService from "services/Net_DevicesService";
import Net_DevicePortsService from "services/Net_DevicePortsService";
import Net_NetworkLinksService from "services/Net_NetworkLinksService";
export const Actions: any = { 
    GetItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await Net_NetworkLinksService.GetList();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await Net_NetworkLinksService.DeleteById(id);               
        return res;
    },
    GetItem_Device: async (dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicesService.GetCategories();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_DeviceHead",
                items: res.Data
            })
            dispatch({
                type: "GetItem_DeviceLast",
                items: res.Data
            })
        }          
        return res;
    },
    GetItem_DevicePort: async (dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicePortsService.GetCategories();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_DevicePortHead",
                items: res.Data
            })
            dispatch({
                type: "GetItem_DevicePortLast",
                items: res.Data
            })
        }          
        return res;
    },
}