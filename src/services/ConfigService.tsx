import request from "helpers/request"
const Sys_Config = "Sys_Config";
const ConfigService = {    
    GetItems: async (type:any) => {        
        let res:any = await request({
            url: `/${Sys_Config}/1/1000/1000/${type}`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Sys_Config}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Sys_Config}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Sys_Config}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Sys_Config}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {        
        var data = [{ Id: id }]
        let res:any = await request({
            url: `/${Sys_Config}`,
            method: 'delete',
            data: data      
        });
        return res
    },
    CheckDuplicateAttributes: async (id:any, code:any, type:any) => {
        let res:any = await request({
          url: `/${Sys_Config}/CheckDuplicateAttributes?Id=${id}&Code=${code}&Type=${type}`,
          method: 'get'
        })
        return res;
    }
}
export default ConfigService
