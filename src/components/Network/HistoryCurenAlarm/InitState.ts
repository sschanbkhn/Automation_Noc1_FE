export interface IModelItem {
    Id: String;
    Device: String;
    SerialPort: String;
    PortFormat: String;  
    Name: String;
    Type: String;
    MaxSpeed: Number;
    Status: Number;                    
}
export interface IState {
    DataItems: IModelItem[],
    Options: []
}
export const InitState: IState = {
    DataItems: [],
    Options: []
};  
