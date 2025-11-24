import request from "helpers/request"

const I002_HARDWARE_ALARM = "I002_HardwareAlarm";

const I002Service = {    
    GetList: async () => {        
        let res: any = await request({
            url: `/${I002_HARDWARE_ALARM}/GetList`,
            method: 'get'
        });
        return res
    },
    
    Check: async (alarmId: string, username: string) => {        
        let res: any = await request({
            url: `/${I002_HARDWARE_ALARM}/Check`,
            method: 'post',
            data: { alarmId, username }
        });
        return res
    },
    
    AutoReboot: async (alarmId: string, deviceName: string, fpcSlot: string, keyword: string, username: string) => {        
        let res: any = await request({
            url: `/${I002_HARDWARE_ALARM}/AutoReboot`,
            method: 'post',
            data: { alarmId, deviceName, fpcSlot, keyword, username }
        });
        return res
    },
    
    ManualHandle: async (alarmId: string, username: string, causeName?: string) => {        
        let res: any = await request({
            url: `/${I002_HARDWARE_ALARM}/ManualHandle`,
            method: 'post',
            data: { alarmId, username, causeName: causeName || 'Manual Handle' }
        });
        return res
    },
    
    GetErrorLinksStatus: async () => {        
        let res: any = await request({
            url: `/${I002_HARDWARE_ALARM}/GetErrorLinksStatus`,
            method: 'get'
        });
        return res
    },
    
    GetHardwareAlarmHistory: async () => {        
        let res: any = await request({
            url: `/${I002_HARDWARE_ALARM}/GetHardwareAlarmHistory`,
            method: 'get'
        });
        return res
    }
}

export default I002Service
