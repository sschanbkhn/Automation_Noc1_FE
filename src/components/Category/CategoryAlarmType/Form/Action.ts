import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import Net_AlarmTypeService from "services/Net_AlarmTypeService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await Net_AlarmTypeService.GetItem(id);               
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
                Name: ""
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_AlarmTypeService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_AlarmTypeService.UpdateItem(item);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, code: any, dispatch:any) => {        
        let res:IResponseMessage = await Net_AlarmTypeService.CheckDuplicateAttributes(id, code);               
        return res;
    }
}