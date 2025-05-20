const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // Số lượng kết nối tối đa
  idleTimeoutMillis: 30000, // Thời gian chờ trước khi đóng kết nối không hoạt động
  connectionTimeoutMillis: 2000, // Thời gian chờ kết nối
});

// Test kết nối
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Lỗi kết nối cơ sở dữ liệu:', err);

    // Kiểm tra các lỗi phổ biến
    if (err.code === '3D000') {
      console.error('Cơ sở dữ liệu không tồn tại. Vui lòng tạo cơ sở dữ liệu "product_management"');
      console.error('Bạn có thể tạo cơ sở dữ liệu bằng lệnh: CREATE DATABASE product_management;');
    } else if (err.code === '28P01') {
      console.error('Lỗi xác thực. Vui lòng kiểm tra tên người dùng và mật khẩu trong file .env');
      console.error('Thông tin hiện tại:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
      });
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Không thể kết nối đến PostgreSQL. Vui lòng đảm bảo dịch vụ PostgreSQL đang chạy');
      console.error('Kiểm tra xem PostgreSQL có đang chạy không bằng lệnh: pg_isready');
    }
  } else {
    console.log('Kết nối cơ sở dữ liệu thành công. Thời gian hiện tại:', res.rows[0].now);
  }
});

const setupDatabase = async () => {
  try {
    // Tạo extension pgcrypto nếu chưa có
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Tạo bảng product
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        quantity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tạo bảng users theo cấu trúc hiện tại
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        otp_code VARCHAR(6),
        otp_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Cơ sở dữ liệu đã được khởi tạo thành công');
  } catch (error) {
    if (error.code === '3D000') {
      console.error(`Cơ sở dữ liệu "${process.env.DB_NAME}" không tồn tại.`);
      console.error('Vui lòng tạo cơ sở dữ liệu trước khi chạy ứng dụng.');
      console.error(`Bạn có thể tạo cơ sở dữ liệu bằng lệnh SQL: CREATE DATABASE ${process.env.DB_NAME};`);
      process.exit(1); // Thoát ứng dụng với mã lỗi
    } else {
      console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', error);
    }
  }
};

module.exports = {
  pool,
  setupDatabase,
};