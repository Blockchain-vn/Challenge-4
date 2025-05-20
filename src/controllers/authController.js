const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { sendVerificationEmail } = require('../utils/emailService');

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Tạo mã OTP ngẫu nhiên
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Đăng ký người dùng
exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);

    // Kiểm tra xem req.body có tồn tại không
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }

    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin email và mật khẩu'
      });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không đúng định dạng'
      });
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      console.log('Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    console.log('Creating new user with email:', email);
    // Tạo người dùng mới
    const newUser = await User.create({
      email,
      password
    });

    // Tạo mã OTP
    const otp = generateOTP();
    await User.saveOTP(newUser.id, otp);

    // Gửi email OTP
    try {
      await sendVerificationEmail(email, otp);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Vẫn tiếp tục xử lý ngay cả khi không gửi được email
    }

    console.log('OTP for testing:', otp);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      data: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);

    // Kiểm tra loại lỗi để trả về thông báo phù hợp
    if (error.code === '23505') {
      // Lỗi vi phạm ràng buộc duy nhất (unique constraint)
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    } else if (error.code === '3D000') {
      // Lỗi cơ sở dữ liệu không tồn tại
      return res.status(500).json({
        success: false,
        message: 'Lỗi kết nối cơ sở dữ liệu: Database không tồn tại'
      });
    } else if (error.code === '28P01') {
      // Lỗi xác thực PostgreSQL
      return res.status(500).json({
        success: false,
        message: 'Lỗi xác thực cơ sở dữ liệu: Sai username/password'
      });
    } else if (error.code === 'ECONNREFUSED') {
      // Lỗi kết nối bị từ chối
      return res.status(500).json({
        success: false,
        message: 'Không thể kết nối đến cơ sở dữ liệu: Dịch vụ PostgreSQL có thể chưa chạy'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng ký',
      error: error.message
    });
  }
};

// Xác thực OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    // Kiểm tra OTP
    const validOTP = await User.verifyOTP(userId, otp);
    if (!validOTP) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn'
      });
    }

    // Cập nhật trạng thái xác thực người dùng
    await User.verifyUser(userId);

    // Tạo token
    const token = generateToken(userId);

    res.status(200).json({
      success: true,
      message: 'Xác thực thành công',
      token
    });
  } catch (error) {
    console.error('Lỗi khi xác thực OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xác thực OTP'
    });
  }
};

// Gửi lại mã OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email'
      });
    }

    // Tìm người dùng theo email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng với email này'
      });
    }

    // Nếu người dùng đã xác thực
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản đã được xác thực'
      });
    }

    // Tạo mã OTP mới
    const otp = generateOTP();
    await User.saveOTP(user.id, otp);

    // Gửi email OTP
    await sendVerificationEmail(email, otp);
    console.log('OTP for testing:', otp);

    res.status(200).json({
      success: true,
      message: 'Đã gửi lại mã OTP. Vui lòng kiểm tra email.',
      userId: user.id
    });
  } catch (error) {
    console.error('Lỗi khi gửi lại OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi gửi lại OTP'
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mật khẩu'
      });
    }

    // Tìm người dùng
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra xác thực
    if (!user.is_verified) {
      try {
        // Tạo mã OTP mới
        const otp = generateOTP();
        await User.saveOTP(user.id, otp);

        // Gửi email OTP
        try {
          await sendVerificationEmail(user.email, otp);
        } catch (emailError) {
          console.error('Lỗi khi gửi email:', emailError);
          // Vẫn tiếp tục xử lý ngay cả khi không gửi được email
        }

        console.log('OTP for testing:', otp);

        return res.status(403).json({
          success: false,
          message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.',
          userId: user.id
        });
      } catch (otpError) {
        console.error('Lỗi khi tạo OTP:', otpError);
        return res.status(500).json({
          success: false,
          message: 'Đã xảy ra lỗi khi xử lý xác thực tài khoản'
        });
      }
    }

    // Tạo token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);

    // Kiểm tra loại lỗi để trả về thông báo phù hợp
    if (error.code === '23505') {
      // Lỗi vi phạm ràng buộc duy nhất (unique constraint)
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    } else if (error.code === '3D000') {
      // Lỗi cơ sở dữ liệu không tồn tại
      return res.status(500).json({
        success: false,
        message: 'Lỗi kết nối cơ sở dữ liệu'
      });
    } else if (error.code === '28P01') {
      // Lỗi xác thực PostgreSQL
      return res.status(500).json({
        success: false,
        message: 'Lỗi xác thực cơ sở dữ liệu'
      });
    } else if (error.code === 'ECONNREFUSED') {
      // Lỗi kết nối bị từ chối
      return res.status(500).json({
        success: false,
        message: 'Không thể kết nối đến cơ sở dữ liệu'
      });
    }

    // Lỗi chung
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};