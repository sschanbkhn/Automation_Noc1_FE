# R008 - Hướng dẫn tích hợp Routing và Menu

## 🔗 Tích hợp Routing

### 1. Cập nhật Routes trong App/Router

Thêm route cho R008 vào file routing chính của ứng dụng:

```tsx
import DashboardPowerSaving from 'components/RNOC1/R008';

// Trong phần routes:
{
  path: '/rnoc/r008/power-saving',
  component: DashboardPowerSaving,
  exact: true,
  auth: true, // Yêu cầu đăng nhập
  permission: 'R008_VIEW' // Tùy chọn: yêu cầu quyền xem
}
```

### 2. Thêm vào Menu System

#### Option A: Thêm vào menu database
```sql
INSERT INTO sys_resource (
    name, 
    code, 
    path, 
    icon, 
    parent_id, 
    order_index, 
    is_active
) VALUES (
    'Tiết kiệm điện',
    'R008_POWER_SAVING',
    '/rnoc/r008/power-saving',
    'zap', -- hoặc icon phù hợp
    (SELECT id FROM sys_resource WHERE code = 'RNOC_MENU'), -- Parent menu RNOC
    8, -- Thứ tự hiển thị
    true
);
```

#### Option B: Thêm vào cấu hình menu Frontend
```tsx
const menuItems = [
  // ... other menu items
  {
    key: 'rnoc-r008',
    label: 'R008 - Tiết kiệm điện',
    icon: <IconBolt />,
    path: '/rnoc/r008/power-saving',
    children: []
  }
];
```

### 3. Cấu hình Permissions (Tùy chọn)

Nếu cần kiểm soát quyền truy cập:

```sql
-- Tạo permission cho R008
INSERT INTO sys_permission (
    code,
    name,
    description,
    resource_id
) VALUES 
    ('R008_VIEW', 'Xem Dashboard R008', 'Quyền xem dashboard tiết kiệm điện', 
     (SELECT id FROM sys_resource WHERE code = 'R008_POWER_SAVING')),
    ('R008_EXPORT', 'Xuất dữ liệu R008', 'Quyền xuất dữ liệu dashboard', 
     (SELECT id FROM sys_resource WHERE code = 'R008_POWER_SAVING'));

-- Gán quyền cho role
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT 
    (SELECT id FROM sys_role WHERE code = 'RNOC_ADMIN'),
    id
FROM sys_permission 
WHERE code IN ('R008_VIEW', 'R008_EXPORT');
```

## 📋 Menu Configuration Examples

### 1. Sidebar Menu Item (React)
```tsx
import { BsLightningChargeFill } from 'react-icons/bs';

const sidebarMenu = [
  {
    title: 'RNOC',
    items: [
      // ... other items
      {
        icon: <BsLightningChargeFill />,
        label: 'Tiết kiệm điện',
        path: '/rnoc/r008/power-saving',
        badge: 'new', // Tùy chọn: hiển thị badge "new"
      }
    ]
  }
];
```

### 2. Top Navigation Menu
```tsx
const topNavMenu = [
  {
    id: 'rnoc',
    label: 'RNOC',
    dropdown: [
      // ... other items
      {
        label: 'R008 - Tiết kiệm điện tự động',
        path: '/rnoc/r008/power-saving',
        icon: '⚡'
      }
    ]
  }
];
```

## 🔐 Authorization trong Component

Dashboard đã tích hợp sẵn kiểm tra quyền từ Cookie:

```tsx
// Trong DashboardPowerSaving.tsx
const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);

useEffect(() => {
  const userInfoStr = Cookie.getCookie("UserInfo");
  if (userInfoStr) {
    const parsedUserInfo: IUserInfo = JSON.parse(userInfoStr);
    setUserInfo(parsedUserInfo);
    
    // Kiểm tra quyền nếu cần
    const hasPermission = parsedUserInfo.Menus?.includes('R008_POWER_SAVING');
    if (!hasPermission) {
      // Redirect hoặc hiển thị thông báo
    }
  }
}, []);
```

