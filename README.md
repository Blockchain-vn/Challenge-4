# API Quản lý Sản phẩm

API quản lý sản phẩm sử dụng ExpressJS và PostgreSQL với chức năng đăng nhập, đăng ký và xác thực OTP qua email.

## Cài đặt

1. Clone repository
2. Cài đặt các dependencies:
   ```
   npm install
   ```
3. Tạo file `.env` với các thông tin cấu hình:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=product_management
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   ```
4. Khởi động server:
   ```
   npm run dev
   ```

## Cấu trúc cơ sở dữ liệu

### Bảng Products
- id (UUID): Khóa chính
- name (VARCHAR): Tên sản phẩm
- slug (VARCHAR): Slug sản phẩm (duy nhất)
- quantity (INTEGER): Số lượng sản phẩm
- created_at (TIMESTAMP): Thời gian tạo
- updated_at (TIMESTAMP): Thời gian cập nhật

### Bảng Users
- id (UUID): Khóa chính
- username (VARCHAR): Tên đăng nhập (duy nhất)
- email (VARCHAR): Email (duy nhất)
- password (VARCHAR): Mật khẩu (đã mã hóa)
- is_verified (BOOLEAN): Trạng thái xác thực
- created_at (TIMESTAMP): Thời gian tạo
- updated_at (TIMESTAMP): Thời gian cập nhật

### Bảng OTPs
- id (UUID): Khóa chính
- user_id (UUID): Khóa ngoại tham chiếu đến bảng Users
- otp (VARCHAR): Mã OTP
- expires_at (TIMESTAMP): Thời gian hết hạn
- created_at (TIMESTAMP): Thời gian tạo

## API Endpoints

### Quản lý Sản phẩm
- `GET /api/product`: Lấy tất cả sản phẩm
- `GET /api/product/{id}`: Lấy sản phẩm theo ID
- `GET /api/product/slug/{slug}`: Lấy sản phẩm theo slug
- `POST /api/product`: Tạo sản phẩm mới (yêu cầu xác thực)
- `PUT /api/product/{id}`: Cập nhật sản phẩm (yêu cầu xác thực)
- `DELETE /api/product/{id}`: Xóa sản phẩm (yêu cầu xác thực)

### Xác thực
- `POST /api/auth/register`: Đăng ký người dùng mới
- `POST /api/auth/verify-otp`: Xác thực OTP
- `POST /api/auth/resend-otp`: Gửi lại OTP
- `POST /api/auth/login`: Đăng nhập

## Xác thực và Bảo mật

API sử dụng JWT (JSON Web Token) để xác thực người dùng. Khi đăng nhập thành công, server sẽ trả về một token, token này cần được gửi trong header `Authorization` với định dạng `Bearer {token}` cho các request yêu cầu xác thực.

## Xác thực OTP qua Email

Khi đăng ký, hệ thống sẽ gửi một mã OTP đến email của người dùng. Người dùng cần xác thực OTP này để hoàn tất quá trình đăng ký. OTP có hiệu lực trong 10 phút.