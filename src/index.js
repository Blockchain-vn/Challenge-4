require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const { setupDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
// Cấu hình CORS để cho phép truy cập từ các nguồn khác
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3002', 'http://127.0.0.1:49240'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware để log request body
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    console.log(`Response for ${req.method} ${req.url}:`, body);
    return originalJson.call(this, body);
  };
  next();
});

// Middleware để parse JSON với xử lý lỗi
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON:', e);
      res.status(400).json({
        success: false,
        message: 'Invalid JSON in request body'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.static('public')); // Phục vụ các file tĩnh từ thư mục public

// Routes
app.use('/api/product', productRoutes);
app.use('/api/auth', authRoutes);

// Khởi tạo database
setupDatabase();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi trên server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});