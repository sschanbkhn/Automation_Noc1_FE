import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import Net_ManufacturersService from "services/Net_ManufacturersService";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id:String, dispatch:any) =>  {  
        if(id)
        {      
            let res:IResponseMessage = await Net_ManufacturersService.GetItem(id);               
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
                Name: "",
                Nation: ""
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_ManufacturersService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch:any) => {        
        let res:IResponseMessage = await Net_ManufacturersService.UpdateItem(item);               
        return res;
    }
}