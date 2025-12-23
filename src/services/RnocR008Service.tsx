import request from "helpers/request";

const RnocR008Service = {    
    // Dashboard APIs by different time periods
    getDashboardByDay: async (startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R008/dashboard/day?startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },
    
    getDashboardByWeek: async (startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R008/dashboard/week?startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },
    
    getDashboardByMonth: async (startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R008/dashboard/month?startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },
    
    // Get scheduler records with pagination
    getSchedulerRecordsPaged: async (startDate: string, endDate: string, page: number, pageSize: number) => {        
        let res: any = await request({
            url: `Rnoc_R008/records/paged?startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`,
            method: 'get'
        });
        return res;
    },
    
    // Get statistics by specific date
    getStatisticsByDate: async (date: string) => {        
        let res: any = await request({
            url: `Rnoc_R008/statistics?date=${date}`,
            method: 'get'
        });
        return res;
    },
    
    // Get records by cell name
    getRecordsByCellName: async (cellName: string, startDate: string, endDate: string) => {        
        let res: any = await request({
            url: `Rnoc_R008/records/by-cell?cellName=${cellName}&startDate=${startDate}&endDate=${endDate}`,
            method: 'get'
        });
        return res;
    },
    
    // Export to CSV
    exportToCsv: async (startDate: string, endDate: string) => {        
        try {
            const response: any = await request({
                url: `Rnoc_R008/export/csv?startDate=${startDate}&endDate=${endDate}`,
                method: 'get',
                responseType: 'blob'
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `R008_PowerSaving_${startDate}_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            console.error('Error exporting CSV:', error);
            throw error;
        }
    }
};

export default RnocR008Service;
