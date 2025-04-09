interface  IResponseMessage {
  Data: any;
  StatusCode: number;
  Message: string;
  Success: boolean;
}

interface IDataGrid {
  Key: string;
  Title: string;
  ColumnDefs: IColumnDefs[];
  ActionDefs: IActionDefs[]
}

interface IColumnDefs {
  Key: string;
  Title: string;
  Align: string;
  Options: any;
  Hidden: any;
  Group: any;
  OrderBy: any;
  Width: any;
  Format: any
}
interface IActionDefs {
  Key: string 
  Title: string;
  Type: string;
  TitleTooltip: string;
  Icon: string,
  Action: string
}
interface IFormDefs {
  Key: string,
  Title: string,
  Rows: number,
  Controls: IControlDefs[]
}
interface IControlDefs {
  Key: string,
  Title: string,     
  CheckboxLabel: string,     
  Type: string,
  IsRequired: boolean,
  IsDisabled: boolean,
  IsPassword: boolean,
  InlineBlock: boolean,
  Multiple: boolean,
  Filterable: boolean,
  Options: any,
  KeyOptions: any,
  Size: any,
  Placeholder: any,
  Row: number,
  ColLabel: number, 
  ColControl: number, 
  ColSpanControl: number,
}
interface IControlOptions {
  Key: string,
  Options: any
}
interface INotification {
  Type: string,
  Title: string,
  Content: string,
  CreatedDateTime: string
}
interface IUserInfo {
  Roles: string[],    
  UserId: string,
  UserName: string,
  RoleName: string,
  Menus: string[]
}
export { INotification, IUserInfo, IResponseMessage, IDataGrid, IColumnDefs, IActionDefs, IControlDefs, IFormDefs, IControlOptions}