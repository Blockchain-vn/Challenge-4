const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.post('/api/auth/register', (req, res) => {
    console.log('Received register request:', req.body);
    res.json({
        success: true,
        message: 'Đăng ký thành công (giả lập)',
        data: {
            id: '12345-fake-id',
            email: req.body.email || 'test@example.com'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});