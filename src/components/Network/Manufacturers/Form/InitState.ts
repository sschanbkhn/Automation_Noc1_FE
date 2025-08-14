import { Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    Name: String;
    Nation: String;
}
export interface IState {
    DataItem: IModelItem
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,        
        Name: "",
        Nation: ""
    }
};  
