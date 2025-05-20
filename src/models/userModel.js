const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Tạo người dùng mới
  static async create(userData) {
    const { email, password } = userData;

    try {
      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      console.log('Attempting to create user with email:', email);

      const result = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, is_verified, created_at',
        [email, hashedPassword]
      );

      console.log('User created successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in create user:', error.message);
      throw error;
    }
  }

  // Tìm người dùng theo email
  static async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tìm người dùng theo ID
  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái xác thực
  static async verifyUser(userId) {
    try {
      const result = await pool.query(
        'UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING *',
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lưu mã OTP
  static async saveOTP(userId, otp) {
    try {
      // Thời gian hết hạn: 10 phút
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const result = await pool.query(
        'UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3 RETURNING *',
        [otp, expiresAt, userId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Xác thực OTP
  static async verifyOTP(userId, otp) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND otp_code = $2 AND otp_expires > CURRENT_TIMESTAMP',
        [userId, otp]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Xóa OTP sau khi xác thực
      await pool.query('UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = $1', [userId]);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;