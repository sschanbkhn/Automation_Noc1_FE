# TÀI LIỆU CẤU TRÚC DỰ ÁN AUTOMATION_FRONTEND

## 📋 Tổng quan dự án

**Tên dự án:** Automation Frontend  
**Framework:** React 17.0.1 + TypeScript 4.1.5  
**Build Tool:** Webpack 5.21.2  
**State Management:** Redux Toolkit + Redux Thunk  
**UI Framework:** Bootstrap 5.0.1 + Element React  
**Routing:** React Router DOM 6.3.0  
**HTTP Client:** Axios  
**Styling:** SCSS + CSS Modules  

## 🏗️ Cấu trúc dự án

```
Automation_FontEnd/
├── src/
│   ├── app/                    # Application core
│   │   ├── App.tsx            # Main App component
│   │   ├── containers/        # Container components
│   │   └── layouts/           # Layout components
│   │       ├── Header.tsx     # Header component
│   │       ├── Sidebar.tsx    # Sidebar navigation
│   │       ├── Main.tsx       # Main content area
│   │       └── Footer.tsx     # Footer component
│   ├── components/            # Reusable components
│   │   ├── common/            # Common UI components
│   │   ├── Home/              # Home page components
│   │   ├── User/              # User management components
│   │   ├── System/            # System management components
│   │   ├── Category/          # Category management components
│   │   ├── Network/           # Network management components
│   │   ├── ANM/               # ANM components
│   │   ├── INOC1/             # INOC1 components
│   │   ├── RNOC1/             # RNOC1 components
│   │   └── SNOC/              # SNOC components
│   ├── assets/                # Static assets
│   │   ├── css/               # CSS files
│   │   ├── scss/              # SCSS files
│   │   ├── img/               # Images
│   │   ├── font/              # Fonts
│   │   └── json/              # JSON configuration files
│   ├── services/              # API services
│   ├── store/                 # Redux store
│   │   ├── app/               # App state management
│   │   └── index.tsx          # Store configuration
│   ├── routes/                # Routing configuration
│   ├── helpers/               # Utility functions
│   ├── models/                # TypeScript interfaces
│   ├── DashboardAutomation/   # Dashboard components
│   ├── DashboardJS/           # JavaScript dashboard components
│   ├── uielements/            # UI elements and charts
│   ├── styles/                # Global styles
│   ├── index.html             # HTML template
│   ├── index.tsx              # Application entry point
│   └── globals.d.ts           # Global TypeScript declarations
├── package.json               # Dependencies and scripts
├── webpack.config.js          # Webpack configuration
├── tsconfig.json              # TypeScript configuration
└── postcss.config.js          # PostCSS configuration
```

## 📁 Chi tiết cấu trúc từng thư mục

### 1. src/app/ (Application Core)

**Mục đích:** Chứa các component chính của ứng dụng và layout.

```
app/
├── App.tsx                    # Main App component với Redux connection
├── containers/                # Container components (nếu có)
└── layouts/                   # Layout components
    ├── Header.tsx             # Header với navigation và user info
    ├── Sidebar.tsx            # Sidebar với menu navigation
    ├── Main.tsx               # Main content wrapper
    └── Footer.tsx             # Footer component
```

### 2. src/components/ (Reusable Components)

**Mục đích:** Chứa tất cả các component có thể tái sử dụng, được tổ chức theo module.

```
components/
├── common/                    # Common UI components
│   ├── CtrlButton.tsx         # Button component
│   ├── CtrlInput.tsx          # Input component
│   ├── CtrlSelect.tsx         # Select component
│   ├── CtrlDynamicTable.tsx   # Dynamic table component
│   ├── CtrlDynamicForm.tsx    # Dynamic form component
│   ├── Loading.tsx            # Loading spinner
│   ├── Login.tsx              # Login form
│   ├── Profile.tsx            # User profile
│   ├── Page401.tsx            # 401 error page
│   ├── Page404.tsx            # 404 error page
│   └── *.tsx                  # Other common components
├── Home/                      # Home page components
├── User/                      # User management
│   ├── Account/               # Account management
│   ├── Organ/                 # Organization management
│   ├── Permission/            # Permission management
│   └── index.tsx              # User module exports
├── System/                    # System management
│   ├── Config/                # Configuration management
│   └── index.tsx              # System module exports
├── Category/                  # Category management
│   ├── CategoryAlarmCode/     # Alarm code categories
│   ├── CategoryAlarmLevel/    # Alarm level categories
│   ├── CategoryAlarmType/     # Alarm type categories
│   ├── CategoryStatus/        # Status categories
│   └── index.tsx              # Category module exports
├── Network/                   # Network management
│   ├── CableManagement/       # Cable management
│   ├── ConfigurationLogs/     # Configuration logs
│   ├── CurenAlarm/            # Current alarms
│   ├── DevicePorts/           # Device ports
│   ├── Devices/               # Device management
│   ├── DeviceTypes/           # Device types
│   ├── HistoryCurenAlarm/     # Alarm history
│   ├── LinksMaps/             # Network links and maps
│   ├── Manufacturers/         # Manufacturer management
│   ├── NetworkLinks/          # Network links
│   └── index.tsx              # Network module exports
├── ANM/                       # ANM components
├── INOC1/                     # INOC1 components
├── RNOC1/                     # RNOC1 components
└── SNOC/                      # SNOC components
```

