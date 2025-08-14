import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Sys_Resource = "Sys_Resource";
const ResourceService = {  
    GetFunc: async () => {
      let res:any = await request({
        url: `/${Sys_Resource}/FuncTree`,
        method: 'get'
      })
      return res;
    },
    GetMenu: async () => {
      let res:any = await request({
        url: `/${Sys_Resource}/MenuTree`,
        method: 'get'
      })
      return res;
    },    
    InitFunc: async () => {
      let res:any = await request({
        url: `/${Sys_Resource}/InitFunc`,
        method: 'post'
      })
      return res;
    },
    InitMenu: async (data:any) => {
      let res:any = await request({
        url: `/${Sys_Resource}/InitMenu`,
        method: 'post',
        data
      })
      return res;
    },
    RemoveAllFunc: async () => {
      let res:any = await request({
        url: `/${Sys_Resource}/All/Func`,
        method: 'delete'
      })
      return res;
    },
    RemoveAllMenu: async () => {
      let res:any = await request({
        url: `/${Sys_Resource}/All/Menu`,
        method: 'delete'
      })
      return res;
    }   
}
export default ResourceService
