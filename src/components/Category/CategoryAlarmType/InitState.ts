export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
}
export interface IState {
    DataItems: IModelItem[],
    Options: []
}
export const InitState: IState = {
    DataItems: [],
    Options: []
};  
