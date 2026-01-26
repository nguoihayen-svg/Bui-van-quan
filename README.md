
# 🚀 Hướng dẫn Triển khai & Cấu hình Tên miền Riêng

Ứng dụng SmartShop Manager của bạn đã sẵn sàng để hoạt động chuyên nghiệp.

## 1. Kết nối Tên miền riêng (Custom Domain)

### Nếu dùng Vercel (Khuyến nghị):
1. Truy cập **Project Settings** > **Domains**.
2. Nhập tên miền của bạn (VD: `shop.cuahangcua-ban.com`).
3. Hệ thống sẽ yêu cầu bạn trỏ bản ghi DNS:
   - **Type:** `A` | **Name:** `@` | **Value:** `76.76.21.21`
   - Hoặc **Type:** `CNAME` | **Name:** `www` | **Value:** `cname.vercel-dns.com`

### Nếu dùng Netlify:
1. Vào **Domain Settings** > **Add custom domain**.
2. Làm theo hướng dẫn trỏ bản ghi CNAME về địa chỉ site của Netlify.

## 2. Triển khai trên Hosting truyền thống (Cpanel/VPS)

Nếu bạn muốn chạy trên các hosting mua bằng gói tháng (Shared Hosting):

1. **Build ứng dụng**: 
   Mở terminal tại thư mục dự án và chạy:
   ```bash
   npm install
   npm run build
   ```
2. **Thư mục Dist**: 
   Sau khi chạy xong, thư mục `dist` sẽ xuất hiện. Đây là phiên bản đã được tối ưu hóa.
3. **Upload**:
   - Nén thư mục `dist` thành file `.zip`.
   - Lên Cpanel > **File Manager** > `public_html`.
   - Upload file zip và giải nén **ngay tại thư mục gốc** của hosting.
4. **Cấu hình .htaccess (Quan trọng)**:
   Để các đường dẫn (routing) hoạt động bình thường, hãy tạo file `.htaccess` trong `public_html` với nội dung:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

## 3. Lưu ý về Bảo mật API
- **API_KEY**: Khi chạy trên Hosting truyền thống, API Key thường sẽ bị lộ ở phía frontend (Client-side). 
- **Giải pháp**: Hãy giới hạn API Key của bạn trong [Google Cloud Console](https://console.cloud.google.com/) chỉ cho phép chạy trên tên miền của bạn (Domain Restriction) để tránh bị người khác lấy cắp sử dụng.

## 4. Kiểm tra sau khi triển khai
- Truy cập tên miền để kiểm tra tốc độ tải trang.
- Thử chức năng **In hóa đơn** để đảm bảo PDF hoạt động tốt.
- Kiểm tra mục **Phân tích AI** để xác nhận API Key đã nhận đúng.
