# TÀI LIỆU CẤU TRÚC MODULE HOÀN CHỈNH

## 📋 Tổng quan

Tài liệu này mô tả cấu trúc hoàn chỉnh của một module trong hệ thống Automation, sử dụng module `Category/CategoryAlarmCode` làm ví dụ. Khi bạn ra lệnh tạo module mới, tôi sẽ tự động tạo tất cả các thành phần theo cấu trúc này.

## 🏗️ Cấu trúc Module Hoàn Chỉnh

### Frontend (Automation_FontEnd)

```
src/components/[ModuleName]/
├── index.tsx                    # Main component (List view)
├── InitState.ts                 # Initial state và interfaces
├── Action.ts                    # Actions cho list view
├── Reducer.ts                   # Reducer cho list view
├── ListView.json                # Configuration cho table
└── Form/                        # Form sub-module
    ├── index.tsx                # Form component
    ├── InitState.ts             # Form state và interfaces
    ├── Action.ts                # Actions cho form
    ├── Reducer.ts               # Reducer cho form
    └── FormInput.json           # Configuration cho form fields
```

### Backend (Automation_BE)

```
Automation.API/
├── Controllers/
│   └── Sys_[ModuleName]Controller.cs    # API Controller
├── Model/
│   └── Sys_[ModuleName].cs              # Entity model
├── Service/
│   └── Sys_[ModuleName]/
│       ├── IService.cs                  # Service interface
│       └── Service.cs                   # Service implementation
└── ViewModel/
    └── Sys_[ModuleName]/
        └── [ViewModelName].cs           # View models (nếu cần)
```

### Services Layer

```
src/services/
└── [ModuleName]Service.tsx              # API service calls
```

## 📁 Chi tiết từng thành phần

### 1. Frontend - Main Component (index.tsx)

**Mục đích:** Component chính hiển thị danh sách dữ liệu với CRUD operations.

```typescript
// src/components/[ModuleName]/index.tsx
import { CtrlConfirm, CtrlDialog, CtrlNotification } from 'components/common';
import Card from 'components/common/Card';
import CtrlDynamicButton from 'components/common/CtrlDynamicButton';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import { Message } from 'models/Enums';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { connect } from "react-redux";
import { ModuleName, ModuleType, InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import moduleListViewJson from './ListView.json';
import ModuleForm from './Form'
import { IResponseMessage } from 'models/Apps';

interface Props {}

const ModuleList = (props: Props) => {  
    const [state, dispatch] = useReducer(Reducer, InitState)
    const [moduleId, setModuleId] = useState('');
    const moduleListView:any = moduleListViewJson;    
    const refNotification = useRef<any>();
    const refConfirm_DeleteItem = useRef<any>();
    const refDynamicTable = useRef<any>();
    const [dialogVisible, setDialogVisible] = useState(false);
    
    useEffect(() => {        
        Actions.GetItems(ModuleType, dispatch);     
    }, [])
    
    const ActionEvents = {
        onClickCreate: () => {
            setModuleId('');
            setDialogVisible(true);    
        },
        onClickUpdate: () => {
            if(!getRowId()) { 
                refNotification.current.showNotification("warning", Message.Require_Row_Selection); 
                return; 
            }            
            setModuleId(getRowId());
            setDialogVisible(true);            
        },
        onClickDelete: async () => {
            if(!getRowId()) { 
                refNotification.current.showNotification("warning", Message.Require_Row_Selection); 
                return; 
            }
            refConfirm_DeleteItem.current.showConfirm();            
        },
    }
    
    const DeleteById = async () => {
        let res:IResponseMessage = await Actions.DeleteById(getRowId(), dispatch);             
        if(res.Success) {            
            refNotification.current.showNotification("success", res.Message);          
            ReloadTableItems();
        }  
    }
    
    const ReloadTableItems = () => {
        Actions.GetItems(ModuleType, dispatch);  
    }
    
    const getRowId = () => {        
        return refDynamicTable.current.getRowId();
    }
    
    let ButtonGroupsRender = () => {
        return <CtrlDynamicButton actionDefs={moduleListView.DataGrid.ActionDefs} actions={ActionEvents} />;
    }    
    
    const DialogMemo = useMemo(() => {
        return <>
        {dialogVisible == true ?
            <CtrlDialog title={moduleId ? "Sửa " + ModuleName: "Tạo mới " + ModuleName} dialogVisible={dialogVisible} onCancel={() => setDialogVisible(false)}>
                <ModuleForm Id={moduleId} ReloadTableItems={ReloadTableItems} />
            </CtrlDialog>
            :<div></div>
        }
        </>
    }, [dialogVisible])
    
    return(
        <>
            <CtrlConfirm ref={refConfirm_DeleteItem} Title={"Thao tác này sẽ xóa " + ModuleName} Ok={async () => {await DeleteById()}} Canel={()=>{}} />
            <CtrlNotification ref={refNotification} />   
            {DialogMemo}
            <Card key='module' title={moduleListView.DataGrid.Title} buttonGroups={ButtonGroupsRender()}>
                <CtrlDynamicTable 
                    ref={refDynamicTable}
                    id={moduleListView.DataGrid.Key} 
                    key={moduleListView.DataGrid.Key} 
                    columnDefs={moduleListView.DataGrid.ColumnDefs} 
                    dataItems={state.DataItems}>                
                </CtrlDynamicTable>
            </Card>
        </>
    )
}

const mapState = ({ ...state }) => ({});
const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(ModuleList);
```

