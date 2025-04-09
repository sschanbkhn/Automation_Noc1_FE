export interface IModelItem {
    Id: string; 
    SerialNumber: string;
    Distance: number;
    HeadDevice: string;
    HeadDevicePort: string;
    LastDevice: string;
    LastDevicePort: string;
    ConnectType: string;
    Speed: number;
    Status: string;
    Note: string;                 
}
export interface IState {
    DataItems: IModelItem[],
    Options: []
}
export const InitState: IState = {
    DataItems: [],
    Options: []
};  
