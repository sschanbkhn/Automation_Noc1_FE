# Thư mục tài liệu PDF

## Hướng dẫn sử dụng

Thư mục này chứa các file tài liệu PDF cho các module RNOC.

### File cần đặt vào đây:

- **VT-RNOC1_R001.pdf** - Tài liệu module R001 (Audit cấu hình vô tuyến)

### Cách sử dụng:

1. Đặt file PDF `VT-RNOC1_R001.pdf` vào thư mục này
2. File sẽ được truy cập qua đường dẫn: `/assets/docx/VT-RNOC1_R001.pdf`
3. Người dùng có thể click vào nút "Tài liệu" (biểu tượng document) trên dashboard R001 để download

### Lưu ý:

- Đảm bảo file PDF có tên chính xác: `VT-RNOC1_R001.pdf`
- File cần được copy vào thư mục `public/assets/docx/` khi build production
- Nếu thay đổi tên file, cần cập nhật lại đường dẫn trong component `DashboardAudit.tsx`

## Cấu trúc thư mục sau khi đặt file:

```
src/assets/docx/
├── README.md (file này)
└── VT-RNOC1_R001.pdf (file cần đặt)
```

Khi build production, file sẽ được copy vào:
```
public/assets/docx/
└── VT-RNOC1_R001.pdf
```