### 2. Frontend - InitState.ts

**Mục đích:** Định nghĩa interfaces và initial state.

```typescript
// src/components/[ModuleName]/InitState.ts
export const ModuleType = 0; // Unique type identifier
export const ModuleName = "Tên Module";

export interface IModelItem {
    Id: String;
    Code: String;
    Name: String;
    Description: String;
    // Add other properties as needed
}

export interface IState {
    DataItems: IModelItem[]
}

export const InitState: IState = {
    DataItems: []
};
```

### 3. Frontend - Action.ts

**Mục đích:** Xử lý các actions gọi API.

```typescript
// src/components/[ModuleName]/Action.ts
import { IResponseMessage } from "models/Apps";
import ModuleService from "services/ModuleService";

export const Actions: any = { 
    GetItems: async (type: any, dispatch: any) => {
        let res: IResponseMessage = await ModuleService.GetItems(type);               
        if(res && res.Success) {           
            dispatch({
                type: "GetItems",
                items: res.Data.Items
            })
        }                       
    },
    DeleteById: async (id: String, dispatch: any) => {                
        let res: IResponseMessage = await ModuleService.DeleteById(id);               
        return res;
    }
}
```

### 4. Frontend - Reducer.ts

**Mục đích:** Quản lý state changes.

```typescript
// src/components/[ModuleName]/Reducer.ts
import { InitState, IState } from "./InitState"

export const Reducer = (state: IState = InitState, action: any) => {  
    switch (action.type) { 
        case 'GetItems':
            return {
                ...state,
                DataItems: action.items
            }
        default:
            return state;
    }
}
```

### 5. Frontend - ListView.json

**Mục đích:** Configuration cho table display.

```json
{
  "DataGrid": {
    "Key": "ModuleGrid",
    "Title": "Quản lý Module",
    "ColumnDefs": [
      {
        "field": "Code",
        "headerName": "Mã",
        "width": 150,
        "sortable": true,
        "filter": true
      },
      {
        "field": "Name", 
        "headerName": "Tên",
        "width": 200,
        "sortable": true,
        "filter": true
      },
      {
        "field": "Description",
        "headerName": "Mô tả",
        "width": 300,
        "sortable": true,
        "filter": true
      }
    ],
    "ActionDefs": [
      {
        "name": "onClickCreate",
        "text": "Tạo mới",
        "icon": "bi bi-plus-circle",
        "type": "primary"
      },
      {
        "name": "onClickUpdate",
        "text": "Sửa",
        "icon": "bi bi-pencil",
        "type": "warning"
      },
      {
        "name": "onClickDelete",
        "text": "Xóa",
        "icon": "bi bi-trash",
        "type": "danger"
      }
    ]
  }
}
```

### 6. Frontend - Form Component

**Mục đích:** Component form cho Create/Update operations.

