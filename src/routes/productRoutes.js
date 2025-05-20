const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// Lấy sản phẩm theo slug
router.get('/slug/:slug', productController.getProductBySlug);

// Lấy sản phẩm theo ID
router.get('/:id', productController.getProductById);

// Tạo sản phẩm mới (yêu cầu đăng nhập)
router.post('/', protect, productController.createProduct);

// Cập nhật sản phẩm (yêu cầu đăng nhập)
router.put('/:id', protect, productController.updateProduct);

// Xóa sản phẩm (yêu cầu đăng nhập)
router.delete('/:id', protect, productController.deleteProduct);

module.exports = router;