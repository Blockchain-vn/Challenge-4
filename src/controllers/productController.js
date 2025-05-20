const Product = require('../models/productModel');

// Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm'
    });
  }
};

// Lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo ID:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy sản phẩm'
    });
  }
};

// Lấy sản phẩm theo slug
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.getBySlug(slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo slug:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy sản phẩm'
    });
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { name, slug, quantity } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Tên và slug sản phẩm là bắt buộc'
      });
    }
    
    const newProduct = await Product.create({
      name,
      slug,
      quantity: quantity || 0
    });
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Tạo sản phẩm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    
    // Xử lý lỗi trùng slug
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Slug đã tồn tại, vui lòng chọn slug khác'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo sản phẩm'
    });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, quantity } = req.body;
    
    // Kiểm tra sản phẩm tồn tại
    const existingProduct = await Product.getById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Cập nhật sản phẩm
    const updatedProduct = await Product.update(id, {
      name: name || existingProduct.name,
      slug: slug || existingProduct.slug,
      quantity: quantity !== undefined ? quantity : existingProduct.quantity
    });
    
    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    
    // Xử lý lỗi trùng slug
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Slug đã tồn tại, vui lòng chọn slug khác'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật sản phẩm'
    });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra sản phẩm tồn tại
    const existingProduct = await Product.getById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Xóa sản phẩm
    await Product.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa sản phẩm'
    });
  }
};