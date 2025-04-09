import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Net_DeviceTypes = "Net_DeviceTypes";
const Net_DeviceTypesService = {    
    GetItems: async () => {        
        let res:any = await request({
            url: `/${Net_DeviceTypes}/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Net_DeviceTypes}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Net_DeviceTypes}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_DeviceTypes}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_DeviceTypes}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {    
        var data = [{ Id: id }]    
        let res:any = await request({
            url: `/${Net_DeviceTypes}`,
            method: 'delete',
            data: data              
        });
        return res
    }
}
export default Net_DeviceTypesService
