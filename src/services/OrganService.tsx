import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Sys_Organization = "Sys_Organization";
const OrganService = {  
    GetTree: async () => {
      let res:any = await request({
        url: `/${Sys_Organization}/Tree`,
        method: 'get'
      })
      return res;
    }, 
    GetTreeList: async () => {
      let res:any = await request({
        url: `/${Sys_Organization}/TreeList`,
        method: 'get'
      })
      return res;
    },      
    GetByParentId: async (parentId:any) => {
        let res:any = await request({
          url: `/${Sys_Organization}/List/${parentId}`,
          method: 'get'
        })
        return res;
    },
    GetItem: async (id:String) => {        
      let res:any = await request({
          url: `/${Sys_Organization}/${id}`,
          method: 'get'
      });
      return res
    },    
    DeleteById: async (id:any) => {
        let res:any = await request({
          url: `/${Sys_Organization}/DeleteById/${id}`,
          method: 'delete'
        })
        return res;
    },
    CreateItem: async (data:any) => {        
      let res:any = await request({
          url: `/${Sys_Organization}`,
          method: 'post',
          data
      });
      return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Sys_Organization}`,
            method: 'put',
            data
        });
        return res
    },   
    CheckDuplicateAttributes: async (id:any, code:any, parentId:any) => {
      let res:any = await request({
        url: `/${Sys_Organization}/CheckDuplicateAttributes?Id=${id}&Code=${code}&ParentId=${parentId}`,
        method: 'get'
      })
      return res;
    }     
}
export default OrganService