### 3. src/services/ (API Services)

**Mục đích:** Chứa các service để gọi API, được tổ chức theo module.

```
services/
├── UserService.tsx            # User management API
├── RoleService.tsx            # Role management API
├── PermissionService.tsx      # Permission management API
├── OrganService.tsx           # Organization API
├── ConfigService.tsx          # Configuration API
├── CategoryService.tsx        # Category management API
├── Net_AlarmTypeService.tsx   # Network alarm type API
├── Net_DevicesService.tsx     # Network devices API
├── Net_DeviceTypesService.tsx # Network device types API
├── Net_DevicePortsService.tsx # Network device ports API
├── Net_CurenAlarmService.tsx  # Network current alarms API
├── Net_HistoryCurenAlarmService.tsx # Network alarm history API
├── Net_ManufacturersService.tsx # Network manufacturers API
├── Net_NetworkLinksService.tsx # Network links API
├── Net_CableManagementService.tsx # Cable management API
├── Net_ConfigurationLogsService.tsx # Configuration logs API
└── ResourceService.tsx        # Resource management API
```

### 4. src/store/ (Redux Store)

**Mục đích:** Quản lý state toàn cục của ứng dụng.

```
store/
├── app/                       # App state management
│   ├── actions.ts             # Redux actions
│   ├── reducer.ts             # Redux reducer
│   ├── selectors.ts           # Redux selectors
│   └── types.ts               # TypeScript types
└── index.tsx                  # Store configuration với Redux Toolkit
```

### 5. src/routes/ (Routing)

**Mục đích:** Cấu hình routing và navigation.

```
routes/
├── MainPageRoute.tsx          # Main application routes
└── FullPageRoute.tsx          # Full page routes (login, etc.)
```

### 6. src/helpers/ (Utilities)

**Mục đích:** Chứa các utility functions và helpers.

```
helpers/
├── request.ts                 # Axios configuration và interceptors
├── cookie.ts                  # Cookie management
├── regular.ts                 # Regular expressions
└── *.ts                       # Other utility functions
```

### 7. src/assets/ (Static Assets)

**Mục đích:** Chứa các tài nguyên tĩnh.

```
assets/
├── css/                       # CSS files
│   └── mystyle.css            # Custom styles
├── scss/                      # SCSS files
│   └── mystyle.scss           # Custom SCSS styles
├── img/                       # Images
├── font/                      # Fonts
└── json/                      # JSON configuration files
    └── menu_config.json       # Menu configuration
```

## 🎯 Quy ước đặt tên

### 1. Components
- **Common Components:** `Ctrl[ComponentName].tsx`
  - Ví dụ: `CtrlButton.tsx`, `CtrlInput.tsx`, `CtrlDynamicTable.tsx`
- **Page Components:** `[PageName].tsx`
  - Ví dụ: `Account.tsx`, `Config.tsx`, `Home.tsx`
- **Layout Components:** `[LayoutName].tsx`
  - Ví dụ: `Header.tsx`, `Sidebar.tsx`, `Main.tsx`

### 2. Services
- **Service Files:** `[ModuleName]Service.tsx`
  - Ví dụ: `UserService.tsx`, `Net_DevicesService.tsx`
- **Network Services:** `Net_[ServiceName]Service.tsx`
  - Ví dụ: `Net_AlarmTypeService.tsx`, `Net_DevicesService.tsx`

### 3. Modules
- **Module Directories:** `[ModuleName]/`
  - Ví dụ: `User/`, `System/`, `Network/`
- **Module Index:** `index.tsx` trong mỗi module để export components

### 4. Files và Folders
- **PascalCase:** Components, Classes, Interfaces
- **camelCase:** Variables, Functions, Files
- **kebab-case:** URLs, CSS classes
- **UPPER_CASE:** Constants

## 🔧 Cấu hình và Dependencies

### 1. Core Dependencies
- **React:** `^17.0.1`
- **TypeScript:** `^4.1.5`
- **Redux Toolkit:** `^1.8.2`
- **React Router DOM:** `^6.3.0`
- **Axios:** `^0.21.1`
- **Bootstrap:** `^5.0.1`
- **Element React:** `^1.4.34`

