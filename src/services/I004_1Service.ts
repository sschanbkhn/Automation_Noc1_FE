import request from "helpers/request"

const I004_1_LSP = "I004_1_LSP";

const I004_1Service = {    
    GetLSPData: async (fromDate?: Date, toDate?: Date) => {
        // Nếu không có fromDate và toDate, mặc định lấy dữ liệu 7 ngày gần nhất
        const defaultToDate = toDate || new Date();
        const defaultFromDate = fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // Format dates for API call
        const fromDateStr = defaultFromDate.toISOString().split('T')[0] + ' 00:00:00';
        const toDateStr = defaultToDate.toISOString().split('T')[0] + ' 23:59:59';
        
        let res: any = await request({
            url: `/${I004_1_LSP}/GetLSPData?fromDate=${encodeURIComponent(fromDateStr)}&toDate=${encodeURIComponent(toDateStr)}`,
            method: 'get'
        });
        return res
    },
    
    GetItems: async (page: number = 1, pageSize: number = 1000, totalLimitItems: number = 1000) => {        
        let res: any = await request({
            url: `/${I004_1_LSP}/${page}/${pageSize}/${totalLimitItems}`,
            method: 'get'
        });
        return res
    }
}

export default I004_1Service
