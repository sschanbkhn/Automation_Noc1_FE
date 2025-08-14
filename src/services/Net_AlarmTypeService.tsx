import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Net_AlarmType = "Net_AlarmType";
const Net_AlarmTypeService = {    
    GetList: async () => {        
        let res:any = await request({
            url: `/${Net_AlarmType}/GetList/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetItems: async () => {        
        let res:any = await request({
            url: `/${Net_AlarmType}/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Net_AlarmType}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Net_AlarmType}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_AlarmType}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_AlarmType}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {    
        var data = [{ Id: id }]    
        let res:any = await request({
            url: `/${Net_AlarmType}`,
            method: 'delete',
            data: data              
        });
        return res
    },
    CheckDuplicateAttributes: async (id:any, code:any) => {
        let res:any = await request({
          url: `/${Net_AlarmType}/CheckDuplicateAttributes?Id=${id}&Code=${code}`,
          method: 'get'
        })
        return res;
    }
}
export default Net_AlarmTypeService
