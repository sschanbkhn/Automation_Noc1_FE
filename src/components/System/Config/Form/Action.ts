import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import ConfigService from "services/ConfigService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await ConfigService.GetItem(id);               
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
                Value: "",
                Type: "0"
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await ConfigService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await ConfigService.UpdateItem(item);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, code: any, type:any, dispatch:any) => {        
        let res:IResponseMessage = await ConfigService.CheckDuplicateAttributes(id, code, type);               
        return res;
    }
}