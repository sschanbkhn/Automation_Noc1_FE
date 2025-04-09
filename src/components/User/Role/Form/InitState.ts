import { Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
}
export interface IState {
    DataItem: IModelItem
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,
        Code: "",
        Name: ""
    }
};  
