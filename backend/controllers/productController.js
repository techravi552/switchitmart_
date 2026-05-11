const Product      = require('../models/Product');
const Subscription = require('../models/Subscription');
const Rating       = require('../models/Rating');
const User         = require('../models/User');
const Order        = require('../models/Order');
const { haversineDistance, getDeliveryCharge, getEstimatedTime, DEFAULT_SLABS } = require('../utils/haversine');
const { PLANS } = require('../models/Subscription');
const { logActivity } = require('./notificationController');

const addProduct = async (req, res) => {
  try {
    const { name, description, mrpPrice, price, category, latitude, longitude,
            address, stock, freeDelivery, useCustomDelivery, deliverySlabs, tags, deliveryRadius } = req.body;
    if (!name||!price||!latitude||!longitude) return res.status(400).json({ message:'Name, price, and location required' });

    const sub = await Subscription.findOne({ seller:req.user._id, isActive:true }).sort({ createdAt:-1 });
    if (!sub) return res.status(403).json({ message:'No active subscription. Purchase a plan.' });
    if (new Date() > sub.expiryDate) { sub.isActive=false; await sub.save(); return res.status(403).json({ message:'Subscription expired.' }); }
    if (sub.productsUsed >= PLANS[sub.plan].productLimit) return res.status(403).json({ message:`Product limit (${PLANS[sub.plan].productLimit}) reached. Upgrade plan.` });

    const sellingPrice = parseFloat(price);
    const originalMRP  = parseFloat(mrpPrice) || sellingPrice;

    let deliveryConfig = { enabled:false, slabs:[] };
    if (useCustomDelivery==='true'||useCustomDelivery===true) {
      let slabs = deliverySlabs;
      if (typeof slabs==='string') { try { slabs=JSON.parse(slabs); } catch { slabs=DEFAULT_SLABS; } }
      deliveryConfig = { enabled:true, slabs:slabs||DEFAULT_SLABS };
    }
    const parsedTags = tags ? (typeof tags==='string' ? tags.split(',').map(t=>t.trim()) : tags) : [];
    const radius = Math.min(50, Math.max(1, parseInt(deliveryRadius)||10));

    const product = await Product.create({
      name, description, mrpPrice:originalMRP, price:sellingPrice,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      category:category||'General', seller:req.user._id,
      location:{ latitude:parseFloat(latitude), longitude:parseFloat(longitude), address:address||'' },
      stock:parseInt(stock)||1,
      freeDelivery:freeDelivery==='true'||freeDelivery===true,
      deliveryConfig, tags:parsedTags, deliveryRadius:radius,
    });
    sub.productsUsed += 1;
    await sub.save();
    await product.populate('seller','name shopName');
    await logActivity({ actor:req.user._id, actorName:req.user.name, actorRole:'seller', action:'product_added', entity:'Product', entityId:product._id, description:`Added: ${name}` });
    res.status(201).json({ message:'Product added', product });
  } catch(err) { console.error(err); res.status(500).json({ message:'Server error', error:err.message }); }
};

