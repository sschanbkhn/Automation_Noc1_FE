import { AppName, Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
    Type: Number;
}
export interface IModelTree {
    Id: String;
    Code: String;
    Name: String;
    Children: Array<IModelTree>;
}
export interface IState {
    DataItems: IModelItem[]
    DataTree: IModelTree[]
    Options: any
}
export const InitState: IState = {
    DataItems: [],
    DataTree: [{
        Id: Guid.Empty,
        Code: AppName,
        Name: AppName,
        Children: []
    }],
    Options: []
};  
