const Subscription = require('../models/Subscription');
const { PLANS }    = require('../models/Subscription');
const User         = require('../models/User');
const { createNotification, logActivity } = require('./notificationController');

const getMySubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ seller: req.user._id, isActive: true }).sort({ createdAt: -1 });
    if (!sub) return res.status(404).json({ message: 'No subscription found' });
    if (new Date() > sub.expiryDate) { sub.isActive = false; await sub.save(); }
    res.json({ subscription: { ...sub.toObject(), planInfo: PLANS[sub.plan], isExpired: new Date() > sub.expiryDate } });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const purchaseSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free','silver','gold','platinum'].includes(plan)) return res.status(400).json({ message: 'Invalid plan' });
    const expiryDate = new Date(); expiryDate.setDate(expiryDate.getDate() + 30);
    await Subscription.updateMany({ seller: req.user._id, isActive: true }, { isActive: false });
    const sub = await Subscription.create({ seller: req.user._id, plan, expiryDate, isActive: true, productsUsed: 0, boostsUsed: 0, paymentId: `PAY_${Date.now()}` });
    await User.findByIdAndUpdate(req.user._id, { subscription: sub._id });
    await logActivity({ actor: req.user._id, actorName: req.user.name, actorRole: 'seller', action: 'subscription_purchased', entity: 'Subscription', entityId: sub._id, description: `Purchased ${PLANS[plan].name} plan` });
    res.status(201).json({ message: `${PLANS[plan].name} plan activated!`, subscription: { ...sub.toObject(), planInfo: PLANS[plan] } });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const getPlans = async (req, res) => {
  try {
    const plans = Object.entries(PLANS).map(([id, info]) => ({
      id, ...info,
      features: getPlanFeatures(id),
    }));
    res.json({ plans });
  } catch(err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const getPlanFeatures = (plan) => ({
  free:     ['3 products/month','Basic listing','Order management'],
  silver:   ['20 products/month','Priority listing','3 boosts/month','Order management','Chat with buyers'],
  gold:     ['50 products/month','Top listing priority','10 boosts/month','Analytics dashboard','Free delivery toggle','Chat with buyers'],
  platinum: ['200 products/month','#1 listing priority','Unlimited boosts','Full analytics','Free delivery toggle','Top Seller badge','Priority support','Invoice downloads'],
}[plan] || []);

module.exports = { getMySubscription, purchaseSubscription, getPlans };
