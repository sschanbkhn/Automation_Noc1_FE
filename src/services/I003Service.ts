import request from "helpers/request"

const I003_BNG = "I003_BNG";

const I003Service = {    
    GetBNGData: async () => {        
        let res: any = await request({
            url: `/${I003_BNG}/GetBNGData`,
            method: 'get'
        });
        return res
    },
    
    ClearOverLimitSession: async (ip: string) => {        
        let res: any = await request({
            url: `/${I003_BNG}/ClearOverLimitSession`,
            method: 'post',
            data: { ip: ip }
        });
        return res
    },
    
    CheckOneUser: async (username: string, ip: string) => {        
        let res: any = await request({
            url: `/${I003_BNG}/CheckOneUser`,
            method: 'post',
            data: { username: username, ip: ip }
        });
        return res
    },
    
    ClearOverLimitOneUser: async (username: string, ip: string) => {        
        let res: any = await request({
            url: `/${I003_BNG}/ClearOverLimitOneUser`,
            method: 'post',
            data: { username: username, ip: ip }
        });
        return res
    },
    
    ClearAllOneUser: async (username: string, ip: string) => {        
        let res: any = await request({
            url: `/${I003_BNG}/ClearAllOneUser`,
            method: 'post',
            data: { username: username, ip: ip }
        });
        return res
    }
}

export default I003Service