const getProducts = async (req, res) => {
  try {
    const { lat, lon, sort='subscription', category, minPrice, maxPrice, search, minRating, maxDistance, tag } = req.query;
    const query = { isActive:true };  // Stock = 0 still visible (just show out-of-stock badge)
    if (category && category!=='all') query.category = category;
    if (minPrice||maxPrice) { query.price={}; if(minPrice) query.price.$gte=parseFloat(minPrice); if(maxPrice) query.price.$lte=parseFloat(maxPrice); }
    if (search) query.$or=[{name:{$regex:search,$options:'i'}},{description:{$regex:search,$options:'i'}},{tags:{$in:[new RegExp(search,'i')]}}];
    if (minRating) query.avgRating={ $gte:parseFloat(minRating) };
    if (tag) query.tags={ $in:[new RegExp(tag,'i')] };

    const products = await Product.find(query).populate({
      path:'seller', select:'name shopName shopPhone isTopSeller subscription',
      populate:{ path:'subscription', model:'Subscription' },
    });

    let result = products.map(p => {
      const obj = p.toObject();
      if (lat && lon) {
        const dist = haversineDistance(parseFloat(lat), parseFloat(lon), p.location.latitude, p.location.longitude);
        const customSlabs = p.deliveryConfig?.enabled ? p.deliveryConfig.slabs : null;
        obj.distance      = dist;
        obj.deliveryCharge = p.freeDelivery ? 0 : getDeliveryCharge(dist, false, customSlabs);
        obj.estimatedTime  = getEstimatedTime(dist, customSlabs);
        obj.withinRadius   = dist <= (p.deliveryRadius || 10);
      }
      const sellerPlan = p.seller?.subscription?.plan || 'free';
      obj.planPriority = { platinum:4, gold:3, silver:2, free:1 }[sellerPlan] || 1;
      obj.isCurrentlyBoosted = p.isBoosted && p.boostExpiry && new Date() < p.boostExpiry;
      return obj;
    });

    // Filter by delivery radius when location provided
    if (lat && lon) {
      result = result.filter(p => p.withinRadius !== false);
    }
    if (maxDistance && lat && lon) result = result.filter(p => (p.distance||0) <= parseFloat(maxDistance));

    if (sort==='nearest'&&lat&&lon) result.sort((a,b)=>(a.distance||999)-(b.distance||999));
    else if (sort==='price_low')    result.sort((a,b)=>a.price-b.price);
    else if (sort==='price_high')   result.sort((a,b)=>b.price-a.price);
    else if (sort==='rating')       result.sort((a,b)=>b.avgRating-a.avgRating);
    else if (sort==='discount')     result.sort((a,b)=>(b.discountPercent||0)-(a.discountPercent||0));
    else if (sort==='popular')      result.sort((a,b)=>b.totalSold-a.totalSold);
    else result.sort((a,b)=>{
      if (a.isCurrentlyBoosted&&!b.isCurrentlyBoosted) return -1;
      if (!a.isCurrentlyBoosted&&b.isCurrentlyBoosted) return 1;
      if (b.planPriority!==a.planPriority) return b.planPriority-a.planPriority;
      return new Date(b.createdAt)-new Date(a.createdAt);
    });

    res.json({ products:result, total:result.length });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc:{ views:1 } }, { new:true })
      .populate({ path:'seller', select:'name shopName shopDescription shopPhone shopAddress isTopSeller subscription', populate:{ path:'subscription', model:'Subscription' } });
    if (!product) return res.status(404).json({ message:'Product not found' });
    const ratings = await Rating.find({ product:product._id }).populate('buyer','name').sort({ createdAt:-1 }).limit(20);
    res.json({ product, ratings });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller:req.user._id }).sort({ createdAt:-1 });
    res.json({ products, total:products.length });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const sub = await Subscription.findOne({ seller:sellerId, isActive:true }).sort({ createdAt:-1 });
    if (sub && !['gold','platinum'].includes(sub.plan)) return res.status(403).json({ message:'Analytics requires Gold or Platinum plan' });

    const [products, orders, revData, topProducts, monthlyRevenue] = await Promise.all([
      Product.find({ seller:sellerId }),
      Order.find({ seller:sellerId }),
      Order.aggregate([{ $match:{ seller:sellerId, status:'delivered' } }, { $group:{ _id:null, total:{ $sum:'$totalPrice' }, count:{ $sum:1 } } }]),
      Order.aggregate([
        { $match:{ seller:sellerId, status:'delivered' } },
        { $group:{ _id:'$product', revenue:{ $sum:'$totalPrice' }, orders:{ $sum:1 } } },
        { $sort:{ revenue:-1 } }, { $limit:5 },
        { $lookup:{ from:'products', localField:'_id', foreignField:'_id', as:'product' } },
        { $unwind:'$product' },
        { $project:{ revenue:1, orders:1, 'product.name':1, 'product.image':1, 'product.price':1 } },
      ]),
      Order.aggregate([
        { $match:{ seller:sellerId, createdAt:{ $gte:new Date(Date.now()-180*24*60*60*1000) } } },
        { $group:{ _id:{ $dateToString:{ format:'%Y-%m', date:'$createdAt' } }, revenue:{ $sum:'$totalPrice' }, orders:{ $sum:1 } } },
        { $sort:{ _id:1 } },
      ]),
    ]);
    const statusCounts = orders.reduce((a,o)=>{ a[o.status]=(a[o.status]||0)+1; return a; }, {});
    res.json({
      overview:{ totalProducts:products.length, activeProducts:products.filter(p=>p.isActive).length, totalOrders:orders.length, totalRevenue:revData[0]?.total||0, deliveredOrders:revData[0]?.count||0, totalViews:products.reduce((s,p)=>s+(p.views||0),0), totalSold:products.reduce((s,p)=>s+(p.totalSold||0),0) },
      statusCounts, topProducts, monthlyRevenue,
    });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