## 🧪 Testing Routes

### 1. Test trực tiếp URL
```
http://localhost:3000/rnoc/r008/power-saving
```

### 2. Test với Authentication
```tsx
// Đảm bảo user đã đăng nhập và có token hợp lệ
// Token sẽ được tự động gửi kèm trong mọi request API
```

### 3. Test API Endpoints
```bash
# Test get dashboard by day
curl -X GET "http://localhost:5001/api/Rnoc_R008/dashboard/day?startDate=2024-12-23T00:00:00&endDate=2024-12-23T23:59:59" \
  -H "Authorization: Bearer {token}"

# Test get dashboard by week
curl -X GET "http://localhost:5001/api/Rnoc_R008/dashboard/week?startDate=2024-12-16&endDate=2024-12-23" \
  -H "Authorization: Bearer {token}"

# Test export CSV
curl -X GET "http://localhost:5001/api/Rnoc_R008/export/csv?startDate=2024-12-01&endDate=2024-12-23" \
  -H "Authorization: Bearer {token}" \
  --output r008_export.csv
```

## 🎯 Quick Setup Checklist

- [ ] Thêm route vào routing configuration
- [ ] Thêm menu item vào sidebar/navigation
- [ ] Cấu hình permissions (nếu cần)
- [ ] Test URL trực tiếp
- [ ] Test với user có quyền
- [ ] Test với user không có quyền
- [ ] Test export functionality
- [ ] Test trên mobile responsive

## 🚀 Deployment Notes

### 1. Build Frontend
```bash
cd D:\NOC1\Atomation\Automation_FontEnd
npm run build
```

### 2. Build Backend
```bash
cd D:\NOC1\Atomation\Automation_BE
dotnet build
dotnet publish -c Release
```

### 3. Database Migration (nếu cần)
Đảm bảo bảng `r008_run_scheduler` đã được tạo trong database `rnoc1_db`.

### 4. Verify Connection String
Kiểm tra `appsettings.json`:
```json
{
  "RnocConnectionString": "Server=10.155.43.204;Port=5432;Database=rnoc1_db;Username=postgres;Password=Noc1!@#123;"
}
```

## 📝 Example Full Integration

```tsx
// routes.tsx
import DashboardPowerSaving from 'components/RNOC1/R008';

const routes = [
  // ... other routes
  {
    path: '/rnoc/r008',
    name: 'R008',
    children: [
      {
        path: '/rnoc/r008/power-saving',
        name: 'Power Saving Dashboard',
        component: DashboardPowerSaving,
        exact: true,
        auth: true
      }
    ]
  }
];

// menu.tsx
import { BsLightningChargeFill } from 'react-icons/bs';

const menuConfig = [
  {
    category: 'RNOC',
    items: [
      {
        key: 'r001',
        label: 'R001 - Audit Dashboard',
        path: '/rnoc/r001/audit',
        icon: <BsClipboardCheck />
      },
      // ... other items
      {
        key: 'r008',
        label: 'R008 - Tiết kiệm điện',
        path: '/rnoc/r008/power-saving',
        icon: <BsLightningChargeFill />,
        badge: 'new'
      }
    ]
  }
];

export { routes, menuConfig };
```

## 🔍 Troubleshooting

### Issue: Route không hoạt động
- Kiểm tra route đã được thêm vào routing configuration
- Kiểm tra exact property nếu có conflict với routes khác
- Clear browser cache và rebuild

### Issue: Menu không hiển thị
- Kiểm tra user có permission phù hợp
- Kiểm tra menu configuration
- Kiểm tra userInfo trong Cookie

### Issue: API calls failed
- Kiểm tra CORS settings
- Kiểm tra Authorization token
- Kiểm tra Backend service đã running
- Kiểm tra connection string đúng

## 📞 Support

Nếu gặp vấn đề trong quá trình tích hợp, liên hệ team NOC1 Development.
