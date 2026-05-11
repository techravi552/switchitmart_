const User         = require('../models/User');
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const Subscription = require('../models/Subscription');
const { PLANS }    = require('../models/Subscription');

const getSellerDashboard = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ seller:req.user._id, isActive:true }).sort({ createdAt:-1 });
    if (sub && new Date() > sub.expiryDate) { sub.isActive=false; await sub.save(); }
    const [totalProducts, totalOrders, pendingOrders, deliveredOrders, revenueData] = await Promise.all([
      Product.countDocuments({ seller:req.user._id, isActive:true }),
      Order.countDocuments({ seller:req.user._id }),
      Order.countDocuments({ seller:req.user._id, status:'pending' }),
      Order.countDocuments({ seller:req.user._id, status:'delivered' }),
      Order.aggregate([{ $match:{ seller:req.user._id, status:'delivered' } }, { $group:{ _id:null, total:{ $sum:'$totalPrice' } } }]),
    ]);
    const seller = await User.findById(req.user._id).select('-password');
    res.json({
      seller: { name:seller.name, shopName:seller.shopName, shopPhone:seller.shopPhone, email:seller.email, isTopSeller:seller.isTopSeller },
      subscription: sub ? { plan:sub.plan, planName:PLANS[sub.plan]?.name, expiryDate:sub.expiryDate, productsUsed:sub.productsUsed, boostsUsed:sub.boostsUsed, productLimit:PLANS[sub.plan]?.productLimit, boostLimit:PLANS[sub.plan]?.boostLimit, isActive:sub.isActive, isExpired:new Date()>sub.expiryDate, planInfo:PLANS[sub.plan] } : null,
      stats: { totalProducts, totalOrders, pendingOrders, deliveredOrders, totalRevenue:revenueData[0]?.total||0 },
    });
  } catch(err) { console.error(err); res.status(500).json({ message:'Server error', error:err.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, shopName, shopDescription, shopPhone, shopAddress, latitude, longitude, address, darkMode } = req.body;
    const seller = await User.findById(req.user._id);
    if (name)             seller.name = name;
    if (phone)            seller.phone = phone;
    if (shopName)         seller.shopName = shopName;
    if (shopDescription!==undefined) seller.shopDescription = shopDescription;
    if (shopPhone!==undefined)       seller.shopPhone = shopPhone;
    if (shopAddress!==undefined)     seller.shopAddress = shopAddress;
    if (darkMode!==undefined)        seller.darkMode = darkMode==='true'||darkMode===true;
    if (latitude && longitude) seller.location = { latitude:parseFloat(latitude), longitude:parseFloat(longitude), address:address||seller.location?.address||'' };
    await seller.save();
    res.json({ message:'Profile updated', seller });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

module.exports = { getSellerDashboard, updateProfile };
