import request from "helpers/request";

const RnocR009Service = {    
    // Huawei APIs
    GetBtsDataByDate: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/hw_GetBtsDataByDate?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    GetBtsDataByDateRange: async (startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/hw_GetBtsDataByDateRange?startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },

    ExportBtsDataToExcel: async (data: any) => {        
        let res: any = await request({
            url: `Rnoc_R009/hw_ExportBtsDataToExcel`,
            method: 'post',
            data: data
        });
        return res;
    },
    
    // Nokia 4G APIs
    GetNokiaBtsDataByDate: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/nk_GetBtsDataByDate?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    GetNokiaBtsDataByDateRange: async (startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/nk_GetBtsDataByDateRange?startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },

    ExportNokiaBtsDataToExcel: async (data: any) => {        
        let res: any = await request({
            url: `Rnoc_R009/nk_ExportBtsDataToExcel`,
            method: 'post',
            data: data
        });
        return res;
    },
    
    // Nokia 5G APIs
    GetNokiaBtsData5GByDate: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/nk5G_GetBtsDataByDate?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    GetNokiaBtsData5GByDateRange: async (startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/nk5G_GetBtsDataByDateRange?startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },

    ExportNokiaBtsData5GToExcel: async (data: any) => {        
        let res: any = await request({
            url: `Rnoc_R009/nk5G_ExportBtsDataToExcel`,
            method: 'post',
            data: data
        });
        return res;
    }
};

export default RnocR009Service; 