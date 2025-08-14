export interface IModelItem {
    Id: String;
    Name: String;
    Description: String;
}
export interface IState {
    DataItems: IModelItem[]
}
export const InitState: IState = {
    DataItems: []
};  
