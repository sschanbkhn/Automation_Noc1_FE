export enum Message {
    Data_Does_Not_Exists = "Dữ liệu không tồn tại !",
    UserName_Is_Not_Empty = "Tên đăng nhập không được để trống !",
    Password_Is_Not_Empty = "Mật khẩu không được để trống !",
    FullName_Is_Not_Empty = "Họ và tên không được để trống !",
    Email_Is_Not_Empty = "Email không được để trống !",
    Email_Is_Not_Format = "Email không đúng định dạng !",
    Phone_Is_Not_Empty = "SĐT không được để trống !",
    Phone_Is_Not_Format = "SĐT không đúng định dạng !",    
    OldPassword_Is_Not_Empty = "Mật khẩu cũ không được để trống !",
    NewPassword_Is_Not_Empty = "Mật khẩu mới không được để trống !",    
    Require_Row_Selection = "Yêu cầu chọn bản ghi !",
    Response_Success = "Xử lý thành công !",
    Response_Error = "Xử lý lỗi !",
    DuplicateAttribute_Name = "Trùng tên !",    
    DuplicateAttribute_Code = "Trùng mã !",   
    DuplicateAttribute_Serial = "Trùng serial !",    
    DuplicateAttribute_LoginName = "Trùng tài khoản hoặc email !",
    DeptNotInOrgan = "Đơn vị không là cấp con của phòng ban !",  
    LoginFacebookError = "Đăng nhập Facebook thất bại !",  
    LoginGoogleError = "Đăng nhập Google thất bại !",    
    Require_Row_ParentID = "Cần chọn đơn vị quản lý thiết bị !",
}
export enum Guid {
    Empty = "00000000-0000-0000-0000-000000000000"
}
export enum ControlType {
    InputText = "InputText",  
    CkEditor = "CkEditor",   
    TextArea = "TextArea",    
    InputNumber = "InputNumber",    
    Select = "Select",
    Date = "Date", 
    DateTime = "DateTime",       
    Checkbox = "Checkbox",
    RadioButton = "RadioButton",
    UploadFile = "UploadFile"
}
export const AppName = "Network App"