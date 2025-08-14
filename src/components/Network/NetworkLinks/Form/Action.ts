import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import Net_NetworkLinksService from "services/Net_NetworkLinksService";
import Net_DevicePortsService from "services/Net_DevicePortsService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItems_HeadDevicePort: async (value:any,dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicePortsService.GetListByDeviceId(value);     
        if(res && res.Success)
        {
            return res.Data;
        }          
        return res;
    },
    GetItems_LastDevicePort: async (value:any,dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicePortsService.GetListByDeviceId(value);     
        if(res && res.Success)
        {
            return res.Data;
        }          
        return res;
    },
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await Net_NetworkLinksService.GetItem(id);               
            if(res && res.Success)
            {                       
                dispatch({
                    type: "GetItem",
                    item: res.Data
                })
            }          
        }
        else
        {
            let itemNew: IModelItem = { 
                Id: Guid.Empty,
                SerialNumber: "",
                Distance: 0,
                HeadDeviceId: "",
                HeadDevicePortId: "",
                LastDeviceId: "",
                LastDevicePortId: "",
                ConnectType: "",
                Speed: 0,
                Status: "",
                Note: ""
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_NetworkLinksService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_NetworkLinksService.UpdateItem(item);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, code: any, dispatch:any) => {        
        let res:IResponseMessage = await Net_NetworkLinksService.CheckDuplicateAttributes(id, code);               
        return res;
    }
}