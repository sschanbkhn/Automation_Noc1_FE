import { IResponseMessage } from "models/Apps";
import I004_1Service from "services/I004_1Service";

export const Actions: any = { 
    GetItems: async (dispatch: any, fromDate?: Date, toDate?: Date) => {
        let res: IResponseMessage = await I004_1Service.GetLSPData(fromDate, toDate);               
        if(res && res.Success) {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }                       
    },
    
    GetLSPData: async (dispatch: any, fromDate: Date, toDate: Date) => {
        let res: IResponseMessage = await I004_1Service.GetLSPData(fromDate, toDate);               
        if(res && res.Success) {           
            dispatch({
                type: "GetItems",
                items: res.Data
            })
        }
        return res;                       
    }
}
