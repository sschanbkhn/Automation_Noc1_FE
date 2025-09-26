# Automation Frontend

## Overview
Frontend application cho hệ thống Automation NOC1, cung cấp giao diện web cho các module tự động hóa mạng viễn thông.

## Technology Stack
- **Framework**: React 18
- **Language**: JavaScript/TypeScript
- **Styling**: Custom CSS + Inline Styles
- **Build Tool**: Webpack 5
- **HTTP Client**: Custom request helper
- **State Management**: React Hooks (useState, useEffect)
- **UI Components**: Custom components + Bootstrap Icons

## Project Structure
```
Automation_FontEnd/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Common/shared components
│   │   ├── INOC1/         # INOC1 module components
│   │   │   └── I003/      # Thuê bao đa phiên component
│   │   └── ...            # Other modules
│   ├── services/           # API service layer
│   ├── helpers/           # Utility functions
│   ├── assets/            # Static assets
│   │   └── json/          # Configuration files
│   │       └── menu_config.json  # Menu structure
│   └── styles/            # CSS styles
├── public/                # Public assets
├── package.json           # Dependencies
└── webpack.config.js      # Build configuration
```

## Modules

### I003 - Thuê bao đa phiên (Multi-session Subscribers)
**Location**: `src/components/INOC1/I003/index.jsx`
**Route**: `/ClearThuebaoDaphien`

Module quản lý và clear các session vượt ngưỡng của thuê bao với 2 tab chính:

#### Tab 1: Clear Đa Phiên
Hiển thị danh sách BNG và thông tin session:

**Features:**
- ✅ DataTable với pagination (10/20/50/100 records per page)
- ✅ Sorting cho tất cả cột (ASC/DESC với arrows)
- ✅ Clear session per BNG device
- ✅ Real-time loading states
- ✅ Responsive design

**Columns:**
1. **Mã tỉnh** - Province code (`location`)
2. **Tên tỉnh** - Province name (`province_name`)
3. **Thiết bị** - BNG device name (`bng_name`)  
4. **Số vượt phiên** - Over session count (`bng_over_session`) - Red if > 0
5. **Số đã clear** - Cleared session count (`bng_cleared_session`) - Blue if > 0
6. **Tần xuất/ngày** - Clear frequency per day (`bng_clear_frequency`) - Green badge
7. **Action** - Clear button per row

#### Tab 2: Clear theo User
Form nhập thông tin để check và clear session theo user:

**Features:**
- ✅ Username text input
- ✅ BNG selection dropdown với search functionality
- ✅ Auto-load BNG list từ API
- ✅ Check user session info
- ✅ Clear/Clear All user sessions
- ✅ Detailed log display với line breaks

**Workflow:**
1. **Nhập Username** - Text input
2. **Chọn BNG** - Searchable dropdown (BNG name + IP)
3. **Click Check** - Lấy thông tin session từ external API
4. **Xem thông tin** - Display session details:
   - Username, BRAS, IP loop BRAS
   - Số phiên được cho phép (CurrentSession)
   - Số phiên đã được xác thực (OverSession) 
   - Số phiên vượt ngưỡng (MaxSession)
   - Log chi tiết với format đúng
5. **Clear Actions** - Clear hoặc Clear All sessions

## API Services

### I003Service (`src/services/I003Service.ts`)
```typescript
const I003Service = {
  // Get BNG data for table display  
  GetBNGData: async () => Promise<ApiResponse>
  
  // Clear sessions per BNG IP
  ClearOverLimitSession: async (ip: string) => Promise<ApiResponse>
  
  // Check user session info
  CheckOneUser: async (username: string, ip: string) => Promise<ApiResponse>
  
  // Clear over limit sessions per user
  ClearOverLimitOneUser: async (username: string, ip: string) => Promise<ApiResponse>
  
  // Clear all sessions per user  
  ClearAllOneUser: async (username: string, ip: string) => Promise<ApiResponse>
}
```

### Request Helper (`src/helpers/request.ts`)
- Automatic JWT token attachment
- Base URL configuration
- Error handling
- Request/Response logging

## UI Components

### Custom Components Used
- **CtrlDialog**: Modal dialog for confirmations
- **Custom HTML Table**: Thay vì CtrlDynamicTable để có control tốt hơn
- **Searchable Dropdown**: Custom dropdown với search cho BNG selection
- **Pagination Controls**: Full-featured pagination với page size selection

### Styling Approach
- **Inline Styles**: Primary styling method
- **Responsive Design**: Flexbox layouts
- **Color Coding**: 
  - 🔴 Red: Critical/Over limit values
  - 🔵 Blue: Info/Processed values  
  - 🟢 Green: Success/Normal values
  - ⚫ Gray: Neutral/Disabled values

## Menu Configuration

### Menu Structure (`src/assets/json/menu_config.json`)
```json
{
  "code": "NetworkInoc",
  "name": "AU IP", 
  "subMenu": [
    {
      "code": "ClearThuebaoDaphien",
      "name": "Clear thuê bao đa phiên",
      "url": "/ClearThuebaoDaphien",
      "icon": "bi bi-grid"
    }
  ]
}
```

## State Management

### React Hooks Usage
```javascript
// Tab management
const [activeTab, setActiveTab] = useState('clear-multi');

// Table data & pagination
const [data, setData] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

// Sorting
const [sortField, setSortField] = useState('');
const [sortDirection, setSortDirection] = useState('asc');

// Loading states
const [loading, setLoading] = useState(false);
const [clearing, setClearing] = useState({});

// Clear theo User states
const [username, setUsername] = useState('');
const [selectedBng, setSelectedBng] = useState(null);
const [checkResult, setCheckResult] = useState(null);
```

## Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation & Running
```bash
# Install dependencies
npm install

# Start development server  
npm start

# Build for production
npm run build
```

### Development Server
- Frontend runs on: `http://localhost:3000`
- Auto-reload on file changes
- Proxy API calls to backend server

## Features Overview

### ✅ Implemented Features
- **Dual Tab Interface**: Clear Đa Phiên + Clear theo User
- **Advanced DataTable**: Sorting, pagination, loading states
- **Searchable Dropdown**: BNG selection với real-time search
- **API Integration**: Full CRUD operations với external APIs
- **Responsive Design**: Works on desktop và mobile
- **Error Handling**: User-friendly error messages
- **Real-time Updates**: Loading states và success confirmations

### 🎨 UI/UX Highlights  
- **Clean Interface**: Modern, professional styling
- **Visual Feedback**: Color-coded data, hover effects
- **Intuitive Navigation**: Tab switching, clear CTAs
- **Accessibility**: Keyboard navigation, screen reader friendly
- **Performance**: Efficient rendering với React hooks

## API Endpoints Integration

### Backend Endpoints
- `GET /api/I003_BNG/GetBNGData` - Lấy danh sách BNG
- `POST /api/I003_BNG/ClearOverLimitSession` - Clear sessions per BNG
- `POST /api/I003_BNG/CheckOneUser` - Check user info
- `POST /api/I003_BNG/ClearOverLimitOneUser` - Clear user sessions
- `POST /api/I003_BNG/ClearAllOneUser` - Clear all user sessions

### Authentication
All API calls require JWT token in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes
- **Pagination**: Handles large datasets efficiently
- **Search**: Real-time filtering without API calls
- **Lazy Loading**: Components load on demand
- **Memory Management**: Proper cleanup của event listeners