// Buyer analytics
const getBuyerAnalytics = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const [orders, spending, monthlySpending] = await Promise.all([
      Order.find({ buyer:buyerId }),
      Order.aggregate([{ $match:{ buyer:buyerId, status:'delivered' } }, { $group:{ _id:null, total:{ $sum:'$totalPrice' }, count:{ $sum:1 }, savings:{ $sum:'$savings' } } }]),
      Order.aggregate([
        { $match:{ buyer:buyerId, createdAt:{ $gte:new Date(Date.now()-180*24*60*60*1000) } } },
        { $group:{ _id:{ $dateToString:{ format:'%Y-%m', date:'$createdAt' } }, spent:{ $sum:'$totalPrice' }, orders:{ $sum:1 } } },
        { $sort:{ _id:1 } },
      ]),
    ]);
    const statusCounts = orders.reduce((a,o)=>{ a[o.status]=(a[o.status]||0)+1; return a; }, {});
    res.json({
      overview:{ totalOrders:orders.length, totalSpent:spending[0]?.total||0, deliveredOrders:spending[0]?.count||0, totalSavings:spending[0]?.savings||0 },
      statusCounts, monthlySpending,
    });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message:'Product not found' });
    if (product.seller.toString()!==req.user._id.toString()) return res.status(403).json({ message:'Not authorized' });
    const { name,description,mrpPrice,price,category,latitude,longitude,address,stock,freeDelivery,isActive,useCustomDelivery,deliverySlabs,tags,deliveryRadius } = req.body;
    if (name)             product.name = name;
    if (description!==undefined) product.description = description;
    if (price)            product.price = parseFloat(price);
    if (mrpPrice)         product.mrpPrice = parseFloat(mrpPrice);
    if (category)         product.category = category;
    if (latitude&&longitude) product.location = { latitude:parseFloat(latitude), longitude:parseFloat(longitude), address:address||product.location.address };
    if (stock!==undefined)        product.stock = parseInt(stock);
    if (freeDelivery!==undefined) product.freeDelivery = freeDelivery==='true'||freeDelivery===true;
    if (isActive!==undefined)     product.isActive = isActive;
    if (deliveryRadius)           product.deliveryRadius = Math.min(50,Math.max(1,parseInt(deliveryRadius)||10));
    if (req.file) product.image = `/uploads/${req.file.filename}`;
    if (tags) product.tags = typeof tags==='string'?tags.split(',').map(t=>t.trim()):tags;
    if (useCustomDelivery!==undefined) {
      let slabs = deliverySlabs;
      if (typeof slabs==='string') { try { slabs=JSON.parse(slabs); } catch { slabs=DEFAULT_SLABS; } }
      product.deliveryConfig = { enabled:useCustomDelivery==='true'||useCustomDelivery===true, slabs:slabs||DEFAULT_SLABS };
    }
    await product.save();
    res.json({ message:'Product updated', product });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message:'Product not found' });
    if (product.seller.toString()!==req.user._id.toString()) return res.status(403).json({ message:'Not authorized' });
    await product.deleteOne();
    res.json({ message:'Product deleted' });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

const boostProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message:'Product not found' });
    if (product.seller.toString()!==req.user._id.toString()) return res.status(403).json({ message:'Not authorized' });
    const sub = await Subscription.findOne({ seller:req.user._id, isActive:true }).sort({ createdAt:-1 });
    if (!sub||sub.plan==='free') return res.status(403).json({ message:'Boost requires Silver or higher plan' });
    if (!sub.canBoost()) return res.status(403).json({ message:'Boost limit reached' });
    const boostExpiry = new Date(); boostExpiry.setHours(boostExpiry.getHours()+24);
    product.isBoosted=true; product.boostExpiry=boostExpiry;
    sub.boostsUsed+=1;
    await Promise.all([product.save(),sub.save()]);
    res.json({ message:'Product boosted 24h!', product });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

// POST /api/products/:id/rate — only after delivery
const rateProduct = async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating||rating<1||rating>5) return res.status(400).json({ message:'Rating 1–5 required' });

    // Check buyer has a delivered order for this product
    const hasDelivered = await Order.findOne({ buyer:req.user._id, product:req.params.id, status:'delivered' });
    if (!hasDelivered) return res.status(403).json({ message:'You can only rate after a delivered order (verified purchase)' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message:'Product not found' });
    const existing = await Rating.findOne({ product:product._id, buyer:req.user._id });
    if (existing) { existing.rating=rating; existing.review=review; await existing.save(); }
    else           { await Rating.create({ product:product._id, buyer:req.user._id, rating, review }); }
    const all = await Rating.find({ product:product._id });
    product.avgRating    = Math.round(all.reduce((s,r)=>s+r.rating,0)/all.length*10)/10;
    product.totalRatings = all.length;
    await product.save();
    res.json({ message:'Rating submitted ✓', avgRating:product.avgRating, totalRatings:product.totalRatings });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid  = req.params.id;
    const idx  = user.wishlist.findIndex(id => id.toString() === pid);
    if (idx===-1) user.wishlist.push(pid); else user.wishlist.splice(idx,1);
    await user.save();
    res.json({ message:idx===-1?'Added to wishlist':'Removed from wishlist', inWishlist:idx===-1 });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({ path:'wishlist', populate:{ path:'seller', select:'name shopName' } });
    res.json({ products:user.wishlist });
  } catch(err) { res.status(500).json({ message:'Server error', error:err.message }); }
};

module.exports = { addProduct, getProducts, getProduct, getSellerProducts, getSellerAnalytics, getBuyerAnalytics, updateProduct, deleteProduct, boostProduct, rateProduct, toggleWishlist, getWishlist };
