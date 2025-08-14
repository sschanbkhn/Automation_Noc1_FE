import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import CategoryService from "services/CategoryService";
import { CategoryType } from "../InitState";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await CategoryService.GetItem(id);               
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
                Description: "",
                Type: CategoryType
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await CategoryService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await CategoryService.UpdateItem(item);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, code: any, type: any, dispatch:any) => {        
        let res:IResponseMessage = await CategoryService.CheckDuplicateAttributes(id, code, type);               
        return res;
    }
}