### 2. Build Tools
- **Webpack:** `^5.21.2`
- **Babel:** `^7.12.16`
- **PostCSS:** `^8.2.6`
- **Sass:** `^1.32.7`

### 3. Development Tools
- **ESLint:** `^7.20.0`
- **TypeScript:** `^4.1.5`
- **Webpack Dev Server:** `^3.11.2`

## 🚀 Hướng dẫn phát triển

### 1. Tạo Component mới
```typescript
// components/NewModule/NewComponent.tsx
import React from 'react';
import { connect } from 'react-redux';

interface Props {
  // Component props
}

const NewComponent: React.FC<Props> = (props) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

const mapState = ({ ...state }) => ({
  // Redux state mapping
});

const mapDispatchToProps = {
  // Redux actions
};

export default connect(mapState, mapDispatchToProps)(NewComponent);
```

### 2. Tạo Service mới
```typescript
// services/NewModuleService.tsx
import request from 'helpers/request';

export const NewModuleService = {
  getAll: () => request.get('/api/newmodule'),
  getById: (id: number) => request.get(`/api/newmodule/${id}`),
  create: (data: any) => request.post('/api/newmodule', data),
  update: (id: number, data: any) => request.put(`/api/newmodule/${id}`, data),
  delete: (id: number) => request.delete(`/api/newmodule/${id}`)
};
```

### 3. Tạo Redux Action mới
```typescript
// store/app/actions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { NewModuleService } from 'services/NewModuleService';

export const fetchNewModuleData = createAsyncThunk(
  'app/fetchNewModuleData',
  async () => {
    const response = await NewModuleService.getAll();
    return response.Data;
  }
);
```

### 4. Thêm Route mới
```typescript
// routes/MainPageRoute.tsx
const GetPage = (code: String) => {
  switch (code) {
    case "NewModule":
      return <NewModule />;
    // ... other cases
  }
};
```

### 5. Thêm Menu Item
```json
// assets/json/menu_config.json
{
  "code": "NewModule",
  "name": "New Module",
  "url": "/new-module",
  "icon": "bi bi-grid"
}
```

## 📝 Quy ước coding

### 1. Component Structure
- Sử dụng functional components với hooks
- Kết nối Redux với `connect` HOC
- Export default component
- Sử dụng TypeScript interfaces cho props

### 2. State Management
- Sử dụng Redux Toolkit cho global state
- Sử dụng local state cho component-specific state
- Sử dụng async thunks cho API calls

### 3. Styling
- Sử dụng Bootstrap classes cho layout
- Sử dụng Element React components cho UI
- Sử dụng SCSS cho custom styles
- Sử dụng CSS modules khi cần

### 4. API Calls
- Sử dụng Axios với interceptors
- Tất cả API calls thông qua services
- Xử lý errors trong interceptors
- Sử dụng JWT token cho authentication

### 5. Error Handling
- Global error handling trong Axios interceptors
- Component-level error boundaries
- User-friendly error messages
- Proper loading states

## 🔍 Authentication và Authorization

### 1. JWT Token Management
- Token được lưu trong cookies
- Automatic token refresh
- Logout khi token hết hạn
- Redirect to login page

### 2. Route Protection
- Protected routes trong MainPageRoute
- Menu visibility based on user permissions
- Role-based access control

### 3. User Context
- User info được lưu trong Redux store
- User permissions được check từ backend
- Dynamic menu generation

## 🎨 UI/UX Guidelines

### 1. Design System
- Bootstrap 5 cho layout và components
- Element React cho form components
- Bootstrap Icons cho icons
- Consistent color scheme

### 2. Responsive Design
- Mobile-first approach
- Bootstrap grid system
- Responsive tables và forms
- Touch-friendly interactions

### 3. Loading States
- Loading spinners cho async operations
- Skeleton loading cho content
- Progress indicators cho long operations

## 🧪 Testing

### 1. Component Testing
- Unit tests cho components
- Integration tests cho user flows
- Mock Redux store và API calls

### 2. E2E Testing
- End-to-end testing với Cypress
- Critical user journeys
- Cross-browser testing

## 📚 Documentation

### 1. Component Documentation
- JSDoc comments cho components
- Props documentation
- Usage examples

### 2. API Documentation
- Service method documentation
- Request/response examples
- Error handling

## 🔄 Build và Deployment

### 1. Development
```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for development
npm run dev

# Watch mode
npm run watch
```

### 2. Production
```bash
# Build for production
npm run build

# Serve production build
npm run serve
```

### 3. Environment Configuration
- Environment variables trong `.env` files
- Different configs cho development/production
- API URL configuration

---

**Lưu ý:** Tài liệu này cần được cập nhật khi có thay đổi trong cấu trúc dự án hoặc quy ước mới. 