import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, SlidersHorizontal, X, Loader, Navigation } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';
import { SkeletonCard } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','Food','Electronics','Clothing','Home','Beauty','Sports','Books','Other','General'];
const SORTS = [
  { value:'subscription', label:'Featured' },
  { value:'nearest',      label:'Nearest First' },
  { value:'price_low',    label:'Price: Low → High' },
  { value:'price_high',   label:'Price: High → Low' },
  { value:'rating',       label:'Top Rated' },
  { value:'discount',     label:'Best Discount' },
  { value:'popular',      label:'Most Popular' },
];

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort]         = useState('subscription');
  const [location, setLocation] = useState({ lat:'', lon:'' });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [locationPrompted, setLocationPrompted] = useState(false);

  // Auto-request GPS on first load
  useEffect(() => {
    if (!locationPrompted) {
      setLocationPrompted(true);
      navigator.geolocation?.getCurrentPosition(
        p => { setLocation({ lat: p.coords.latitude, lon: p.coords.longitude }); setSort('nearest'); },
        () => {} // silent fail
      );
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search)      p.append('search', search);
      if (category !== 'all') p.append('category', category);
      p.append('sort', sort);
      if (location.lat) { p.append('lat', location.lat); p.append('lon', location.lon); }
      if (minPrice)    p.append('minPrice', minPrice);
      if (maxPrice)    p.append('maxPrice', maxPrice);
      if (minRating)   p.append('minRating', minRating);
      const r = await api.get(`/products?${p}`);
      setProducts(r.data.products);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  }, [search, category, sort, location, minPrice, maxPrice, minRating]);

  useEffect(() => { const t = setTimeout(fetchProducts, 400); return () => clearTimeout(t); }, [fetchProducts]);

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      p => { setLocation({ lat: p.coords.latitude, lon: p.coords.longitude }); setSort('nearest'); toast.success('Location set 📍'); setGpsLoading(false); },
      () => { toast.error('GPS failed'); setGpsLoading(false); }
    );
  };

  const handleOrder = product => {
    if (!user) return toast.error('Login to order');
    if (user.role === 'seller') return toast.error('Sellers cannot order');
    setSelectedProduct(product);
  };

  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); setMinRating(''); setCategory('all'); };
  const hasFilters = minPrice || maxPrice || minRating || category !== 'all';

  const inStock   = products.filter(p => p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-5">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Browse Products</h1>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-gray-500 text-sm">{products.length} products</p>
          {inStock > 0 && <span className="text-xs text-green-600 font-medium">{inStock} in stock</span>}
          {outOfStock > 0 && <span className="text-xs text-red-500 font-medium">{outOfStock} out of stock</span>}
          {location.lat && <span className="text-xs text-brand-600 font-medium flex items-center gap-1"><MapPin size={11}/>Location-based delivery filter active</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="input-field pl-10" placeholder="Search products, categories, tags..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16}/></button>}
        </div>
        <button onClick={location.lat ? ()=>setLocation({lat:'',lon:''}) : getGPS} disabled={gpsLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${location.lat ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
          {gpsLoading ? <Loader size={16} className="animate-spin"/> : <Navigation size={16}/>}
          {location.lat ? 'Clear GPS' : 'Use GPS'}
          {location.lat && <X size={14}/>}
        </button>
        <select className="input-field w-auto text-sm" value={sort} onChange={e=>setSort(e.target.value)}>
          {SORTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={()=>setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm relative transition-all ${showFilters||hasFilters?'bg-brand-50 border-brand-300 text-brand-600':'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
          <SlidersHorizontal size={16}/>Filters
          {hasFilters && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-4 p-5 card animate-slide-up space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800 dark:text-white text-sm">Filters</p>
            {hasFilters && <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setCategory(c)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-all ${category===c?'bg-brand-500 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Min Price (₹)</p>
              <input type="number" placeholder="0" className="input-field text-sm py-2" value={minPrice} onChange={e=>setMinPrice(e.target.value)}/>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Max Price (₹)</p>
              <input type="number" placeholder="Any" className="input-field text-sm py-2" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Min Rating</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(r=>(
                  <button key={r} onClick={()=>setMinRating(minRating==r?'':r)}
                    className={`w-8 h-8 rounded-lg text-xs transition-all ${minRating>=r?'bg-amber-400 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                    {r}★
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location info banner */}
      {location.lat && (
        <div className="mb-4 p-2.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700 rounded-xl text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2">
          <MapPin size={12}/>Only showing products that deliver to your location (within each seller's delivery radius)
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display font-bold text-xl text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
          <p className="text-gray-400 text-sm mb-3">
            {location.lat ? 'No sellers deliver to your location, or try clearing GPS filter.' : 'Try different filters or search terms.'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {hasFilters && <button onClick={clearFilters} className="btn-secondary text-sm">Clear filters</button>}
            {location.lat && <button onClick={()=>setLocation({lat:'',lon:''})} className="btn-secondary text-sm">Clear GPS filter</button>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p._id} product={p} onOrder={handleOrder}/>)}
        </div>
      )}

      {selectedProduct && <OrderModal product={selectedProduct} onClose={()=>setSelectedProduct(null)} onSuccess={fetchProducts}/>}
    </div>
  );
}
