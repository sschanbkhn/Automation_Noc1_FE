export interface IState {
    IsAuthenticated: boolean,
    IsLoading: boolean,
    ListDonVi: any
}
export const InitState: IState = {
    IsAuthenticated: false,
    IsLoading: false,
    ListDonVi: []
};  
