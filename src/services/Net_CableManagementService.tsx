import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Net_CableManagement = "Net_CableManagement";
const Net_CableManagementService = {    
    GetList: async () => {        
        let res:any = await request({
            url: `/${Net_CableManagement}/GetList/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetItems: async () => {        
        let res:any = await request({
            url: `/${Net_CableManagement}/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Net_CableManagement}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Net_CableManagement}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_CableManagement}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_CableManagement}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {    
        var data = [{ Id: id }]    
        let res:any = await request({
            url: `/${Net_CableManagement}`,
            method: 'delete',
            data: data              
        });
        return res
    },
    CheckDuplicateAttributes: async (id:any, code:any) => {
        let res:any = await request({
          url: `/${Net_CableManagement}/CheckDuplicateAttributes?Id=${id}&Code=${code}`,
          method: 'get'
        })
        return res;
    }
}
export default Net_CableManagementService
