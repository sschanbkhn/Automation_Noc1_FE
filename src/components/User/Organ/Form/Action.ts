import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import CategoryService from "services/CategoryService";
import OrganService from "services/OrganService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, treeId: String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await OrganService.GetItem(id);               
            if(res && res.Success)
            {          
                res.Data.ParentId = treeId;   
                if(res.Data.PermFeature) {
                    res.Data.PermFeature = res.Data.PermFeature.split(",");  
                }
                if(res.Data.PermWorkFlow) {
                    res.Data.PermWorkFlow = res.Data.PermWorkFlow.split(",");  
                }
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
                Type: null,
                ParentId: treeId
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await OrganService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await OrganService.UpdateItem(item);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, code: any, parentId: any, dispatch:any) => {        
        let res:IResponseMessage = await OrganService.CheckDuplicateAttributes(id, code, parentId);               
        return res;
    }
}