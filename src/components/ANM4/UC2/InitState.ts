import { AppName, Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
    Lon: String; 
    Lat: String;
    Description: String;
    DeviceType: String;
    Manufacturer: String;
    FirmwareVersion: String;
    IPAddress: String;
    MACAddress: String;
    SerialNumber: String; 
    Organ: String;
}
export interface IState {
    DataItems: IModelItem[],
    Options: [],
    DataTree: any[]
}
export const InitState: IState = {
    DataItems: [],
    Options: [],
        DataTree: [{
            Id: Guid.Empty,
            Code: AppName,
            Name: AppName,
            Children: []
        }],
};  
