# I003 - Thuê bao đa phiên Module

## Frontend Component Structure

### Main Component: `/src/components/INOC1/I003/index.jsx`

## Features Overview

### 📊 Dashboard Tab (Default)
- **Real-time PPPoE session monitoring**
- **Date range selector** (từ ngày - đến ngày)
- **4 Summary Cards**:
  - 🔵 Tổng số phiên PPPoE xác thực (Total Sessions)
  - 🔴 Vượt phiên (Over Limit Sessions) 
  - 🟡 Đã xóa (Cleared Sessions)
  - 🟢 Còn lại (Remaining) = Vượt phiên - Đã xóa
- **Interactive Chart** with tooltips and data labels
- **Top 5 Provinces** by over-limit sessions
- **Detailed Data Table** by date

### 🛠️ Clear Đa Phiên Tab
- **BNG Management Table** with sorting & pagination
- **Bulk session clearing** by BNG device
- **Confirmation modal** before clearing
- **Real-time status updates**

### 👤 Clear theo User Tab  
- **User-specific session management**
- **BNG dropdown** with search functionality
- **Session details** (current, authenticated, over-limit)
- **Individual user session clearing**
- **Detailed operation logs**

## Component State Management

```jsx
// Tab Management
const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard

// Dashboard States
const [dashboardData, setDashboardData] = useState(null);
const [dashboardLoading, setDashboardLoading] = useState(false);
const [selectedFromDate, setSelectedFromDate] = useState(today);
const [selectedToDate, setSelectedToDate] = useState(today);

// Clear Multi States  
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [clearing, setClearing] = useState({});

// Clear User States
const [username, setUsername] = useState('');
const [selectedBng, setSelectedBng] = useState(null);
const [checkResult, setCheckResult] = useState(null);
```

## API Service Integration

### Service: `/src/services/I003Service.ts`

```typescript
const I003Service = {
    GetBNGData: async () => Promise<ApiResponse>,
    GetDashboardData: async (fromDate?, toDate?) => Promise<DashboardData>,
    ClearOverLimitSession: async (ip: string) => Promise<ApiResponse>,
    CheckOneUser: async (username: string, ip: string) => Promise<UserData>,
    ClearOverLimitOneUser: async (username: string, ip: string) => Promise<ApiResponse>,
    ClearAllOneUser: async (username: string, ip: string) => Promise<ApiResponse>
}
```

## Dashboard Data Structure

```typescript
interface DashboardData {
    Summary: {
        TongSoPhienBaoXacThuc: number;
        VuotPhien: number;
        DaXoa: number;
        ConLai: number;
    };
    TopProvinces: Array<{
        ProvinceName: string;
        VuotPhien: number;
        DaXoa: number;
        BngCount: number;
    }>;
    ChartData: Array<{
        Date: string;        // Format: "dd/MM"
        VuotPhien: number;
        DaXoa: number;
        XacThuc: number;
    }>;
    FromDate: Date;
    ToDate: Date;
}
```

## Key Features Implementation

### 🔄 Auto-refresh Dashboard
```jsx
useEffect(() => {
    if (activeTab === 'dashboard') {
        fetchDashboardData();
    }
}, [selectedFromDate, selectedToDate, activeTab, fetchDashboardData]);
```

### 📊 Interactive Chart with Tooltips
- Hover effects show detailed numbers
- Stacked bar chart visualization
- Responsive scaling based on data values
- Color-coded data series

### 🎯 Smart BNG Dropdown
- Searchable dropdown with filtering
- Real-time search functionality
- Click outside to close behavior

### ✅ Error Handling & Loading States
- Comprehensive try-catch blocks
- User-friendly error messages
- Loading indicators for all async operations
- Optimistic UI updates

## Styling Approach

### Design System
- **Primary Color**: #1890ff (Ant Design Blue)
- **Success Color**: #10b981 (Green)
- **Warning Color**: #f59e0b (Yellow/Orange)
- **Danger Color**: #ef4444 (Red)
- **Background**: #fafafa (Light Gray)

### Component Styling
- Inline styles for maximum control
- Gradient backgrounds for summary cards
- Consistent spacing and border radius
- Hover effects and transitions

## Performance Optimizations

### React Optimizations
```jsx
// Memoized callback for dashboard data fetching
const fetchDashboardData = useCallback(async () => {
    // Implementation
}, [selectedFromDate, selectedToDate]);

// Debounced search for BNG dropdown
const [bngSearchTerm, setBngSearchTerm] = useState('');
```

### Pagination & Sorting
- Client-side pagination for better UX
- Multi-column sorting capability
- Configurable page sizes (10, 20, 50, 100)

## Integration Points

### Backend API Endpoints
- `GET /I003_BNG/GetDashboardData`
- `GET /I003_BNG/GetBNGData`
- `POST /I003_BNG/ClearOverLimitSession`
- `POST /I003_BNG/CheckOneUser`
- `POST /I003_BNG/ClearOverLimitOneUser`
- `POST /I003_BNG/ClearAllOneUser`

### External API Integration
- Real-time session clearing via external Python API
- API key authentication
- Structured error handling for external API failures

## Development Guidelines

### Code Organization
- Single-file component approach
- Logical state grouping
- Consistent naming conventions
- Comprehensive error boundaries

### Testing Considerations
- Mock API responses for development
- Error scenario testing
- UI interaction testing
- Cross-browser compatibility

---
**Component Author**: Frontend Team  
**Last Updated**: October 2025  
**Framework**: React 18 + Hooks