```typescript
// src/components/[ModuleName]/Form/index.tsx
import CtrlDynamicForm from 'components/common/CtrlDynamicForm';
import CtrlNotification from 'components/common/CtrlNotification';
import { IResponseMessage } from 'models/Apps';
import { Message } from 'models/Enums';
import React, { useEffect, useReducer, useRef } from 'react'
import { connect } from "react-redux";
import { InitState } from './InitState';
import { Actions } from './Action';
import { Reducer } from './Reducer';
import moduleFormInputJson from './FormInput.json';
import { ModuleType } from '../InitState';

interface Props {
  Id: string,
  ReloadTableItems: any
}

const ModuleForm = (props: Props) => {  
  const [state, dispatch] = useReducer(Reducer, InitState)
  
  useEffect(() => {
    Actions.GetItem(props.Id, dispatch);
  }, [props.Id])
  
  let moduleFormInput: any = moduleFormInputJson;
  const refNotification = useRef<any>();
  const refDynamicForm = useRef<any>();
  
  const ActionEvents = {
    onClickSave: async () => {
      let isValid = refDynamicForm.current.onValidation();
      if(isValid) {        
        let stateValues = refDynamicForm.current.getStateValues();
        let res: IResponseMessage = null;                
        
        res = await Actions.CheckDuplicateAttributes(stateValues.Id, stateValues.Code, ModuleType, dispatch);
        if(res.Data) {
          refNotification.current.showNotification("warning", Message.DuplicateAttribute_Code);    
          return; 
        }                           
        
        if(props.Id) {          
          res = await Actions.UpdateItem(stateValues);                      
        } else {
          res = await Actions.CreateItem(stateValues);  
        }           
        
        if(res.Success) {            
          refNotification.current.showNotification("success", res.Message);          
          props.ReloadTableItems();
        }                    
      }
    },
  }
  
  return(
    <>
      <CtrlNotification ref={refNotification} />   
      <CtrlDynamicForm ref={refDynamicForm} initValues={state.DataItem} formDefs={moduleFormInput} actionEvents={ActionEvents} />
    </>
  )
}

const mapState = ({ ...state }) => ({});
const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(ModuleForm);
```

### 7. Frontend - Form Action.ts

**Mục đích:** Actions cho form operations.

```typescript
// src/components/[ModuleName]/Form/Action.ts
import { IResponseMessage } from "models/Apps";
import { Guid } from "models/Enums";
import ModuleService from "services/ModuleService";
import { ModuleType } from "../InitState";
import { IModelItem } from "./InitState";

export const Actions: any = { 
    GetItem: async (id: String, dispatch: any) => {  
        if(id) {      
            let res: IResponseMessage = await ModuleService.GetItem(id);               
            if(res && res.Success) {                       
                dispatch({
                    type: "GetItem",
                    item: res.Data
                })
            }          
        } else {
            let itemNew: IModelItem = { 
                Id: Guid.Empty,
                Code: "",
                Name: "",
                Description: "",
                // Add other default values
            }
            dispatch({
                type: "GetItem",
                item: itemNew
            })
        }
    },
    CreateItem: async (item: IModelItem, dispatch: any) => {        
        let res: IResponseMessage = await ModuleService.CreateItem(item);               
        return res;
    },
    UpdateItem: async (item: IModelItem, dispatch: any) => {        
        let res: IResponseMessage = await ModuleService.UpdateItem(item);               
        return res;
    },
    CheckDuplicateAttributes: async (id: any, code: any, type: any, dispatch: any) => {        
        let res: IResponseMessage = await ModuleService.CheckDuplicateAttributes(id, code, type);               
        return res;
    }
}
```

### 8. Frontend - FormInput.json

**Mục đích:** Configuration cho form fields.

```json
{
  "FormDefs": [
    {
      "field": "Code",
      "label": "Mã",
      "type": "text",
      "required": true,
      "maxLength": 50,
      "placeholder": "Nhập mã..."
    },
    {
      "field": "Name",
      "label": "Tên",
      "type": "text", 
      "required": true,
      "maxLength": 255,
      "placeholder": "Nhập tên..."
    },
    {
      "field": "Description",
      "label": "Mô tả",
      "type": "textarea",
      "required": false,
      "maxLength": 500,
      "placeholder": "Nhập mô tả..."
    }
  ]
}
```

### 9. Frontend - Service

**Mục đích:** API service calls.

```typescript
// src/services/ModuleService.tsx
import request from "helpers/request"

const Sys_Module = "Sys_Module";

const ModuleService = {    
    GetItems: async (type: any) => {        
        let res: any = await request({
            url: `/${Sys_Module}/1/1000/1000/${type}`,
            method: 'get'
        });
        return res
    },
    GetItem: async (id: String) => {        
        let res: any = await request({
            url: `/${Sys_Module}/${id}`,
            method: 'get'
        });
        return res
    },
    CreateItem: async (data: any) => {        
        let res: any = await request({
            url: `/${Sys_Module}`,
            method: 'post',
            data
        });
        return res
    },
    UpdateItem: async (data: any) => {        
        let res: any = await request({
            url: `/${Sys_Module}`,
            method: 'put',
            data
        });
        return res
    },
    DeleteById: async (id: any) => {        
        var data = [{ Id: id }]
        let res: any = await request({
            url: `/${Sys_Module}`,
            method: 'delete',
            data: data      
        });
        return res
    },
    CheckDuplicateAttributes: async (id: any, code: any, type: any) => {
        let res: any = await request({
          url: `/${Sys_Module}/CheckDuplicateAttributes?Id=${id}&Code=${code}&Type=${type}`,
          method: 'get'
        })
        return res;
    }
}

export default ModuleService
```

