import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import Net_ConfigurationLogsService from "services/Net_ConfigurationLogsService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await Net_ConfigurationLogsService.GetItem(id);               
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
        let res:IResponseMessage = await Net_ConfigurationLogsService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_ConfigurationLogsService.UpdateItem(item);               
        return res;
    }
}