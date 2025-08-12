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
    },

    // Dashboard APIs
    GetDashboard4GData: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/dashboard4g?date=${date}`,
            method: 'get'
        });
        return res;
    },

    GetDashboard5GData: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/dashboard5g?date=${date}`,
            method: 'get'
        });
        return res;
    },

    // Provincial Report APIs
    GetProvincialReport4G: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/provincial4g?date=${date}`,
            method: 'get'
        });
        return res;
    },

    GetProvincialReport5G: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/provincial5g?date=${date}`,
            method: 'get'
        });
        return res;
    },

    GetProvincialReportAll: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/provincialAll?date=${date}`,
            method: 'get'
        });
        return res;
    },

    // Export Provincial Report to Excel
    ExportProvincialReportToExcel: async (data: any, technology: string) => {        
        let res: any = await request({
            url: `Rnoc_R009/exportProvincialReportToExcel`,
            method: 'post',
            data: { ...data, technology }
        });
        return res;
    }
};

export default RnocR009Service; 