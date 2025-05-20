const { pool } = require('../config/database');

class OTP {
  // Tạo mã OTP mới
  static async create(userId, otp) {
    try {
      // Thời gian hết hạn: 10 phút
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      // Xóa OTP cũ nếu có
      await pool.query('DELETE FROM otps WHERE user_id = $1', [userId]);
      
      // Tạo OTP mới
      const result = await pool.query(
        'INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3) RETURNING *',
        [userId, otp, expiresAt]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Xác thực OTP
  static async verify(userId, otp) {
    try {
      const result = await pool.query(
        'SELECT * FROM otps WHERE user_id = $1 AND otp = $2 AND expires_at > CURRENT_TIMESTAMP',
        [userId, otp]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Xóa OTP sau khi xác thực
      await pool.query('DELETE FROM otps WHERE user_id = $1', [userId]);
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OTP;