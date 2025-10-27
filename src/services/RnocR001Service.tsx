import request from "helpers/request";

const RnocR001Service = {    
    // Dashboard APIs
    GetDashboard: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R001/dashboard?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    // Configured sites APIs
    GetConfiguredSites: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R001/configured-sites?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    GetConfiguredSitesRange: async (startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R001/configured-sites-range?startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },
    
    // Bad configurations APIs
    GetBadConfigurations: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R001/bad-configurations?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    GetBadConfigurationsRange: async (startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R001/bad-configurations-range?startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },
    
    // Detail APIs with pagination
    GetCorrectConfigurations: async (data: any) => {        
        let res: any = await request({
            url: `Rnoc_R001/correct-configurations`,
            method: 'post',
            data: data
        });
        return res;
    },
    
    GetIncorrectConfigurations: async (data: any) => {        
        let res: any = await request({
            url: `Rnoc_R001/incorrect-configurations`,
            method: 'post',
            data: data
        });
        return res;
    },
    
    GetParameterDetails: async (data: any) => {        
        let res: any = await request({
            url: `Rnoc_R001/parameter-details`,
            method: 'post',
            data: data
        });
        return res;
    },
    
    // Statistics APIs
    GetStatistics: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R001/statistics?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    GetParameterSummaries: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R001/parameter-summaries?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    // Export APIs
    ExportConfiguredSites: async (data: any) => {        
        let res: any = await request({
            url: `Rnoc_R001/export-configured-sites`,
            method: 'post',
            data: data
        });
        return res;
    },
    
    ExportBadConfigurations: async (data: any) => {        
        let res: any = await request({
            url: `Rnoc_R001/export-bad-configurations`,
            method: 'post',
            data: data
        });
        return res;
    }
};

export default RnocR001Service;