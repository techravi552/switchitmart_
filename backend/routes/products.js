const express = require('express');
const router  = express.Router();
const { addProduct, getProducts, getProduct, getSellerProducts, getSellerAnalytics, getBuyerAnalytics, updateProduct, deleteProduct, boostProduct, rateProduct, toggleWishlist, getWishlist } = require('../controllers/productController');
const { protect, sellerOnly, buyerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/',                   getProducts);
router.get('/seller/my',          protect, sellerOnly, getSellerProducts);
router.get('/seller/analytics',   protect, sellerOnly, getSellerAnalytics);
router.get('/buyer/analytics',    protect, buyerOnly,  getBuyerAnalytics);
router.get('/wishlist',           protect, buyerOnly,  getWishlist);
router.get('/:id',                getProduct);
router.post('/',                  protect, sellerOnly, upload.single('image'), addProduct);
router.put('/:id',                protect, sellerOnly, upload.single('image'), updateProduct);
router.delete('/:id',             protect, sellerOnly, deleteProduct);
router.post('/:id/boost',         protect, sellerOnly, boostProduct);
router.post('/:id/rate',          protect, buyerOnly,  rateProduct);
router.post('/:id/wishlist',      protect, buyerOnly,  toggleWishlist);
module.exports = router;
