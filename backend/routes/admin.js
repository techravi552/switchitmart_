const express = require('express');
const router  = express.Router();
const {
  adminLogin, seedAdmin, getDashboard,
  getUsers, updateUserStatus, deleteUser,
  getProducts, toggleProduct, deleteProduct,
  getOrders, getSubscriptions, assignSubscription,
  sendAdminNotification, getActivityLogs,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/login', adminLogin);
router.post('/seed',  seedAdmin);

router.use(protect, adminOnly);
router.get('/dashboard',             getDashboard);
router.get('/users',                 getUsers);
router.put('/users/:id/status',      updateUserStatus);
router.delete('/users/:id',          deleteUser);
router.get('/products',              getProducts);
router.put('/products/:id/toggle',   toggleProduct);
router.delete('/products/:id',       deleteProduct);
router.get('/orders',                getOrders);
router.get('/subscriptions',         getSubscriptions);
router.post('/subscriptions/assign', assignSubscription);
router.post('/notify',               sendAdminNotification);
router.get('/activity-logs',         getActivityLogs);
module.exports = router;
