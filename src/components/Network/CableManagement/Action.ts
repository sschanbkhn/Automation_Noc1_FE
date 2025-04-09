import { IResponseMessage } from "models/Apps";
import Net_CableManagementService from "services/Net_CableManagementService";
import Net_DevicesService from "services/Net_DevicesService";
import Net_NetworkLinksService from "services/Net_NetworkLinksService";
export const Actions: any = { 
    GetItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await Net_CableManagementService.GetList();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await Net_CableManagementService.DeleteById(id);               
        return res;
    },
    GetItem_Device: async (dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicesService.GetCategories();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_HeadDevice",
                items: res.Data
            })
            dispatch({
                type: "GetItem_LastDevice",
                items: res.Data
            })
        }          
        return res;
    },
    GetItem_NetworkLinks: async (dispatch:any) => {        
        let res:IResponseMessage = await Net_NetworkLinksService.GetCategories();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_NetworkLinks",
                items: res.Data
            })
        }          
        return res;
    },
}