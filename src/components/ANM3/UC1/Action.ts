import { IResponseMessage } from "models/Apps";
import Net_ManufacturersService from "services/Net_ManufacturersService";
import Net_DeviceTypesService from "services/Net_DeviceTypesService";
import OrganService from "services/OrganService";
import Net_DevicesService from "services/Net_DevicesService";

export const Actions: any = { 
    GetTree: async (dispatch:any) => {
        let res:IResponseMessage = await OrganService.GetTree();               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetTree",
                tree: res.Data
            })
        }    
    },
    GetItemsByOrganId: async (organ_id:any, dispatch:any)  =>  {
        let res:IResponseMessage = await Net_DevicesService.GetList(organ_id);               
        if(res && res.Success)
        {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }                       
    },
    DeleteById: async (id:String, dispatch:any) => {                
        let res:IResponseMessage = await Net_DevicesService.DeleteById(id);               
        return res;
    },
    GetItem_DeviceType: async (dispatch:any) => {        
        let res:IResponseMessage = await Net_DeviceTypesService.GetItems();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_DeviceType",
                items: res.Data.Items
            })
        }          
        return res;
    },
    GetItem_Manufacturer: async (dispatch:any) => {        
        let res:IResponseMessage = await Net_ManufacturersService.GetItems();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_Manufacturer",
                items: res.Data.Items
            })
        }          
        return res;
    },
    GetItem_Organ: async (dispatch:any) => {        
        let res:IResponseMessage = await OrganService.GetTreeList();     
        if(res && res.Success)
        {
            dispatch({
                type: "GetItem_Organ",
                items: res.Data
            })
        }          
        return res;
    }
}