import { IControlOptions } from "models/Apps";
import { Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    FullName: String;
    UserName: String;
    PassWord: String;
    Email: String;
    Phone: String;
    Address: String;
    IsActive: boolean;
    OrgainId?: String;
    RoleId?: String;
}
export interface IState {
    DataItem: IModelItem,
    Options: IControlOptions[]
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,
        FullName: "",
        UserName: "",
        PassWord: "",
        Email: "",
        Phone: "",
        Address: "",
        IsActive: true,
        OrgainId: "",
        RoleId: ""
    },
    Options: []
};  
