import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Net_ConfigurationLogs = "Net_ConfigurationLogs";
const Net_ConfigurationLogsService = {    
    GetList: async () => {        
        let res:any = await request({
            url: `/${Net_ConfigurationLogs}/GetList/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetItems: async () => {        
        let res:any = await request({
            url: `/${Net_ConfigurationLogs}/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Net_ConfigurationLogs}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Net_ConfigurationLogs}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_ConfigurationLogs}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_ConfigurationLogs}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {    
        var data = [{ Id: id }]    
        let res:any = await request({
            url: `/${Net_ConfigurationLogs}`,
            method: 'delete',
            data: data              
        });
        return res
    }
}
export default Net_ConfigurationLogsService
