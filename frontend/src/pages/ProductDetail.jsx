import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Truck, Zap, ShoppingBag, ArrowLeft, Store, Loader, MessageCircle, Phone, Clock, Heart, Navigation, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/Spinner';
import OrderModal from '../components/OrderModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="bg-red-100 text-red-600 font-bold text-sm px-3 py-1 rounded-full flex items-center gap-1 w-fit"><AlertTriangle size={14}/>Out of Stock</span>;
  if (stock <= 9)  return <span className="bg-amber-100 text-amber-700 font-bold text-sm px-3 py-1 rounded-full flex items-center gap-1 w-fit"><AlertTriangle size={14}/>Low Stock — only {stock} left!</span>;
  return <span className="bg-green-100 text-green-700 font-bold text-sm px-3 py-1 rounded-full w-fit">✓ In Stock ({stock} available)</span>;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct]   = useState(null);
  const [ratings, setRatings]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [review, setReview]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [buyerLocation, setBuyerLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [canDeliver, setCanDeliver] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data.product); setRatings(r.data.ratings); })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
    // Auto-detect GPS for delivery check
    navigator.geolocation?.getCurrentPosition(p => {
      const loc = { latitude: p.coords.latitude, longitude: p.coords.longitude };
      setBuyerLocation(loc);
    });
  }, [id]);

  // Check delivery feasibility when location + product available
  useEffect(() => {
    if (!buyerLocation || !product) return;
    api.post('/orders/estimate', { productId: product._id, latitude: buyerLocation.latitude, longitude: buyerLocation.longitude })
      .then(r => { setDistanceInfo(r.data); setCanDeliver(r.data.withinRadius); })
      .catch(() => {});
  }, [buyerLocation, product]);

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      p => { setBuyerLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }); toast.success('Location set'); setGpsLoading(false); },
      () => { toast.error('GPS failed'); setGpsLoading(false); }
    );
  };

  const submitRating = async () => {
    if (!userRating) return toast.error('Select a rating');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/rate`, { rating: userRating, review });
      toast.success('Rating submitted!');
      const r = await api.get(`/products/${id}`);
      setProduct(r.data.product); setRatings(r.data.ratings);
      setUserRating(0); setReview('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const startChat = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'buyer') return toast.error('Only buyers can chat');
    setStartingChat(true);
    try {
      const r = await api.post('/chat/start', { sellerId: product.seller._id, productId: product._id });
      navigate(`/chat/${r.data.chat._id}`);
    } catch { toast.error('Failed to start chat'); }
    setStartingChat(false);
  };

  const toggleWishlist = async () => {
    if (!user || user.role !== 'buyer') return;
    try {
      const r = await api.post(`/products/${id}/wishlist`);
      setWishlisted(r.data.inWishlist);
      toast.success(r.data.message);
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageLoader />;
  if (!product) return <div className="p-8 text-center text-gray-500">Product not found</div>;

  const imgUrl  = product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`) : null;
  const sellerPlan = product.seller?.subscription?.plan || 'free';
  const planBadges = { platinum: '💎 Platinum', gold: '🥇 Gold', silver: '🥈 Silver', free: '' };
  const planCls    = { platinum: 'badge-platinum', gold: 'badge-gold', silver: 'badge-silver', free: '' };
  const hasDiscount = product.mrpPrice && product.mrpPrice > product.price;
  const discountPct = hasDiscount ? Math.round(((product.mrpPrice - product.price) / product.mrpPrice) * 100) : 0;
  const slabs = product.deliveryConfig?.enabled ? product.deliveryConfig.slabs : [
    { minKm:0, maxKm:1, charge:10, timeLabel:'20-30 mins' },
    { minKm:1, maxKm:2, charge:18, timeLabel:'30-40 mins' },
    { minKm:2, maxKm:3, charge:25, timeLabel:'40-50 mins' },
    { minKm:3, maxKm:4, charge:30, timeLabel:'50-60 mins' },
    { minKm:4, maxKm:9999, charge:50, timeLabel:'60-90 mins' },
  ];

  const stars = (n, size=14) => Array.from({length:5},(_,i)=>(
    <Star key={i} size={size} className={i<n?'text-amber-400 fill-amber-400':'text-gray-200 fill-gray-200'}/>
  ));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={()=>navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium mb-6">
        <ArrowLeft size={16}/>Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden h-80 md:h-auto min-h-72">
          {imgUrl ? <img src={imgUrl} alt={product.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={80} className="text-brand-300"/></div>}
          {product.isBoosted && new Date() < new Date(product.boostExpiry) && <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Zap size={11}/>Boosted</div>}
          {product.freeDelivery && <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Truck size={11}/>Free Delivery</div>}
          {hasDiscount && <div className="absolute bottom-3 left-3 bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">{discountPct}% OFF</div>}
          {product.stock === 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-full">Out of Stock</span></div>}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {planBadges[sellerPlan] && <span className={planCls[sellerPlan]}>{planBadges[sellerPlan]}</span>}
            {product.seller?.isTopSeller && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">🏆 Top Seller</span>}
          </div>

          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-1">{product.name}</h1>
          <p className="text-gray-400 text-sm mb-3">{product.category}</p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{stars(Math.round(product.avgRating))}</div>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{product.avgRating || 0}</span>
            <span className="text-sm text-gray-400">({product.totalRatings} reviews)</span>
            {product.views > 0 && <span className="text-xs text-gray-400">· {product.views} views</span>}
          </div>

          {product.description && <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{product.description}</p>}

          {/* Price block */}
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl mb-4">
            <div className="flex items-end gap-3">
              <p className="font-display font-bold text-3xl text-brand-600">{formatCurrency(product.price)}</p>
              {hasDiscount && <p className="line-through text-gray-400 text-lg mb-0.5">{formatCurrency(product.mrpPrice)}</p>}
            </div>
            {hasDiscount && <p className="text-green-600 text-sm font-medium mt-1">You save {formatCurrency(product.mrpPrice - product.price)} ({discountPct}% off)</p>}
          </div>

          {/* Stock */}
          <div className="mb-4"><StockBadge stock={product.stock}/></div>

          {/* Seller info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center"><Store size={18} className="text-white"/></div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{product.seller?.shopName || product.seller?.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={11}/>{product.location.address || 'Location available'}</p>
              </div>
            </div>
            {product.seller?.shopPhone && (
              <a href={`tel:${product.seller.shopPhone}`} className="flex items-center gap-2 text-sm text-green-600 font-medium hover:underline">
                <Phone size={14}/>{product.seller.shopPhone}
              </a>
            )}
            <p className="text-xs text-gray-500 flex items-center gap-1"><Navigation size={11}/>Delivery radius: {product.deliveryRadius || 10} km</p>
          </div>

          {/* Delivery radius check */}
          {buyerLocation && distanceInfo && (
            <div className={`p-3 rounded-xl mb-4 text-sm font-medium flex items-center gap-2 ${canDeliver ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
              {canDeliver
                ? <><MapPin size={14}/>✓ Delivers to your location — {distanceInfo.distance} km away · {distanceInfo.estimatedTime}</>
                : <><AlertTriangle size={14}/>✗ Outside delivery area — you are {distanceInfo.distance} km away (limit: {product.deliveryRadius || 10} km)</>}
            </div>
          )}
          {!buyerLocation && (
            <button onClick={getGPS} disabled={gpsLoading} className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 text-sm text-brand-600 border border-brand-200 hover:bg-brand-50 rounded-xl transition-colors">
              {gpsLoading ? <Loader size={14} className="animate-spin"/> : <Navigation size={14}/>}Check delivery to your location
            </button>
          )}

          {/* Delivery slabs */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1"><Truck size={11}/>Delivery Charges & Time</p>
            <div className="grid grid-cols-1 gap-1">
              {slabs.filter(s => s.maxKm <= 6 || s.maxKm >= 9999).map((s, i) => (
                <div key={i} className="flex justify-between text-xs text-blue-600 dark:text-blue-300">
                  <span>{s.minKm}–{s.maxKm >= 9999 ? '∞' : s.maxKm} km: {product.freeDelivery ? 'Free' : `₹${s.charge}`}</span>
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400"><Clock size={10}/>{s.timeLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {user?.role === 'buyer' && product.stock > 0 && (canDeliver !== false) && (
              <button onClick={() => setShowOrder(true)} className="btn-primary flex-1 text-base flex items-center justify-center gap-2">🛒 Order Now</button>
            )}
            {user?.role === 'buyer' && product.stock > 0 && canDeliver === false && (
              <div className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400 text-sm text-center font-medium">Outside delivery area</div>
            )}
            {user?.role === 'buyer' && (
              <>
                <button onClick={startChat} disabled={startingChat} className="btn-secondary flex items-center gap-2 px-4">
                  {startingChat ? <Loader size={16} className="animate-spin"/> : <MessageCircle size={16}/>}Chat
                </button>
                <button onClick={toggleWishlist} className={`p-2.5 rounded-xl border transition-all ${wishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'}`}>
                  <Heart size={18} className={wishlisted ? 'fill-white' : ''}/>
                </button>
              </>
            )}
            {!user && <button onClick={() => navigate('/login')} className="btn-primary w-full text-base">Login to Order</button>}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">Reviews & Ratings</h2>
        {user?.role === 'buyer' && (
          <div className="card p-5 mb-6">
            <p className="font-semibold text-gray-800 dark:text-white mb-1">Write a Review</p>
            <p className="text-xs text-gray-400 mb-3">Only available after a verified delivered order</p>
            <div className="flex items-center gap-2 mb-3">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setUserRating(s)}>
                  <Star size={26} className={s <= userRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}/>
                </button>
              ))}
              {userRating > 0 && <span className="text-sm text-gray-500 ml-2">{['','Poor','Fair','Good','Very Good','Excellent'][userRating]}</span>}
            </div>
            <textarea className="input-field resize-none h-20 text-sm mb-3" placeholder="Share your experience..." value={review} onChange={e => setReview(e.target.value)}/>
            <button onClick={submitRating} disabled={submitting || !userRating} className="btn-primary text-sm py-2 flex items-center gap-2">
              {submitting ? <Loader size={14} className="animate-spin"/> : null}Submit Review
            </button>
          </div>
        )}
        {ratings.length === 0
          ? <p className="text-gray-400 text-sm">No reviews yet. Order and be the first to review!</p>
          : (
            <div className="space-y-4">
              {ratings.map(r => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{r.buyer?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">{r.buyer?.name}</p>
                        <p className="text-gray-400 text-xs">{formatDate(r.createdAt)}</p>
                      </div>
                      <div className="flex mb-1.5">{stars(r.rating)}</div>
                      {r.review && <p className="text-gray-600 dark:text-gray-300 text-sm">{r.review}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {showOrder && <OrderModal product={product} buyerLocation={buyerLocation} onClose={() => setShowOrder(false)} onSuccess={() => {}}/>}
    </div>
  );
}
