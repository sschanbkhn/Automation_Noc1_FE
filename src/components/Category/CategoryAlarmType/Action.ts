import { IResponseMessage } from "models/Apps";
import CategoryService from "services/CategoryService";
import AlarmTypeService from "services/Net_AlarmTypeService";

export const Actions: any = { 
    GetItems: async (dispatch:any)  =>  {
        let res:IResponseMessage = await AlarmTypeService.GetList();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await AlarmTypeService.DeleteById(id);               
        return res;
    },
    GetItem_LevelId: async (dispatch:any) => {        
        let res:IResponseMessage = await CategoryService.GetItems(1);     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_LevelId",
                items: res.Data.Items
            })
        }          
        return res;
    },
}