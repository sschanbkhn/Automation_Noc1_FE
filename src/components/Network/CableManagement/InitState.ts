export interface IModelItem {
    Id: string; 
    CableCode: string;
    CableType: number;
    Line: string;
    HeadDevice: string;
    LastDevice: string;
    SetPoint: string;
    ManageOrgan: string;
    ManagerName: number;
    ManagerTel: string;
    ManagerEmail: string;                   
}
export interface IState {
    DataItems: IModelItem[],
    Options: []
}
export const InitState: IState = {
    DataItems: [],
    Options: []
};  
