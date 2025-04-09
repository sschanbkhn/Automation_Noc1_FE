import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Net_Manufacturers = "Net_Manufacturers";
const Net_ManufacturersService = {    
    GetItems: async () => {        
        let res:any = await request({
            url: `/${Net_Manufacturers}/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Net_Manufacturers}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Net_Manufacturers}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_Manufacturers}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_Manufacturers}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {    
        var data = [{ Id: id }]    
        let res:any = await request({
            url: `/${Net_Manufacturers}`,
            method: 'delete',
            data: data              
        });
        return res
    }
}
export default Net_ManufacturersService
