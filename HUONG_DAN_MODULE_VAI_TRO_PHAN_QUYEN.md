# HƯỚNG DẪN SỬ DỤNG MODULE VAI TRÒ VÀ PHÂN QUYỀN

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Module Vai trò (Role)](#module-vai-trò-role)
3. [Module Phân quyền (Permission)](#module-phân-quyền-permission)
4. [Quy trình phân quyền](#quy-trình-phân-quyền)
5. [Lưu ý quan trọng](#lưu-ý-quan-trọng)

---

## 🎯 Giới thiệu

Hệ thống quản lý Vai trò và Phân quyền cho phép quản trị viên:
- **Tạo và quản lý các vai trò** (Role) trong hệ thống
- **Phân quyền truy cập menu** và chức năng cho từng vai trò
- **Kiểm soát quyền hạn** của người dùng theo vai trò được gán

### Vị trí trong hệ thống
- **Đường dẫn menu**: Quản trị > Vai trò / Phân quyền
- **URL**: 
  - Vai trò: `/role`
  - Phân quyền: `/permission`

---

## 👥 Module Vai trò (Role)

### 1. Truy cập Module
1. Đăng nhập với tài khoản **Quản trị viên**
2. Vào menu **Quản trị** → **Vai trò**
3. Màn hình hiển thị danh sách các vai trò hiện có

### 2. Tạo mới Vai trò

#### Bước 1: Mở form tạo mới
- Click nút **"Tạo mới"** ở góc trên bên trái danh sách
- Hộp thoại "Tạo mới vai trò" sẽ hiển thị

#### Bước 2: Điền thông tin vai trò
Các trường thông tin cần điền:

| Trường | Mô tả | Bắt buộc |
|--------|-------|----------|
| **Mã vai trò (Code)** | Mã định danh vai trò (không dấu, không khoảng trắng)<br>Ví dụ: `ADMIN`, `USER`, `MANAGER` | ✅ Có |
| **Tên vai trò (Name)** | Tên mô tả vai trò (có dấu tiếng Việt)<br>Ví dụ: "Quản trị viên", "Người dùng", "Quản lý" | ✅ Có |
| **Mô tả (Description)** | Mô tả chi tiết về vai trò và quyền hạn | ❌ Không |
| **Trạng thái (IsActive)** | Kích hoạt/Vô hiệu hóa vai trò | ✅ Có |

#### Bước 3: Lưu vai trò
- Click nút **"Lưu"**
- Hệ thống kiểm tra:
  - ✅ Mã vai trò không trùng lặp
  - ✅ Tên vai trò không trùng lặp
  - ✅ Các trường bắt buộc đã điền đầy đủ
- Nếu hợp lệ → Hiển thị thông báo "Lưu thành công"
- Nếu lỗi → Hiển thị thông báo lỗi chi tiết

#### Ví dụ tạo vai trò:
```
Mã vai trò: NHAN_VIEN_KT
Tên vai trò: Nhân viên Kỹ thuật
Mô tả: Nhân viên kỹ thuật có quyền xem và xử lý các báo cáo kỹ thuật
Trạng thái: ✓ Kích hoạt
```

### 3. Sửa Vai trò

#### Bước 1: Chọn vai trò cần sửa
- Click chọn **1 dòng** trong danh sách vai trò
- Dòng được chọn sẽ có màu nền khác biệt

#### Bước 2: Mở form chỉnh sửa
- Click nút **"Sửa"** trên thanh công cụ
- Hộp thoại "Sửa vai trò" hiển thị với thông tin đã có

#### Bước 3: Chỉnh sửa và lưu
- Chỉnh sửa các thông tin cần thiết
- Click **"Lưu"** để cập nhật
- Hệ thống kiểm tra tương tự như tạo mới

### 4. Xóa Vai trò

#### Bước 1: Chọn vai trò cần xóa
- Click chọn **1 dòng** trong danh sách

#### Bước 2: Thực hiện xóa
- Click nút **"Xóa"** trên thanh công cụ
- Hộp thoại xác nhận hiển thị: *"Thao tác này sẽ xóa vai trò"*

#### Bước 3: Xác nhận
- Click **"OK"** để xác nhận xóa
- Click **"Hủy"** để hủy thao tác

#### ⚠️ Lưu ý quan trọng:
- **KHÔNG THỂ xóa** vai trò đang được gán cho người dùng
- Hệ thống sẽ hiển thị lỗi: *"Vai trò đang được sử dụng bởi người dùng"*
- Cần gỡ vai trò khỏi tất cả người dùng trước khi xóa

---

## 🔐 Module Phân quyền (Permission)

### 1. Truy cập Module
1. Đăng nhập với tài khoản **Quản trị viên**
2. Vào menu **Quản trị** → **Phân quyền**
3. Màn hình chia làm 2 phần:
   - **Bên trái**: Danh sách vai trò
   - **Bên phải**: Cấu hình phân quyền (2 tab: Menu và Chức năng)

### 2. Giao diện Phân quyền

#### Phần bên trái: Danh sách Vai trò
- Hiển thị tất cả các vai trò trong hệ thống
- Click chọn vai trò để xem/cấu hình quyền

#### Phần bên phải: Cấu hình quyền
Gồm 2 tab:
1. **Tab Menu**: Phân quyền truy cập các menu
2. **Tab Chức năng**: Phân quyền các chức năng (CRUD)

### 3. Phân quyền Menu

#### Mục đích
Xác định vai trò được phép truy cập những menu nào trong hệ thống.

#### Bước 1: Chọn vai trò
- Click chọn **1 vai trò** trong danh sách bên trái
- Tab **"Menu"** bên phải sẽ tự động load danh sách menu

#### Bước 2: Khởi tạo Menu (nếu cần)
Trường hợp menu chưa được khởi tạo:
- Click nút **"Khởi tạo menu"** ở góc trên bên phải
- Hộp thoại xác nhận: *"Bạn có muốn thực hiện thao tác này không?"*
- Click **"OK"** để khởi tạo
- Hệ thống đọc cấu hình từ `menu_config.json` và tạo cây menu

#### Bước 3: Chọn quyền menu
Cây menu hiển thị dạng **cây phân cấp** với checkbox:

```
☐ Quản trị
  ☐ Tài khoản
  ☐ Vai trò
  ☐ Phân quyền
☐ RNOC1
  ☐ R001 - Dashboard Audit
  ☐ R008 - Tiết kiệm điện tự động
☐ Hệ thống
  ☐ Cấu hình
```

**Cách chọn:**
- ✅ **Tick checkbox** menu cha → Tự động tick tất cả menu con
- ✅ **Tick checkbox** menu con riêng lẻ → Chỉ có quyền menu đó
- ✅ **Bỏ tick** → Gỡ quyền truy cập

#### Bước 4: Lưu cấu hình
- Click nút **"Lưu"** ở góc trên bên phải tab Menu
- Hộp thoại xác nhận: *"Bạn có muốn thực hiện thao tác này không?"*
- Click **"OK"** để lưu
- Thông báo: *"Lưu thành công"*

#### Ví dụ phân quyền Menu:
**Vai trò: Nhân viên Kỹ thuật**
```
☑ RNOC1
  ☑ R001 - Dashboard Audit
  ☑ R008 - Tiết kiệm điện tự động
☐ Quản trị (không cho phép)
☐ Hệ thống (không cho phép)
```

### 4. Phân quyền Chức năng

#### Mục đích
Xác định vai trò có quyền thực hiện các thao tác: Xem, Thêm, Sửa, Xóa (CRUD).

#### Bước 1: Chọn vai trò
- Click chọn **1 vai trò** trong danh sách bên trái

#### Bước 2: Chuyển sang Tab Chức năng
- Click tab **"Chức năng"**
- Danh sách chức năng hiển thị dạng cây

#### Bước 3: Khởi tạo Chức năng (nếu cần)
- Click nút **"Khởi tạo chức năng"** 
- Xác nhận để hệ thống tạo danh sách chức năng mặc định

#### Bước 4: Chọn quyền chức năng
Cây chức năng mẫu:

```
☐ Quản lý Tài khoản
  ☐ Xem danh sách
  ☐ Tạo mới
  ☐ Chỉnh sửa
  ☐ Xóa
☐ Quản lý Vai trò
  ☐ Xem danh sách
  ☐ Tạo mới
  ☐ Chỉnh sửa
  ☐ Xóa
```

**Cách chọn:**
- ✅ Tick checkbox chức năng cần cấp quyền
- ✅ Có thể chọn từng chức năng riêng lẻ hoặc nhóm

#### Bước 5: Lưu cấu hình
- Click nút **"Lưu"** ở góc trên bên phải tab Chức năng
- Xác nhận và lưu

#### Ví dụ phân quyền Chức năng:
**Vai trò: Nhân viên Kỹ thuật**
```
☑ Quản lý R008
  ☑ Xem danh sách
  ☑ Xem dashboard
  ☑ Xuất báo cáo
  ☐ Chỉnh sửa (không cho phép)
  ☐ Xóa (không cho phép)
```

---

## 🔄 Quy trình Phân quyền hoàn chỉnh

### Tình huống: Tạo vai trò mới "Kỹ thuật viên" và phân quyền

#### Bước 1: Tạo Vai trò (2 phút)
1. Vào **Quản trị** → **Vai trò**
2. Click **"Tạo mới"**
3. Điền thông tin:
   ```
   Mã: KY_THUAT_VIEN
   Tên: Kỹ thuật viên
   Mô tả: Nhân viên kỹ thuật vận hành hệ thống RNOC
   Trạng thái: ✓ Kích hoạt
   ```
4. Click **"Lưu"**

#### Bước 2: Phân quyền Menu (3 phút)
1. Vào **Quản trị** → **Phân quyền**
2. Click chọn vai trò **"Kỹ thuật viên"**
3. Tab **"Menu"** → Click **"Khởi tạo menu"** (nếu lần đầu)
4. Tick checkbox các menu:
   ```
   ☑ RNOC1
     ☑ R001 - Dashboard Audit
     ☑ R008 - Tiết kiệm điện tự động
   ☐ Quản trị (không tick)
   ```
5. Click **"Lưu"**

#### Bước 3: Phân quyền Chức năng (3 phút)
1. Chuyển sang tab **"Chức năng"**
2. Click **"Khởi tạo chức năng"** (nếu lần đầu)
3. Tick checkbox các quyền:
   ```
   ☑ R001 Dashboard
     ☑ Xem dashboard
     ☑ Xuất báo cáo
   ☑ R008 Power Saving
     ☑ Xem dashboard
     ☑ Xuất Excel/CSV
   ```
4. Click **"Lưu"**

#### Bước 4: Gán vai trò cho Người dùng
1. Vào **Quản trị** → **Tài khoản**
2. Chọn người dùng → Click **"Sửa"**
3. Chọn vai trò: **"Kỹ thuật viên"**
4. Lưu

#### ✅ Hoàn tất!
Người dùng đăng nhập sẽ:
- Chỉ thấy menu **RNOC1** (R001, R008)
- Có quyền **Xem** và **Xuất báo cáo**
- **KHÔNG** thấy menu **Quản trị**

---

## 🔧 Kiến trúc kỹ thuật & API Controllers

### 1. Luồng xử lý từ Frontend đến Backend

```
[Frontend Component] 
    ↓ (gọi Service)
[RoleService / PermissionService]
    ↓ (HTTP Request với Token)
[API Controller]
    ↓ (kiểm tra Authorization)
[Service Layer]
    ↓ (truy vấn Database)
[Database PostgreSQL]
```

### 2. API Endpoints - Module Vai trò (Role)

#### 📍 Base URL: `/api/Sys_Role`

#### Controller: `Sys_RoleController.cs`

##### a) Lấy danh sách Vai trò
```http
GET /api/Sys_Role/GetList
Authorization: Bearer <token>
```

**Response:**
```json
{
  "Success": true,
  "Message": "Thành công",
  "Data": [
    {
      "Id": "guid-123-456",
      "Code": "ADMIN",
      "Name": "Quản trị viên",
      "Description": "Quản trị hệ thống",
      "IsActive": true
    },
    {
      "Id": "guid-789-012",
      "Code": "NHAN_VIEN_KT",
      "Name": "Nhân viên Kỹ thuật",
      "Description": "Nhân viên kỹ thuật",
      "IsActive": true
    }
  ]
}
```

##### b) Kiểm tra trùng lặp
```http
GET /api/Sys_Role/CheckDuplicateAttributes?id=<guid>&code=<string>
Authorization: Bearer <token>
```

**Backend Code:**
```csharp
[HttpGet("CheckDuplicateAttributes")]
[AuthorizeFilter]
public async Task<IActionResult> CheckDuplicateAttributes(Guid? id, string code)
{
    try
    {
        _logger.LogInformation($"Call CheckDuplicateAttributes params: (id = {id}, code = {code})");
        var result = await _service.Sys_Role.IsDupicateAttributesAsync(id, code);
        return ResponseMessage.Success(result);
    }
    catch (Exception ex)
    {
        _logger.LogError($"CheckDuplicateAttributes : {ex.Message}");
        return ResponseMessage.Error(ex.Message);
    }
}
```

**Response:**
```json
{
  "Success": true,
  "Data": false  // false = không trùng, true = trùng lặp
}
```

##### c) Tạo mới Vai trò
```http
POST /api/Sys_Role/Create
Authorization: Bearer <token>
Content-Type: application/json

{
  "Code": "NHAN_VIEN_KT",
  "Name": "Nhân viên Kỹ thuật",
  "Description": "Nhân viên kỹ thuật vận hành",
  "IsActive": true
}
```

**Response:**
```json
{
  "Success": true,
  "Message": "Tạo vai trò thành công",
  "Data": {
    "Id": "guid-new-123",
    "Code": "NHAN_VIEN_KT",
    "Name": "Nhân viên Kỹ thuật"
  }
}
```

##### d) Cập nhật Vai trò
```http
PUT /api/Sys_Role/Update
Authorization: Bearer <token>
Content-Type: application/json

{
  "Id": "guid-789-012",
  "Code": "NHAN_VIEN_KT",
  "Name": "Nhân viên Kỹ thuật Senior",
  "Description": "Cập nhật mô tả",
  "IsActive": true
}
```

##### e) Xóa Vai trò
```http
DELETE /api/Sys_Role/DeleteById/{id}
Authorization: Bearer <token>
```

**Backend Code:**
```csharp
[HttpDelete("DeleteById/{Id}")]
[AuthorizeFilter]
public async Task<IActionResult> DeleteById(Guid Id)
{
    try
    {
        _logger.LogInformation($"Call DeleteById params: (id = {Id})");
        await _service.Sys_Role.DeleteById(Id);
        return ResponseMessage.Success();
    }
    catch (Exception ex)
    {
        _logger.LogError($"DeleteById : {ex.Message}");
        return ResponseMessage.Error(ex.Message);
    }
}
```

**Response (thành công):**
```json
{
  "Success": true,
  "Message": "Xóa vai trò thành công"
}
```

**Response (lỗi - vai trò đang dùng):**
```json
{
  "Success": false,
  "Message": "Vai trò đang được sử dụng bởi người dùng"
}
```

---

### 3. API Endpoints - Module Phân quyền (Permission)

#### 📍 Base URL: `/api/Sys_Permission`

#### Controller: `Sys_PermissionController.cs`

##### a) Lưu phân quyền Menu/Chức năng
```http
POST /api/Sys_Permission/Save?roleId=<guid>&isFunc=<bool>
Authorization: Bearer <token>
Content-Type: application/json

[
  "guid-menu-1",
  "guid-menu-2",
  "guid-menu-3"
]
```

**Backend Code:**
```csharp
[HttpPost("Save")]
[AuthorizeFilter]
public async Task<IActionResult> Save([FromBody] Guid[] resourceIds, Guid roleId, bool isFunc)
{
    try
    {
        _logger.LogInformation($"Call Save params: (resourceIds = {string.Join(", ", resourceIds)}, roleId = {roleId}, isFunc = {isFunc})");
        var items = await _service.Sys_Permission.SaveAsync(resourceIds, roleId, isFunc);
        return ResponseMessage.Success(items);
    }
    catch (Exception ex)
    {
        _logger.LogError($"Save : {ex.Message}");
        return ResponseMessage.Error(ex.Message);
    }
}
```

**Giải thích tham số:**
- `roleId`: ID vai trò cần phân quyền
- `isFunc`: 
  - `false` = Phân quyền Menu
  - `true` = Phân quyền Chức năng
- `resourceIds`: Mảng ID các menu/chức năng được tick

**Response:**
```json
{
  "Success": true,
  "Message": "Lưu phân quyền thành công",
  "Data": [
    {
      "Id": "guid-perm-1",
      "RoleId": "guid-role-123",
      "ResourceId": "guid-menu-1",
      "IsFunc": false
    }
  ]
}
```

##### b) Lấy quyền theo Vai trò
```http
GET /api/Sys_Permission/GetByRoleId?roleId=<guid>&isFunc=<bool>
Authorization: Bearer <token>
```

**Backend Code:**
```csharp
[HttpGet("GetByRoleId")]
[AuthorizeFilter]
public async Task<IActionResult> GetByRoleId(Guid roleId, bool isFunc)
{
    try
    {
        _logger.LogInformation($"Call GetByRoleId params: (roleId = {roleId}, isFunc = {isFunc})");
        var items = await _service.Sys_Permission.GetByRoleIdAsync(roleId, isFunc);
        return ResponseMessage.Success(items);
    }
    catch (Exception ex)
    {
        _logger.LogError($"GetByRoleId : {ex.Message}");
        return ResponseMessage.Error(ex.Message);
    }
}
```

**Response:**
```json
{
  "Success": true,
  "Data": [
    {
      "Id": "guid-perm-1",
      "RoleId": "guid-role-123",
      "ResourceId": "guid-menu-1",
      "IsFunc": false
    }
  ]
}
```

##### c) Lấy Menu theo Roles (khi Login)
```http
POST /api/Sys_Permission/GetMenusByRoles
Content-Type: application/json
[KHÔNG CẦN Token - AllowAnonymous]

["ADMIN", "NHAN_VIEN_KT"]
```

**Backend Code:**
```csharp
[HttpPost("GetMenusByRoles")]
[AllowAnonymous]
public async Task<IActionResult> GetMenusByRoles([FromBody] List<string> roles)
{
    try
    {
        _logger.LogInformation($"Call GetMenusByRoles params: (roles = {string.Join(", ", roles)})");
        var items = await _service.Sys_Permission.GetMenusByRoles(roles);
        return ResponseMessage.Success(items);
    }
    catch (Exception ex)
    {
        _logger.LogError($"GetMenusByRoles : {ex.Message}");
        return ResponseMessage.Error(ex.Message);
    }
}
```

**Response:**
```json
{
  "Success": true,
  "Data": {
    "Menus": [
      {
        "Code": "RNOC1",
        "Name": "RNOC1",
        "Url": "/rnoc1",
        "Children": [
          {
            "Code": "R001",
            "Name": "R001 - Dashboard Audit",
            "Url": "/r001-audit"
          },
          {
            "Code": "R008",
            "Name": "R008 - Tiết kiệm điện",
            "Url": "/r008-power-saving"
          }
        ]
      }
    ]
  }
}
```

---

### 4. Flow Frontend gọi API

#### Ví dụ 1: Tạo mới Vai trò

**File: `src/components/User/Role/Action.ts`**
```typescript
import RoleService from 'services/RoleService';

const Actions = {
  CreateItem: async (data: any) => {
    // 1. Gọi API tạo vai trò
    let res = await RoleService.Create(data);
    return res;
  }
}
```

**File: `src/services/RoleService.tsx`**
```typescript
import request from "helpers/request";

const RoleService = {
  Create: async (data: any) => {
    let res = await request({
      url: `/Sys_Role/Create`,
      method: 'post',
      data
    });
    return res;
  }
}
```

**File: `src/helpers/request.ts`**
```typescript
import axios from 'axios';
import Cookie from 'helpers/Cookie';

const request = async (options: any) => {
  // Lấy token từ cookie
  const token = Cookie.getCookie('Token');
  
  // Gắn token vào header
  const config = {
    ...options,
    baseURL: process.env.API_URL, // http://localhost:5001/api
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  // Gọi API
  const response = await axios(config);
  return response.data;
}
```

**⏬ Request thực tế gửi đi:**
```http
POST http://localhost:5001/api/Sys_Role/Create
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "Code": "NHAN_VIEN_KT",
  "Name": "Nhân viên Kỹ thuật",
  "IsActive": true
}
```

**⏫ Response nhận về:**
```json
{
  "Success": true,
  "Message": "Tạo vai trò thành công",
  "Data": { "Id": "guid-new-123", ... }
}
```

---

#### Ví dụ 2: Phân quyền Menu cho Vai trò

**File: `src/components/User/Permission/Action.ts`**
```typescript
import PermissionService from 'services/PermissionService';

const Actions = {
  SaveWithRoleId: async (resourceIds: any, roleId: any, isFunc: any, dispatch: any) => {
    // 1. Gọi API lưu phân quyền
    let res = await PermissionService.SaveWithRoleId(
      resourceIds,  // ["guid-menu-1", "guid-menu-2"]
      roleId,       // "guid-role-123"
      isFunc        // false (Menu) hoặc true (Chức năng)
    );
    return res;
  }
}
```

**File: `src/services/PermissionService.tsx`**
```typescript
import request from "helpers/request";

const PermissionService = {
  SaveWithRoleId: async (data: any, roleId: any, isFunc: any) => {
    let res = await request({
      url: `/Sys_Permission/Save?roleId=${roleId}&isFunc=${isFunc}`,
      method: 'post',
      data  // Array of resource IDs
    });
    return res;
  }
}
```

**⏬ Request thực tế:**
```http
POST http://localhost:5001/api/Sys_Permission/Save?roleId=guid-role-123&isFunc=false
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

[
  "guid-menu-rnoc1",
  "guid-menu-r001",
  "guid-menu-r008"
]
```

---

### 5. Authorization Filter - Kiểm tra quyền

**File: `Automation.API/Infrastructure/Authorization/AuthorizeFilter.cs`**

```csharp
public class AuthorizeFilter : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // 1. Lấy token từ header
        var token = context.HttpContext.Request.Headers["Authorization"];
        
        // 2. Kiểm tra token hợp lệ
        if (string.IsNullOrEmpty(token))
        {
            context.Result = new UnauthorizedResult(); // 401
            return;
        }
        
        // 3. Giải mã token, lấy UserName, Roles
        var principal = ValidateToken(token);
        
        // 4. Kiểm tra user có quyền truy cập API này không
        // (Tùy logic nghiệp vụ)
        
        // 5. Cho phép tiếp tục nếu hợp lệ
    }
}
```

**Sử dụng:**
```csharp
[HttpPost("Save")]
[AuthorizeFilter]  // ← Bắt buộc có token hợp lệ
public async Task<IActionResult> Save(...)
{
    // Code xử lý
}
```

---

### 6. Luồng hoàn chỉnh: Đăng nhập → Lấy menu

```
1. User nhập UserName/Password
   ↓
2. Frontend gọi: POST /api/Sys_User/Login
   {
     "UserName": "admin",
     "Password": "123456"
   }
   ↓
3. Backend kiểm tra password ✓
   ↓
4. Backend truy vấn Roles của user từ DB
   → SELECT RoleCode FROM Sys_Users_Roles WHERE UserId = ...
   → Kết quả: ["ADMIN", "NHAN_VIEN_KT"]
   ↓
5. Backend gọi Service: GetMenusByRoles(["ADMIN", "NHAN_VIEN_KT"])
   ↓
6. Backend JOIN bảng:
   - Sys_Roles (theo Code)
   - Sys_Permissions (theo RoleId, IsFunc = false)
   - Sys_Resources (Menu)
   ↓
7. Backend trả về Response:
   {
     "Success": true,
     "Data": {
       "AccessToken": "eyJhbGc...",
       "UserId": "guid-user-123",
       "UserName": "admin",
       "Roles": ["ADMIN", "NHAN_VIEN_KT"],
       "Menus": [
         { "Code": "RNOC1", "Children": [...] }
       ]
     }
   }
   ↓
8. Frontend lưu Token vào Cookie
   ↓
9. Frontend lưu Menus vào Redux Store
   ↓
10. Frontend render menu theo Menus
    → Chỉ hiển thị menu có trong Menus
    → Ẩn menu không có quyền
```

---

### 7. Database Tables liên quan

```sql
-- Bảng Vai trò
CREATE TABLE sys_roles (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(200),
    description TEXT,
    is_active BOOLEAN
);

-- Bảng User - Role (Many-to-Many)
CREATE TABLE sys_users_roles (
    user_id UUID,
    role_id UUID,
    organ_id UUID,
    is_default BOOLEAN,
    PRIMARY KEY (user_id, role_id)
);

-- Bảng Phân quyền
CREATE TABLE sys_permissions (
    id UUID PRIMARY KEY,
    role_id UUID,           -- FK → sys_roles.id
    resource_id UUID,       -- FK → sys_resources.id (Menu/Function)
    is_func BOOLEAN,        -- false=Menu, true=Function
    created_by VARCHAR(50),
    created_date_time TIMESTAMPTZ
);

-- Bảng Resources (Menu/Function)
CREATE TABLE sys_resources (
    id UUID PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(200),
    parent_id UUID,         -- Cây phân cấp
    url VARCHAR(500),
    icon VARCHAR(100),
    is_func BOOLEAN
);
```

---

### 8. Postman Test API

#### Test 1: Login và lấy Token
```http
POST http://localhost:5001/api/Sys_User/Login
Content-Type: application/json

{
  "UserName": "admin",
  "Password": "123456"
}
```

**→ Copy `AccessToken` từ response**

#### Test 2: Lấy danh sách Vai trò
```http
GET http://localhost:5001/api/Sys_Role/GetList
Authorization: Bearer <paste-token-here>
```

#### Test 3: Tạo Vai trò mới
```http
POST http://localhost:5001/api/Sys_Role/Create
Authorization: Bearer <paste-token-here>
Content-Type: application/json

{
  "Code": "TEST_ROLE",
  "Name": "Vai trò Test",
  "IsActive": true
}
```

#### Test 4: Phân quyền Menu
```http
POST http://localhost:5001/api/Sys_Permission/Save?roleId=<role-id>&isFunc=false
Authorization: Bearer <paste-token-here>
Content-Type: application/json

[
  "menu-guid-1",
  "menu-guid-2"
]
```

---

## ⚠️ Lưu ý quan trọng

### 1. Quyền Quản trị viên đặc biệt
- Tài khoản **admin** hoặc **IsSystem = true**:
  - Tự động có **TẤT CẢ quyền**
  - Không bị giới hạn bởi cấu hình phân quyền
  - Luôn hiển thị menu đầy đủ

### 2. Khởi tạo Menu/Chức năng
- **Chỉ thực hiện 1 lần** khi cài đặt hệ thống
- Sau khi khởi tạo, hệ thống sẽ lưu vào database
- Nếu menu thay đổi trong code → Cần **"Khởi tạo menu"** lại

### 3. Xóa Vai trò
- **KHÔNG THỂ** xóa vai trò đang được gán cho user
- Cần kiểm tra và gỡ vai trò khỏi tất cả user trước

### 4. Thay đổi quyền có hiệu lực
- Người dùng cần **đăng xuất và đăng nhập lại**
- Hoặc **xóa cookie và refresh** trình duyệt
- Quyền mới sẽ load khi login

### 5. Vai trò và Tổ chức (Organ)
- Mỗi user có thể có **nhiều vai trò**
- Vai trò gắn với **Tổ chức (Organization)**
- Quyền cuối cùng = **Tổng hợp tất cả vai trò**

### 6. Menu động theo quyền
- File cấu hình: `src/assets/json/menu_config.json`
- Hệ thống tự động **ẩn menu** không có quyền
- Frontend kiểm tra quyền: `userInfo.Menus`

### 7. API Backend kiểm tra quyền
```csharp
[AuthorizeFilter] // Yêu cầu đăng nhập
[HttpGet("dashboard/day")]
public async Task<IActionResult> GetDashboard(...) {
    // Kiểm tra token và quyền tự động
}
```

### 8. Debug quyền
Kiểm tra quyền của user trong Console trình duyệt:
```javascript
// Xem thông tin user hiện tại
console.log('User Roles:', userInfo.Roles);
console.log('User Menus:', userInfo.Menus);
```

---

## 📞 Hỗ trợ

### Các câu hỏi thường gặp (FAQ)

**Q: Tại sao tôi không thấy menu sau khi phân quyền?**
- A: Đăng xuất và đăng nhập lại để load quyền mới

**Q: Làm sao biết user đang có quyền gì?**
- A: Vào **Quản trị** → **Phân quyền** → Chọn vai trò của user để xem

**Q: Có thể gán nhiều vai trò cho 1 user không?**
- A: Có, user sẽ có quyền tổng hợp của tất cả vai trò

**Q: Xóa vai trò bị lỗi "đang được sử dụng"?**
- A: Vào **Tài khoản** → Gỡ vai trò khỏi tất cả user → Sau đó mới xóa được

**Q: Menu mới thêm vào code không hiển thị?**
- A: Vào **Phân quyền** → Click **"Khởi tạo menu"** để đồng bộ

---

## 📝 Tóm tắt nhanh

| Thao tác | Module | Vị trí nút | Yêu cầu |
|----------|--------|------------|---------|
| **Tạo vai trò** | Vai trò | Nút "Tạo mới" | Điền mã + tên duy nhất |
| **Sửa vai trò** | Vai trò | Nút "Sửa" | Chọn 1 dòng trước |
| **Xóa vai trò** | Vai trò | Nút "Xóa" | Không có user nào dùng |
| **Phân quyền Menu** | Phân quyền | Tab "Menu" + Nút "Lưu" | Chọn vai trò trước |
| **Phân quyền Chức năng** | Phân quyền | Tab "Chức năng" + Nút "Lưu" | Chọn vai trò trước |
| **Khởi tạo Menu** | Phân quyền | Nút "Khởi tạo menu" | Chỉ làm 1 lần ban đầu |
| **Khởi tạo Chức năng** | Phân quyền | Nút "Khởi tạo chức năng" | Chỉ làm 1 lần ban đầu |

---

**Ngày tạo**: 25/12/2025  
**Phiên bản**: 1.0  
**Người tạo**: AI Assistant
