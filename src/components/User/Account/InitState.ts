import { AppName, Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    FullName: String;
    UserName: String;
    Email: String;
    Phone: String;
    Address: String;
    IsActive: boolean;
    OrgainId: String;
    RoleId: String;
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
}
export const InitState: IState = {
    DataItems: [],
    DataTree: [{
        Id: Guid.Empty,
        Code: AppName,
        Name: AppName,
        Children: []
    }]
};  
