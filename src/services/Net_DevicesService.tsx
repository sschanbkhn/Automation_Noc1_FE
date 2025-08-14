import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Net_Devices = "Net_Devices";
const Net_DevicesService = {    
    GetList: async (organ_id:any) => {        
        let res:any = await request({
            url: `/${Net_Devices}/GetList/${organ_id}/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetItems: async () => {        
        let res:any = await request({
            url: `/${Net_Devices}/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Net_Devices}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Net_Devices}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_Devices}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_Devices}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {    
        var data = [{ Id: id }]    
        let res:any = await request({
            url: `/${Net_Devices}`,
            method: 'delete',
            data: data              
        });
        return res
    },
    CheckDuplicateAttributes: async (id:any, code:any) => {
        let res:any = await request({
          url: `/${Net_Devices}/CheckDuplicateAttributes?Id=${id}&Code=${code}`,
          method: 'get'
        })
        return res;
    }
}
export default Net_DevicesService
