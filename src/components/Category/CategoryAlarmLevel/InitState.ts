export const CategoryType = 1;
export const CategoryName = "Mức độ cảnh báo";
export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
    Description: String;
    Type: Number;
}
export interface IState {
    DataItems: IModelItem[]
}
export const InitState: IState = {
    DataItems: []
};  
