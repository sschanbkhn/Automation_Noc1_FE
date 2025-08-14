import request from "helpers/request"
const Sys_Permission = "Sys_Permission";
const PermissionService = {  
    SaveWithRoleId: async (data:any, roleId:any, isFunc:any) => {
      let res:any = await request({
        url: `/${Sys_Permission}/Save?roleId=${roleId}&isFunc=${isFunc}`,
        method: 'post',
        data
      })
      return res;
    },
    GetByRoleId: async (roleId:any, isFunc:any) => {
      let res:any = await request({
        url: `/${Sys_Permission}/GetByRoleId?roleId=${roleId}&isFunc=${isFunc}`,
        method: 'get'
      })
      return res;
    },    
    GetMenusByRoles: async (data:any) => {
      let res:any = await request({
        url: `/${Sys_Permission}/GetMenusByRoles`,
        method: 'post',
        data
      })
      return res;
    }
}
export default PermissionService
