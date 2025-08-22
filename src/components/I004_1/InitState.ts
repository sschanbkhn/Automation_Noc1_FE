export const ModuleType = 1004;
export const ModuleName = "LSP Data Management";

export interface IModelItem {
    Id: string;
    name: string;
    from_address: string;
    host_name_from: string;
    to_address: string;
    host_name_to: string;
    action: string;
    operational_status: string;
    bandwidth: number;
    path_lsp: string;
    last_update: Date;
}

export interface IState {
    DataItems: IModelItem[]
}

export const InitState: IState = {
    DataItems: []
};
