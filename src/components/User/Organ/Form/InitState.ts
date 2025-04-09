import { Guid } from "models/Enums";

export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
    Type?: Number;
    ParentId?: String;
    PermFeature?: String;
    PermWorkFlow?: String;
}
export interface IState {
    DataItem: IModelItem
    Options: any
}
export const InitState: IState = {
    DataItem: {
        Id: Guid.Empty,
        Code: "",
        Name: "",
        Type: null,
        ParentId: Guid.Empty,
        PermFeature: "",
        PermWorkFlow: ""
    },
    Options: []
};  
