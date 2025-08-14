export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
}
export interface IState {
    DataItems: IModelItem[]
}
export const InitState: IState = {
    DataItems: []
};  
