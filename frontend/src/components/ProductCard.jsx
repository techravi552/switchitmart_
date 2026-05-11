import { Link } from 'react-router-dom';
import { MapPin, Star, Truck, Zap, ShoppingBag, Heart, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

const planBadge = {
  platinum: <span className="badge-platinum flex items-center gap-1">💎 Platinum</span>,
  gold:     <span className="badge-gold    flex items-center gap-1">🥇 Gold</span>,
  silver:   <span className="badge-silver  flex items-center gap-1">🥈 Silver</span>,
  free: null,
};

const StockBadge = ({ stock }) => {
  if (stock === 0)   return <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Out of Stock</span>;
  // if (stock <= 9)    return <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">Low Stock ({stock})</span>;
  if (stock <= 9)    return <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">Low Stock </span>;
  return <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">In Stock</span>;
};

export default function ProductCard({ product, onOrder }) {
  const { user } = useAuth();
  const sellerPlan = product?.seller?.subscription?.plan || 'free';
  const isBoosted  = product.isCurrentlyBoosted;
  const imgUrl     = product.image ? (product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`) : null;
  const [wishlisted, setWishlisted] = useState(false);

  const toggleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user || user.role !== 'buyer') return;
    try {
      const r = await api.post(`/products/${product._id}/wishlist`);
      setWishlisted(r.data.inWishlist);
      toast.success(r.data.message);
    } catch { toast.error('Failed'); }
  };

  const hasDiscount = product.mrpPrice && product.mrpPrice > product.price;
  const discountPct = hasDiscount ? Math.round(((product.mrpPrice - product.price) / product.mrpPrice) * 100) : 0;
  const outOfStock  = product.stock === 0;

  return (
    <div className={`card-hover overflow-hidden group ${isBoosted ? 'ring-2 ring-brand-400 ring-offset-1' : ''} ${outOfStock ? 'opacity-80' : ''}`}>
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600">
        {imgUrl
          ? <img src={imgUrl} alt={product.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'grayscale' : ''}`}/>
          : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={48} className="text-brand-300"/></div>}

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {planBadge[sellerPlan]}
          {isBoosted && <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Zap size={10}/>Boosted</span>}
          {hasDiscount && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">{discountPct}% OFF</span>}
        </div>

        {/* Top-right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {product.freeDelivery && <div className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Truck size={10}/>Free</div>}
          {user?.role === 'buyer' && (
            <button onClick={toggleWishlist} className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}>
              <Heart size={13} className={wishlisted ? 'fill-white' : ''} />
            </button>
          )}
        </div>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold text-sm px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{product.seller?.shopName || product.seller?.name}</p>
        </div>

        {/* Stock badge */}
        <div className="mb-2"><StockBadge stock={product.stock} /></div>

        {product.totalRatings > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {Array.from({length:5},(_,i)=><Star key={i} size={11} className={i<Math.round(product.avgRating||0)?'text-amber-400 fill-amber-400':'text-gray-200 fill-gray-200'}/>)}
            <span className="text-xs text-gray-400">({product.totalRatings})</span>
          </div>
        )}

        {product.distance !== undefined && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2 flex-wrap">
            <MapPin size={11} className="text-brand-400"/>{product.distance} km
            {product.estimatedTime && <><span className="mx-0.5 text-gray-300">·</span><Clock size={10} className="text-blue-400"/>{product.estimatedTime}</>}
            <span className="mx-0.5 text-gray-300">·</span>
            {product.freeDelivery ? <span className="text-green-600 font-medium">Free</span> : <span>₹{product.deliveryCharge} del.</span>}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display font-bold text-brand-600 text-lg leading-none">{formatCurrency(product.price)}</p>
              {hasDiscount && <p className="line-through text-gray-400 text-sm">{formatCurrency(product.mrpPrice)}</p>}
            </div>



            {hasDiscount && <p className="text-xs text-green-600 font-medium">Save {formatCurrency(product.mrpPrice - product.price)}</p>}
          </div>
          <div className="flex gap-2">
            <Link to={`/products/${product._id}`} className="text-xs font-medium text-brand-600 hover:underline">Details</Link>
            {onOrder && !outOfStock && (
              <button onClick={() => onOrder(product)} className="btn-primary text-xs py-1.5 px-3">Order</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
