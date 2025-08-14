import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Sys_Role = "Sys_Role";
const RoleService = {    
    GetItems: async () => {        
        let res:any = await request({
            url: `/${Sys_Role}/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Sys_Role}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Sys_Role}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Sys_Role}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Sys_Role}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {        
        let res:any = await request({
            url: `/${Sys_Role}/DeleteById/${id}`,
            method: 'delete'            
        });
        return res
    },
    CheckDuplicateAttributes: async (id:any, code:any) => {
        let res:any = await request({
          url: `/${Sys_Role}/CheckDuplicateAttributes?Id=${id}&Code=${code}`,
          method: 'get'
        })
        return res;
    }
}
export default RoleService
