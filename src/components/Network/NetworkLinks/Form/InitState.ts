import { Guid } from "models/Enums";

export interface IModelItem {
    Id: string; 
    SerialNumber: string;
    Distance: number;
    HeadDeviceId: string;
    HeadDevicePortId: string;
    LastDeviceId: string;
    LastDevicePortId: string;
    ConnectType: string;
    Speed: number;
    Status: string;
    Note: string;  
}
export interface IState {
    DataItem: IModelItem
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,
        SerialNumber: "",
        Distance: 0,
        HeadDeviceId: "",
        HeadDevicePortId: "",
        LastDeviceId: "",
        LastDevicePortId: "",
        ConnectType: "",
        Speed: 0,
        Status: "",
        Note: ""
    }
};  
