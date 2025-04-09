import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import Net_DevicesService from "services/Net_DevicesService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await Net_DevicesService.GetItem(id);               
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
                Code: "",
                Name: "",
                Lon: "", 
                Lat: "",
                Description: "",
                DeviceTypeId: Guid.Empty,
                ManufacturerId: Guid.Empty,
                FirmwareVersion: "",
                IPAddress: "",
                MACAddress: "",
                SerialNumber: "", 
                OrganId: Guid.Empty,
                NumberOfNetPorts: 0
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicesService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicesService.UpdateItem(item);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, code: any, dispatch:any) => {        
        let res:IResponseMessage = await Net_DevicesService.CheckDuplicateAttributes(id, code);               
        return res;
    }
}