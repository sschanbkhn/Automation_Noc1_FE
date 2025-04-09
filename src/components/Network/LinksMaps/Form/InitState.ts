import { Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
    Lon: String; 
    Lat: String;
    Description: String;
    DeviceTypeId?: String;
    ManufacturerId?: String;
    FirmwareVersion: String;
    IPAddress: String;
    MACAddress: String;
    SerialNumber: String; 
    OrganId?: String;
    NumberOfNetPorts: Number; 
}
export interface IState {
    DataItem: IModelItem
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,
        Code: "",
        Name: "",
        Lon: "", 
        Lat: "",
        Description: "",
        DeviceTypeId: Guid.Empty,
        ManufacturerId: Guid.Empty,
        FirmwareVersion: "",
        IPAddress: "",
        MACAddress: "",
        SerialNumber: "", 
        OrganId: Guid.Empty,
        NumberOfNetPorts: 0
    }
};  
