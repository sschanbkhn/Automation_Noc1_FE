import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import Net_CableManagementService from "services/Net_CableManagementService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await Net_CableManagementService.GetItem(id);               
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
                CableCode: "",
                CableType: 0,
                LineId: "",
                HeadDeviceId: "",
                LastDeviceId: "",
                SetPoint: "",
                ManageOrgan: "",
                ManagerName: "",
                ManagerTel: "",
                ManagerEmail: ""
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_CableManagementService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_CableManagementService.UpdateItem(item);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, code: any, dispatch:any) => {        
        let res:IResponseMessage = await Net_CableManagementService.CheckDuplicateAttributes(id, code);               
        return res;
    }
}