import { IModelItem } from "components/User/Role/InitState";
import request from "helpers/request"
const Net_DevicePorts = "Net_DevicePorts";
const Net_DevicePortsService = {    
    GetList: async () => {        
        let res:any = await request({
            url: `/${Net_DevicePorts}/GetList/1/1000/1000`,
            method: 'get'
        });
        return res
    },
    GetListByDeviceId: async (deviceId:String) => {
        let res:any = await request({
            url: `/${Net_DevicePorts}/GetListByDeviceId?deviceId=${deviceId}`,
            method: 'get'
        });
        return res
    },
    GetCategories: async () => {        
        let res:any = await request({
            url: `/${Net_DevicePorts}/Categories`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id:String) => {        
        let res:any = await request({
            url: `/${Net_DevicePorts}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_DevicePorts}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data:any) => {        
        let res:any = await request({
            url: `/${Net_DevicePorts}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id:any) => {    
        var data = [{ Id: id }]    
        let res:any = await request({
            url: `/${Net_DevicePorts}`,
            method: 'delete',
            data: data              
        });
        return res
    }
}
export default Net_DevicePortsService
