import { Guid } from "models/Enums";

export interface IModelItem {
    Id: string; 
    CableCode: string;
    CableType: number;
    LineId: string;
    HeadDeviceId: string;
    LastDeviceId: string;
    SetPoint: string;
    ManageOrgan: string;
    ManagerName: string;
    ManagerTel: string;
    ManagerEmail: string;  
}
export interface IState {
    DataItem: IModelItem
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,
        CableCode: "",
        CableType: 0,
        LineId: "",
        HeadDeviceId: "",
        LastDeviceId: "",
        SetPoint: "",
        ManageOrgan: "",
        ManagerName: "",
        ManagerTel: "",
        ManagerEmail: ""
    }
};  
