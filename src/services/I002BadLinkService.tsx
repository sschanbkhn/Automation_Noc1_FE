import request from "helpers/request"

const I002_BADLINK = "I002_BadLink";

const I002BadLinkService = {    
    GetList: async () => {        
        let res: any = await request({
            url: `/${I002_BADLINK}/GetList`,
            method: 'get'
        });
        return res
    },
    
    CheckLink: async (id: string) => {        
        let res: any = await request({
            url: `/${I002_BADLINK}/CheckLink`,
            method: 'post',
            data: { id }
        });
        return res
    },
    
    DisablePort: async (id: string) => {        
        let res: any = await request({
            url: `/${I002_BADLINK}/DisablePort`,
            method: 'post',
            data: { id }
        });
        return res
    },
    
    MarkNA: async (id: string) => {        
        let res: any = await request({
            url: `/${I002_BADLINK}/MarkNA`,
            method: 'post',
            data: { id }
        });
        return res
    }
}

export default I002BadLinkService
