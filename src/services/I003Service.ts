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
    },
    
    GetDashboardData: async (fromDate?: string, toDate?: string) => {        
        let res: any = await request({
            url: `/${I003_BNG}/GetDashboardData`,
            method: 'get',
            params: { fromDate, toDate }
        });
        return res
    },
    
    GetLocationList: async () => {        
        let res: any = await request({
            url: `/${I003_BNG}/GetLocationList`,
            method: 'get'
        });
        return res
    },
    
    GetBNGDataByLocation: async (location: string, reportDate?: string) => {        
        let res: any = await request({
            url: `/${I003_BNG}/GetBNGDataByLocation`,
            method: 'get',
            params: { location, reportDate }
        });
        return res
    },
    
    GetSessionUserDashboardData: async (fromDate?: string, toDate?: string) => {        
        let res: any = await request({
            url: `/${I003_BNG}/GetSessionUserDashboardData`,
            method: 'get',
            params: { fromDate, toDate }
        });
        return res
    }
}

export default I003Service