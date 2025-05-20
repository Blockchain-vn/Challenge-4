console.log('Kiểm tra thông tin kết nối PostgreSQL:');
console.log('DB_HOST:', process.env.DB_HOST || 'không có');
console.log('DB_PORT:', process.env.DB_PORT || 'không có');
console.log('DB_USER:', process.env.DB_USER || 'không có');
console.log('DB_NAME:', process.env.DB_NAME || 'không có');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'đã cấu hình' : 'không có');