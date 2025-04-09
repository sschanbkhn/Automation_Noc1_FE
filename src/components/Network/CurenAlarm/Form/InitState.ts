import { Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    DeviceId: String;
    SerialPort: String;
    PortFormat: String;  
    Name: String;
    Type: String;
    MaxSpeed: Number;
    Status: String;  
}
export interface IState {
    DataItem: IModelItem
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,
        DeviceId: "",
        SerialPort: "",
        PortFormat: "",
        Name: "",
        Type: "",
        MaxSpeed: 0,
        Status: ""
    }
};  
