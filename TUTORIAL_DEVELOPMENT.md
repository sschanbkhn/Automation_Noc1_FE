# HƯỚNG DẪN PHÁT TRIỂN MODULE TRONG PROJECT AUTOMATION NOC

## Mục lục
1. [Tổng quan về kiến trúc](#tổng-quan-về-kiến-trúc)
2. [Cấu trúc module chuẩn](#cấu-trúc-module-chuẩn)
3. [Quy trình phát triển module](#quy-trình-phát-triển-module)
4. [Hướng dẫn từng bước](#hướng-dẫn-từng-bước)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 1. TỔNG QUAN VỀ KIẾN TRÚC

### 1.1 Kiến trúc tổng thể
Project sử dụng kiến trúc **Redux + React** với pattern **Action-Reducer-Component**:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │     Actions     │    │    Reducers     │
│   (UI Layer)    │◄──►│  (Business      │◄──►│   (State        │
│                 │    │   Logic)        │    │   Management)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Services      │    │     Models      │    │     Store       │
│   (API Layer)   │    │   (Data Types)  │    │   (Global State)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 Cấu trúc thư mục chuẩn
```
src/
├── components/
│   └── [ModuleName]/
│       ├── index.tsx              # Component chính
│       ├── Action.ts              # Redux actions
│       ├── Reducer.ts             # Redux reducer
│       ├── InitState.ts           # Initial state
│       ├── ListView.json          # Cấu hình bảng
│       └── Form/
│           ├── index.tsx          # Form component
│           ├── Action.ts          # Form actions
│           └── FormInput.json     # Cấu hình form
├── services/
│   └── [ModuleName]Service.tsx    # API service
└── models/
    └── [ModuleName].ts            # Type definitions
```

---

## 2. CẤU TRÚC MODULE CHUẨN

### 2.1 Các file bắt buộc

#### **index.tsx** - Component chính
```typescript
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './Action';
import { RootState } from 'store';

interface Props {
    moduleState: any;
    actions: any;
}

const ModuleComponent = ({ moduleState, actions }: Props) => {
    useEffect(() => {
        actions.loadData();
    }, []);

    return (
        <div className="module-container">
            {/* UI Components */}
        </div>
    );
};

const mapState = (state: RootState) => ({
    moduleState: state.moduleName
});

const mapDispatch = (dispatch: any) => ({
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapState, mapDispatch)(ModuleComponent);
```

#### **Action.ts** - Redux Actions
```typescript
import { createAction } from '@reduxjs/toolkit';

// Action Types
export const LOAD_DATA = 'module/LOAD_DATA';
export const LOAD_DATA_SUCCESS = 'module/LOAD_DATA_SUCCESS';
export const LOAD_DATA_FAILURE = 'module/LOAD_DATA_FAILURE';

// Action Creators
export const loadData = createAction(LOAD_DATA);
export const loadDataSuccess = createAction<any>(LOAD_DATA_SUCCESS);
export const loadDataFailure = createAction<string>(LOAD_DATA_FAILURE);

// Async Actions
export const fetchData = () => async (dispatch: any) => {
    try {
        dispatch(loadData());
        const response = await ModuleService.getData();
        dispatch(loadDataSuccess(response.data));
    } catch (error) {
        dispatch(loadDataFailure(error.message));
    }
};
```

#### **Reducer.ts** - Redux Reducer
```typescript
import { createReducer } from '@reduxjs/toolkit';
import * as actions from './Action';
import { initialState } from './InitState';

export default createReducer(initialState, (builder) => {
    builder
        .addCase(actions.loadData, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(actions.loadDataSuccess, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        })
        .addCase(actions.loadDataFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
});
```

#### **InitState.ts** - Initial State
```typescript
export interface ModuleState {
    loading: boolean;
    data: any[];
    error: string | null;
    selectedItem: any;
    filters: any;
}

export const initialState: ModuleState = {
    loading: false,
    data: [],
    error: null,
    selectedItem: null,
    filters: {}
};
```

#### **ListView.json** - Cấu hình bảng
```json
{
    "title": "Danh sách Module",
    "columns": [
        {
            "field": "id",
            "header": "ID",
            "width": "80px",
            "sortable": true
        },
        {
            "field": "name",
            "header": "Tên",
            "width": "200px",
            "sortable": true
        },
        {
            "field": "status",
            "header": "Trạng thái",
            "width": "120px",
            "render": "status"
        },
        {
            "field": "actions",
            "header": "Thao tác",
            "width": "150px",
            "render": "actions"
        }
    ],
    "pagination": {
        "pageSize": 10,
        "showSizeChanger": true
    },
    "search": {
        "enabled": true,
        "fields": ["name", "description"]
    }
}
```

---

## 3. QUY TRÌNH PHÁT TRIỂN MODULE

### 3.1 Bước 1: Phân tích yêu cầu
- [ ] Xác định chức năng chính của module
- [ ] Thiết kế cấu trúc dữ liệu
- [ ] Xác định các API endpoints cần thiết
- [ ] Thiết kế UI/UX mockup

### 3.2 Bước 2: Tạo cấu trúc thư mục
```bash
mkdir -p src/components/[ModuleName]/Form
mkdir -p src/services
mkdir -p src/models
```

### 3.3 Bước 3: Tạo các file cơ bản
1. **Tạo Model** (`src/models/[ModuleName].ts`)
2. **Tạo Service** (`src/services/[ModuleName]Service.tsx`)
3. **Tạo State Management** (Action, Reducer, InitState)
4. **Tạo Components** (index.tsx, Form/index.tsx)
5. **Tạo cấu hình** (ListView.json, FormInput.json)

### 3.4 Bước 4: Tích hợp vào hệ thống
1. **Đăng ký Reducer** trong store
2. **Thêm route** trong routing
3. **Thêm menu** trong menu_config.json
4. **Test và debug**

---

## 4. HƯỚNG DẪN TỪNG BƯỚC

### 4.1 Ví dụ: Tạo module "DeviceManagement"

#### **Bước 1: Tạo Model**
```typescript
// src/models/Device.ts
export interface Device {
    id: number;
    name: string;
    type: string;
    status: 'active' | 'inactive' | 'maintenance';
    location: string;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}

export interface DeviceFilters {
    name?: string;
    type?: string;
    status?: string;
    location?: string;
}
```

#### **Bước 2: Tạo Service**
```typescript
// src/services/DeviceService.tsx
import axios from 'axios';
import { Device, DeviceFilters } from 'models/Device';

const API_BASE = process.env.REACT_APP_API_URL;

export class DeviceService {
    static async getDevices(filters?: DeviceFilters) {
        const response = await axios.get(`${API_BASE}/devices`, { params: filters });
        return response.data;
    }

    static async getDevice(id: number) {
        const response = await axios.get(`${API_BASE}/devices/${id}`);
        return response.data;
    }

    static async createDevice(device: Partial<Device>) {
        const response = await axios.post(`${API_BASE}/devices`, device);
        return response.data;
    }

    static async updateDevice(id: number, device: Partial<Device>) {
        const response = await axios.put(`${API_BASE}/devices/${id}`, device);
        return response.data;
    }

    static async deleteDevice(id: number) {
        const response = await axios.delete(`${API_BASE}/devices/${id}`);
        return response.data;
    }
}
```

#### **Bước 3: Tạo State Management**

**InitState.ts:**
```typescript
import { Device, DeviceFilters } from 'models/Device';

export interface DeviceState {
    loading: boolean;
    devices: Device[];
    selectedDevice: Device | null;
    filters: DeviceFilters;
    error: string | null;
    total: number;
    currentPage: number;
    pageSize: number;
}

export const initialState: DeviceState = {
    loading: false,
    devices: [],
    selectedDevice: null,
    filters: {},
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10
};
```

**Action.ts:**
```typescript
import { createAction } from '@reduxjs/toolkit';
import { Device, DeviceFilters } from 'models/Device';

// Action Types
export const LOAD_DEVICES = 'device/LOAD_DEVICES';
export const LOAD_DEVICES_SUCCESS = 'device/LOAD_DEVICES_SUCCESS';
export const LOAD_DEVICES_FAILURE = 'device/LOAD_DEVICES_FAILURE';
export const SELECT_DEVICE = 'device/SELECT_DEVICE';
export const SET_FILTERS = 'device/SET_FILTERS';

// Action Creators
export const loadDevices = createAction(LOAD_DEVICES);
export const loadDevicesSuccess = createAction<{devices: Device[], total: number}>(LOAD_DEVICES_SUCCESS);
export const loadDevicesFailure = createAction<string>(LOAD_DEVICES_FAILURE);
export const selectDevice = createAction<Device>(SELECT_DEVICE);
export const setFilters = createAction<DeviceFilters>(SET_FILTERS);

// Async Actions
export const fetchDevices = (filters?: DeviceFilters, page = 1, pageSize = 10) => async (dispatch: any) => {
    try {
        dispatch(loadDevices());
        const response = await DeviceService.getDevices({ ...filters, page, pageSize });
        dispatch(loadDevicesSuccess({
            devices: response.data,
            total: response.total
        }));
    } catch (error: any) {
        dispatch(loadDevicesFailure(error.message));
    }
};
```

**Reducer.ts:**
```typescript
import { createReducer } from '@reduxjs/toolkit';
import * as actions from './Action';
import { initialState } from './InitState';

export default createReducer(initialState, (builder) => {
    builder
        .addCase(actions.loadDevices, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(actions.loadDevicesSuccess, (state, action) => {
            state.loading = false;
            state.devices = action.payload.devices;
            state.total = action.payload.total;
        })
        .addCase(actions.loadDevicesFailure, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(actions.selectDevice, (state, action) => {
            state.selectedDevice = action.payload;
        })
        .addCase(actions.setFilters, (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        });
});
```

#### **Bước 4: Tạo Components**

**index.tsx:**
```typescript
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './Action';
import CtrlDynamicTable from 'components/common/CtrlDynamicTable';
import CtrlButton from 'components/common/CtrlButton';
import { RootState } from 'store';
import listViewConfig from './ListView.json';

interface Props {
    deviceState: any;
    actions: any;
}

const DeviceManagement = ({ deviceState, actions }: Props) => {
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        actions.fetchDevices();
    }, []);

    const handleAdd = () => {
        setShowForm(true);
    };

    const handleEdit = (device: any) => {
        actions.selectDevice(device);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa thiết bị này?')) {
            try {
                await DeviceService.deleteDevice(id);
                actions.fetchDevices();
            } catch (error) {
                console.error('Error deleting device:', error);
            }
        }
    };

    return (
        <div className="device-management">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Quản lý thiết bị</h2>
                <CtrlButton
                    type="primary"
                    icon="bi bi-plus"
                    onClick={handleAdd}
                >
                    Thêm thiết bị
                </CtrlButton>
            </div>

            <CtrlDynamicTable
                data={deviceState.devices}
                config={listViewConfig}
                loading={deviceState.loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {showForm && (
                <DeviceForm
                    visible={showForm}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        actions.fetchDevices();
                    }}
                />
            )}
        </div>
    );
};

const mapState = (state: RootState) => ({
    deviceState: state.device
});

const mapDispatch = (dispatch: any) => ({
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapState, mapDispatch)(DeviceManagement);
```

#### **Bước 5: Tạo Form Component**

**Form/index.tsx:**
```typescript
import React, { useEffect, useState } from 'react';
import CtrlDynamicForm from 'components/common/CtrlDynamicForm';
import { Device } from 'models/Device';
import formConfig from './FormInput.json';

interface Props {
    visible: boolean;
    device?: Device;
    onClose: () => void;
    onSuccess: () => void;
}

const DeviceForm = ({ visible, device, onClose, onSuccess }: Props) => {
    const [formData, setFormData] = useState<Partial<Device>>({});

    useEffect(() => {
        if (device) {
            setFormData(device);
        } else {
            setFormData({});
        }
    }, [device]);

    const handleSubmit = async (data: any) => {
        try {
            if (device?.id) {
                await DeviceService.updateDevice(device.id, data);
            } else {
                await DeviceService.createDevice(data);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving device:', error);
        }
    };

    return (
        <CtrlDynamicForm
            visible={visible}
            title={device ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
            config={formConfig}
            data={formData}
            onSubmit={handleSubmit}
            onCancel={onClose}
        />
    );
};

export default DeviceForm;
```

#### **Bước 6: Tạo cấu hình**

**ListView.json:**
```json
{
    "title": "Danh sách thiết bị",
    "columns": [
        {
            "field": "id",
            "header": "ID",
            "width": "80px",
            "sortable": true
        },
        {
            "field": "name",
            "header": "Tên thiết bị",
            "width": "200px",
            "sortable": true
        },
        {
            "field": "type",
            "header": "Loại",
            "width": "150px",
            "sortable": true
        },
        {
            "field": "status",
            "header": "Trạng thái",
            "width": "120px",
            "render": "status",
            "options": {
                "active": { "label": "Hoạt động", "class": "badge bg-success" },
                "inactive": { "label": "Không hoạt động", "class": "badge bg-danger" },
                "maintenance": { "label": "Bảo trì", "class": "badge bg-warning" }
            }
        },
        {
            "field": "location",
            "header": "Vị trí",
            "width": "150px"
        },
        {
            "field": "ipAddress",
            "header": "IP Address",
            "width": "150px"
        },
        {
            "field": "actions",
            "header": "Thao tác",
            "width": "150px",
            "render": "actions"
        }
    ],
    "pagination": {
        "pageSize": 10,
        "showSizeChanger": true
    },
    "search": {
        "enabled": true,
        "fields": ["name", "type", "location"]
    }
}
```

**FormInput.json:**
```json
{
    "fields": [
        {
            "name": "name",
            "label": "Tên thiết bị",
            "type": "text",
            "required": true,
            "placeholder": "Nhập tên thiết bị"
        },
        {
            "name": "type",
            "label": "Loại thiết bị",
            "type": "select",
            "required": true,
            "options": [
                { "value": "router", "label": "Router" },
                { "value": "switch", "label": "Switch" },
                { "value": "server", "label": "Server" },
                { "value": "firewall", "label": "Firewall" }
            ]
        },
        {
            "name": "status",
            "label": "Trạng thái",
            "type": "select",
            "required": true,
            "options": [
                { "value": "active", "label": "Hoạt động" },
                { "value": "inactive", "label": "Không hoạt động" },
                { "value": "maintenance", "label": "Bảo trì" }
            ]
        },
        {
            "name": "location",
            "label": "Vị trí",
            "type": "text",
            "required": true,
            "placeholder": "Nhập vị trí"
        },
        {
            "name": "ipAddress",
            "label": "IP Address",
            "type": "text",
            "required": true,
            "placeholder": "192.168.1.1",
            "validation": "ip"
        }
    ]
}
```

### 4.2 Tích hợp vào hệ thống

#### **Đăng ký Reducer trong store**
```typescript
// src/store/index.tsx
import deviceReducer from 'components/DeviceManagement/Reducer';

const rootReducer = combineReducers({
    // ... other reducers
    device: deviceReducer
});
```

#### **Thêm route**
```typescript
// src/routes/MainPageRoute.tsx
import DeviceManagement from 'components/DeviceManagement';

// Trong routes array
{
    path: '/device-management',
    element: <DeviceManagement />
}
```

#### **Thêm menu**
```json
// src/assets/json/menu_config.json
{
    "code": "DeviceManagement",
    "name": "Quản lý thiết bị",
    "url": "/device-management",
    "icon": "bi bi-hdd-network"
}
```

---

## 5. BEST PRACTICES

### 5.1 Cấu trúc code
- ✅ Sử dụng TypeScript cho type safety
- ✅ Tách biệt logic business và UI
- ✅ Sử dụng Redux Toolkit cho state management
- ✅ Tạo reusable components
- ✅ Sử dụng constants cho action types

### 5.2 Performance
- ✅ Sử dụng React.memo cho components
- ✅ Implement pagination cho danh sách lớn
- ✅ Lazy loading cho routes
- ✅ Debounce cho search input

### 5.3 Error Handling
- ✅ Try-catch cho async operations
- ✅ Error boundaries cho React components
- ✅ User-friendly error messages
- ✅ Loading states

### 5.4 Security
- ✅ Validate input data
- ✅ Sanitize user inputs
- ✅ Implement proper authentication
- ✅ Use HTTPS for API calls

### 5.5 Testing
- ✅ Unit tests cho business logic
- ✅ Integration tests cho API calls
- ✅ Component tests cho UI
- ✅ E2E tests cho user flows

---

## 6. TROUBLESHOOTING

### 6.1 Lỗi thường gặp

#### **Redux không update state**
```typescript
// Kiểm tra action types có khớp không
// Kiểm tra reducer có handle đúng action không
// Kiểm tra mapStateToProps có đúng không
```

#### **API calls fail**
```typescript
// Kiểm tra API endpoint
// Kiểm tra authentication headers
// Kiểm tra CORS configuration
// Kiểm tra network connectivity
```

#### **Component không render**
```typescript
// Kiểm tra props có được pass đúng không
// Kiểm tra conditional rendering logic
// Kiểm tra CSS có ẩn component không
```

### 6.2 Debug Tools
- **Redux DevTools**: Debug Redux state
- **React DevTools**: Debug React components
- **Network Tab**: Debug API calls
- **Console**: Debug JavaScript errors

### 6.3 Performance Monitoring
- **React Profiler**: Monitor component performance
- **Bundle Analyzer**: Analyze bundle size
- **Lighthouse**: Audit performance

---

## 7. TÀI LIỆU THAM KHẢO

### 7.1 Official Documentation
- [React Documentation](https://reactjs.org/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Webpack Documentation](https://webpack.js.org/concepts/)

### 7.2 Project-specific
- `package.json` - Dependencies và scripts
- `webpack.config.js` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `src/components/common/` - Reusable components

### 7.3 Code Examples
- Xem các module hiện có trong `src/components/` để tham khảo
- Xem `src/services/` để hiểu pattern API calls
- Xem `src/store/` để hiểu Redux setup

---

## 8. KẾT LUẬN

Việc phát triển module trong project Automation NOC cần tuân thủ:
1. **Cấu trúc chuẩn** đã được định nghĩa
2. **Quy trình phát triển** từ phân tích đến tích hợp
3. **Best practices** về performance, security, testing
4. **Error handling** và debugging techniques

Đảm bảo code quality và maintainability cho hệ thống automation phức tạp này. 