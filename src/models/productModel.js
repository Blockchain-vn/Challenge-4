const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Product {
  // Lấy tất cả sản phẩm
  static async getAll() {
    try {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm theo ID
  static async getById(id) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy sản phẩm theo slug
  static async getBySlug(slug) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo sản phẩm mới
  static async create(productData) {
    const { name, slug, quantity } = productData;
    try {
      const result = await pool.query(
        'INSERT INTO products (name, slug, quantity) VALUES ($1, $2, $3) RETURNING *',
        [name, slug, quantity]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật sản phẩm
  static async update(id, productData) {
    const { name, slug, quantity } = productData;
    try {
      const result = await pool.query(
        'UPDATE products SET name = $1, slug = $2, quantity = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [name, slug, quantity, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Xóa sản phẩm
  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;