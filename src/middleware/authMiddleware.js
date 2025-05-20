const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware xác thực JWT
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Kiểm tra header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Nếu không có token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập, vui lòng đăng nhập'
      });
    }
    
    try {
      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Tìm người dùng
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }
      
      // Kiểm tra xác thực
      if (!user.is_verified) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản chưa được xác thực'
        });
      }
      
      // Lưu thông tin người dùng vào request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xác thực'
    });
  }
};