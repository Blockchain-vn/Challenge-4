require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Test route
app.post('/api/auth/register', (req, res) => {
    console.log('Received register request:', req.body);

    // Kiểm tra dữ liệu đầu vào
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng cung cấp đầy đủ thông tin email và mật khẩu'
        });
    }

    // Trả về phản hồi thành công giả lập
    res.status(201).json({
        success: true,
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        data: {
            id: '12345-fake-id',
            email: email
        }
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Test API URL: http://localhost:${PORT}/api/auth/register`);
});