### 10. Backend - Controller

**Mục đích:** API endpoints.

```csharp
// Automation.API/Controllers/Sys_ModuleController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Automation.API.Infrastructure.Authorization;
using Automation.API.Service;
using Automation.API.Controllers;
using Automation.API.Model;
using Automation.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Automation.API.Controllers
{
    public class Sys_ModuleController : ApiControllerBase<Sys_Module>
    {
        private readonly IServiceWrapper _service;
        private readonly ILogger<Sys_ModuleController> _logger;
        
        public Sys_ModuleController(IServiceWrapper service, ILogger<Sys_ModuleController> logger) 
            : base(service, logger)
        {
            _logger = logger;
            _service = service;
        }
        
        [HttpGet("{page}/{pageSize}/{totalLimitItems}/{type}")]
        [AuthorizeFilter]
        public async Task<IActionResult> GetListPagedByType(int page = 1, int pageSize = 10, int totalLimitItems = 500, int type = 0)
        {
            try
            {
                _logger.LogInformation($"Call GetListPagedByType params: (page = {page}, pageSize = {pageSize}, totalLimitItems = {totalLimitItems}, type = {type})");
                string search = $"type = {type}";
                var items = await _service.Sys_Module.GetPagedAsync(page, pageSize, totalLimitItems, search);
                return ResponseMessage.Success(items);
            }
            catch (Exception ex)
            {
                _logger.LogError($"GetListPagedByType : {ex.Message}");
                return ResponseMessage.Error(ex.Message);
            }
        }
        
        [HttpGet("CheckDuplicateAttributes")]
        [AuthorizeFilter]
        public async Task<IActionResult> CheckDuplicateAttributes(Guid? id, string code, int type)
        {
            try
            {
                _logger.LogInformation($"Call CheckDuplicateAttributes params: (id = {id}, code = {code}, type = {type})");
                var result = await _service.Sys_Module.IsDupicateAttributesAsync(id, code, type);
                return ResponseMessage.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"CheckDuplicateAttributes : {ex.Message}");
                return ResponseMessage.Error(ex.Message);
            }
        }
    }
}
```

### 11. Backend - Model

**Mục đích:** Entity model cho database.

```csharp
// Automation.API/Model/Sys_Module.cs
using Automation.Core.Enums;
using Automation.Core.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Automation.API.Model
{
    [Table("Sys_Modules")]
    public class Sys_Module : AuditEntity
    {
        [StringLength(55)]
        public string Code { get; set; }
        
        [StringLength(255)]
        public string Name { get; set; }
        
        [StringLength(500)]
        public string Description { get; set; }
        
        public ModuleType Type { get; set; }
        
        public Guid? ParentId { get; set; }
    }
}
```

### 12. Backend - Service Interface

**Mục đích:** Service interface definition.

```csharp
// Automation.API/Service/Sys_Module/IService.cs
using Automation.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace Automation.API.Service.Sys_Module
{
    public interface IService : IRepositoryBase<Model.Sys_Module>
    {
        Task<bool> IsDupicateAttributesAsync(Guid? Id, string Code, int Type);
        Task<Model.Sys_Module> GetItemByCode(Core.Enums.ModuleType Type, string Code);
        Task<Model.Sys_Module> GetItemById(Core.Enums.ModuleType Type, Guid Id);
    }
}
```

### 13. Backend - Service Implementation

**Mục đích:** Service implementation với business logic.

