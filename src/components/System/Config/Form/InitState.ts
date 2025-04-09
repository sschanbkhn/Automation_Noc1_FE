import { Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    Code: String;
    Value: String;
    Type: String;
}
export interface IState {
    DataItem: IModelItem
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,
        Code: "",
        Value: "",
        Type: "0"
    }
};  
