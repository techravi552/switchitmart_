import { useState, useEffect } from 'react';
import { X, MapPin, Truck, ShoppingBag, Loader, Clock, CreditCard, AlertTriangle, Navigation } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function OrderModal({ product, buyerLocation: propLocation, onClose, onSuccess }) {
  const [location, setLocation] = useState(
    propLocation
      ? { latitude: propLocation.latitude, longitude: propLocation.longitude, address: 'Your Location' }
      : { latitude: '', longitude: '', address: '' }
  );
  const [quantity, setQuantity] = useState(1);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [notes, setNotes]       = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [rzpLoading, setRzpLoading] = useState(false);

  const getGPS = () => {
    navigator.geolocation?.getCurrentPosition(
      p => setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, address: 'GPS Location' }),
      () => toast.error('GPS failed')
    );
  };

  useEffect(() => {
    if (location.latitude && location.longitude && product) fetchEstimate();
  }, [location.latitude, location.longitude, product]);

  const fetchEstimate = async () => {
    setEstimating(true);
    try {
      const r = await api.post('/orders/estimate', { productId: product._id, latitude: location.latitude, longitude: location.longitude });
      setEstimate(r.data);
    } catch {}
    setEstimating(false);
  };

  const loadRazorpay = () => new Promise(res => {
    if (window.Razorpay) return res(true);
    const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => res(true); s.onerror = () => res(false); document.body.appendChild(s);
  });

  const handleOrder = async () => {
    if (!location.latitude || !location.longitude) return toast.error('Please set your location');
    if (estimate && !estimate.withinRadius) return toast.error(`Outside delivery area (${estimate.distance} km, limit ${product.deliveryRadius || 10} km)`);
    setLoading(true);
    try {
      const r = await api.post('/orders', {
        productId: product._id, quantity, latitude: location.latitude,
        longitude: location.longitude, address: location.address, notes, paymentMethod,
      });
      const order = r.data.order;

      if (paymentMethod === 'razorpay') {
        setLoading(false); setRzpLoading(true);
        const loaded = await loadRazorpay();
        if (!loaded) { toast.error('Razorpay failed to load'); setRzpLoading(false); return; }
        const rzpRes = await api.post('/payment/razorpay/create-order', { orderId: order._id });
        const { razorpayOrderId, amount, currency, keyId } = rzpRes.data;
        new window.Razorpay({
          key: keyId, amount, currency, name: 'LocalKart', description: product.name,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              await api.post('/payment/razorpay/verify', { razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature, orderId: order._id });
              toast.success('Payment confirmed! 🎉'); onSuccess?.(); onClose();
            } catch { toast.error('Payment verification failed'); }
          },
          theme: { color: '#f97316' },
          modal: { ondismiss: () => setRzpLoading(false) },
        }).open();
        setRzpLoading(false);
      } else {
        toast.success('Order placed! Seller has 3 min to respond. 🕐');
        onSuccess?.(); onClose();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
    setLoading(false);
  };

  const imgUrl = product?.image ? (product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`) : null;
  const totalEstimate = estimate ? product.price * quantity + (estimate.freeDelivery ? 0 : estimate.deliveryCharge) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
          <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Place Order</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} className="text-gray-500"/></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Product */}
          <div className="flex gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            {imgUrl ? <img src={imgUrl} alt="" className="w-14 h-14 rounded-lg object-cover"/> : <div className="w-14 h-14 rounded-lg bg-orange-100 flex items-center justify-center"><ShoppingBag size={24} className="text-brand-400"/></div>}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
              <p className="text-brand-600 font-bold">{formatCurrency(product.price)}</p>
              {product.mrpPrice > product.price && <p className="text-xs text-green-600">Save {formatCurrency(product.mrpPrice - product.price)}</p>}
              <p className="text-xs text-gray-400">Seller responds within 3 min ⏱</p>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quantity</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 border border-gray-200 dark:border-gray-600 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">−</button>
              <span className="font-bold text-lg w-8 text-center text-gray-900 dark:text-white">{quantity}</span>
              <button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-9 h-9 border border-gray-200 dark:border-gray-600 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">+</button>
              <span className="text-xs text-gray-400">{product.stock} in stock</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Location</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input type="number" placeholder="Latitude" className="input-field text-sm" value={location.latitude} onChange={e => setLocation(p => ({ ...p, latitude: e.target.value }))} step="any"/>
              <input type="number" placeholder="Longitude" className="input-field text-sm" value={location.longitude} onChange={e => setLocation(p => ({ ...p, longitude: e.target.value }))} step="any"/>
            </div>
            <input type="text" placeholder="Address (optional)" className="input-field text-sm mb-2" value={location.address} onChange={e => setLocation(p => ({ ...p, address: e.target.value }))}/>
            <button type="button" onClick={getGPS} className="w-full flex items-center justify-center gap-2 text-sm text-brand-600 border border-brand-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl py-2 transition-colors">
              <Navigation size={15}/>Use GPS Location
            </button>
          </div>

          {/* Estimate */}
          {estimating && <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"><Loader size={14} className="animate-spin"/>Calculating delivery...</div>}

          {estimate && !estimating && (
            <>
              {!estimate.withinRadius && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Outside delivery area</p>
                    <p className="text-xs text-red-600 dark:text-red-400">You are {estimate.distance} km away. This seller delivers within {product.deliveryRadius || 10} km.</p>
                  </div>
                </div>
              )}
              {estimate.withinRadius && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-300">Distance</span><span className="font-semibold text-gray-900 dark:text-white">{estimate.distance} km</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-300 flex items-center gap-1"><Clock size={12}/>Est. Time</span><span className="font-semibold text-blue-600">{estimate.estimatedTime}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-300 flex items-center gap-1"><Truck size={12}/>Delivery</span><span className={`font-semibold ${estimate.freeDelivery ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>{estimate.freeDelivery ? 'Free' : formatCurrency(estimate.deliveryCharge)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-300">Items (×{quantity})</span><span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price * quantity)}</span></div>
                  {estimate.savings > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-300">Savings</span><span className="font-semibold text-green-600">−{formatCurrency(estimate.savings * quantity)}</span></div>}
                  <div className="border-t border-orange-200 dark:border-orange-700 pt-1.5 flex justify-between"><span className="font-bold text-gray-900 dark:text-white">Total</span><span className="font-bold text-brand-600 text-lg">{formatCurrency(totalEstimate)}</span></div>
                </div>
              )}
            </>
          )}

          {/* Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ id:'cod', label:'Cash on Delivery', icon:'💵' }, { id:'razorpay', label:'Pay Online', icon:'💳' }].map(m => (
                <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === m.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300'}`}>
                  {m.icon}{m.label}
                </button>
              ))}
            </div>
            {paymentMethod === 'razorpay' && <p className="text-xs text-blue-600 mt-1">Test: use card 4111 1111 1111 1111</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Order Notes (optional)</label>
            <textarea className="input-field text-sm resize-none h-16" placeholder="Any special instructions..." value={notes} onChange={e => setNotes(e.target.value)}/>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleOrder} disabled={loading || rzpLoading || (estimate && !estimate.withinRadius)} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {(loading || rzpLoading) ? <><Loader size={16} className="animate-spin"/>Processing...</> : `🛒 ${paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
