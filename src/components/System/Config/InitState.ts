export interface IModelItem {
    Id: String;
    Code: String;
    Value: String;
    Type: Number;
}
export interface IState {
    DataItems: IModelItem[]
}
export const InitState: IState = {
    DataItems: []
};  
