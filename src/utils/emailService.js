const nodemailer = require('nodemailer');

// Cấu hình transporter sử dụng Gmail với App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Sử dụng App Password thay vì mật khẩu thông thường
  },
  tls: {
    rejectUnauthorized: false // Cho phép kết nối không an toàn trong môi trường phát triển
  },
  debug: true // Bật chế độ debug để xem thông tin chi tiết
});

// Gửi email xác thực
exports.sendVerificationEmail = async (email, otp) => {
  try {
    // Kiểm tra thông tin email
    console.log('Thông tin email cấu hình:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_APP_PASSWORD
    });

    const mailOptions = {
      from: `"Product Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Xác thực tài khoản',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Xác thực tài khoản</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP sau để xác thực tài khoản của bạn:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>Mã OTP này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">Đây là email tự động, vui lòng không trả lời.</p>
        </div>
      `
    };

    console.log('Đang gửi email đến:', email);
    
    // Gửi email và xử lý kết quả
    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi thành công:', info.messageId);
    console.log('Thông tin phản hồi:', info.response);
    return true;
  } catch (error) {
    console.error('Lỗi chi tiết khi gửi email:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response
    });
    
    // Vẫn trả về true để không làm gián đoạn luồng đăng ký/đăng nhập
    // Người dùng vẫn có thể thấy mã OTP trong console để test
    return true;
  }
};