```csharp
// Automation.API/Service/Sys_Module/Service.cs
using Microsoft.EntityFrameworkCore;
using Automation.API.Infrastructure;
using Automation.Core.Constant;
using Automation.Core.Helpers;
using Automation.Core.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Automation.API.Service.Sys_Module
{
    public class Service : RepositoryBase<Model.Sys_Module>, Sys_Module.IService
    {
        private readonly DomainDbContext _dbContext;
        private readonly IDateTimeProvider _dateTimeProvider;
        private readonly IUserProvider _userProvider;
        
        public Service(DomainDbContext dbContext, IDateTimeProvider dateTimeProvider, IUserProvider userService)
            : base(dbContext, dateTimeProvider, userService)
        {
            _dbContext = dbContext;
            _dateTimeProvider = dateTimeProvider;
            _userProvider = userService;
        }
        
        public async Task<bool> IsDupicateAttributesAsync(Guid? Id, string Code, int Type)
        {
            bool result = false;
            if (string.IsNullOrEmpty(Code))
            {
                throw new Exception(Sys_Const.Message.SERVICE_CODE_NOT_EMPTY);
            }
            
            if (GuidHelpers.IsNullOrEmpty(Id))
            {
                result = await _dbContext.Sys_Modules.Where(o => o.Code == Code && o.Type == (Core.Enums.ModuleType)Type).AnyAsync();
            }
            else
            {
                var count = await _dbContext.Sys_Modules.Where(o => o.Id == Id && o.Code == Code && o.Type == (Core.Enums.ModuleType)Type).CountAsync();
                if (count <= 1)
                {
                    result = false;
                }
                else
                {
                    result = true;
                }
            }
            return await Task.FromResult(result);
        }
        
        public async Task<Model.Sys_Module> GetItemByCode(Core.Enums.ModuleType type, string code)
        {
            return await _dbContext.Sys_Modules.Where(o => o.Type == type && o.Code == code).FirstOrDefaultAsync();
        }
        
        public async Task<Model.Sys_Module> GetItemById(Core.Enums.ModuleType type, Guid id)
        {
            return await _dbContext.Sys_Modules.Where(o => o.Type == type && o.Id == id).FirstOrDefaultAsync();
        }
    }
}
```

## 🔧 Các bước tạo module tự động

Khi bạn ra lệnh tạo module mới, tôi sẽ thực hiện các bước sau:

### 1. Frontend Components
- ✅ Tạo thư mục `src/components/[ModuleName]/`
- ✅ Tạo `index.tsx` (main component)
- ✅ Tạo `InitState.ts` (interfaces và state)
- ✅ Tạo `Action.ts` (API actions)
- ✅ Tạo `Reducer.ts` (state management)
- ✅ Tạo `ListView.json` (table configuration)
- ✅ Tạo thư mục `Form/` và các file con
- ✅ Tạo `Form/index.tsx` (form component)
- ✅ Tạo `Form/Action.ts` (form actions)
- ✅ Tạo `Form/Reducer.ts` (form state)
- ✅ Tạo `Form/InitState.ts` (form interfaces)
- ✅ Tạo `Form/FormInput.json` (form configuration)

### 2. Frontend Service
- ✅ Tạo `src/services/[ModuleName]Service.tsx`
- ✅ Implement tất cả CRUD operations
- ✅ Implement duplicate checking

### 3. Backend Components
- ✅ Tạo `Automation.API/Controllers/Sys_[ModuleName]Controller.cs`
- ✅ Tạo `Automation.API/Model/Sys_[ModuleName].cs`
- ✅ Tạo thư mục `Automation.API/Service/Sys_[ModuleName]/`
- ✅ Tạo `IService.cs` (interface)
- ✅ Tạo `Service.cs` (implementation)

### 4. Database Integration
- ✅ Thêm DbSet vào `DomainDbContext.cs`
- ✅ Tạo migration nếu cần
- ✅ Đăng ký service trong `ServiceWrapper.cs`

### 5. Routing & Menu
- ✅ Thêm route vào `MainPageRoute.tsx`
- ✅ Thêm menu item vào `menu_config.json`
- ✅ Export component trong module `index.tsx`

## 🎯 Quy ước đặt tên

### Frontend
- **Module Directory:** `[ModuleName]/` (PascalCase)
- **Component Files:** `index.tsx`, `Action.ts`, `Reducer.ts`
- **Configuration Files:** `ListView.json`, `FormInput.json`
- **Service File:** `[ModuleName]Service.tsx`

### Backend
- **Controller:** `Sys_[ModuleName]Controller.cs`
- **Model:** `Sys_[ModuleName].cs`
- **Service Directory:** `Sys_[ModuleName]/`
- **Service Interface:** `IService.cs`
- **Service Implementation:** `Service.cs`

## 📝 Lưu ý quan trọng

1. **Type Safety:** Tất cả interfaces phải được định nghĩa rõ ràng
2. **Error Handling:** Implement proper error handling ở tất cả layers
3. **Validation:** Form validation và duplicate checking
4. **Logging:** Backend logging cho tất cả operations
5. **Authorization:** JWT token validation cho tất cả API calls
6. **Responsive Design:** UI phải responsive và user-friendly
7. **Performance:** Optimize database queries và frontend rendering

---

**Kết quả:** Khi bạn ra lệnh "Tạo module [TênModule]", tôi sẽ tự động tạo tất cả các thành phần trên theo cấu trúc chuẩn này, đảm bảo tính nhất quán và chất lượng code. 