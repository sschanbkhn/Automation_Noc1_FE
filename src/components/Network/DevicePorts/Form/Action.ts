import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import Net_DevicePortsService from "services/Net_DevicePortsService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await Net_DevicePortsService.GetItem(id);               
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
                DeviceId: "",
                SerialPort: "",
                PortFormat: "",
                Name: "",
                Type: "",
                MaxSpeed: 0,
                Status: ""
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicePortsService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicePortsService.UpdateItem(item);               
        return res;
    }
}