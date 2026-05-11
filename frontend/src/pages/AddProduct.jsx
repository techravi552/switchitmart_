import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Loader, AlertCircle, X, Navigation } from 'lucide-react';
import api from '../utils/api';
import { DEFAULT_SLABS } from '../utils/helpers';
import toast from 'react-hot-toast';

const CATEGORIES = ['General','Food','Electronics','Clothing','Home','Beauty','Sports','Books','Other'];

export default function AddProduct() {
  const navigate = useNavigate();
  const [sub, setSub]           = useState(null);
  const [loading, setLoading]   = useState(false);
  const [subLoad, setSubLoad]   = useState(true);
  const [preview, setPreview]   = useState(null);
  const [image, setImage]       = useState(null);
  const [useCustom, setUseCustom] = useState(false);
  const [slabs, setSlabs]       = useState(DEFAULT_SLABS.map(s=>({...s})));
  const [form, setForm] = useState({
    name:'', description:'', mrpPrice:'', price:'', category:'General',
    latitude:'', longitude:'', address:'', stock:'10', freeDelivery:false, deliveryRadius:'10',
  });

  useEffect(() => {
    api.get('/subscriptions/my').then(r=>setSub(r.data.subscription)).catch(()=>{}).finally(()=>setSubLoad(false));
  }, []);

  const handleChange = e => {
    const {name,value,type,checked} = e.target;
    setForm(f=>({...f,[name]:type==='checkbox'?checked:value}));
  };
  const handleImage = e => {
    const f=e.target.files[0]; if(!f) return;
    if(f.size>5*1024*1024) return toast.error('Max 5MB');
    setImage(f); setPreview(URL.createObjectURL(f));
  };
  const getGPS = () => {
    navigator.geolocation?.getCurrentPosition(
      p=>{ setForm(f=>({...f,latitude:p.coords.latitude.toFixed(6),longitude:p.coords.longitude.toFixed(6),address:'Current Location'})); toast.success('Location set!'); },
      ()=>toast.error('GPS failed')
    );
  };
  const updateSlab = (i,field,val) => { const s=[...slabs]; s[i]={...s[i],[field]:field==='timeLabel'?val:parseFloat(val)||0}; setSlabs(s); };

  const discount = form.mrpPrice && form.price && parseFloat(form.mrpPrice) > parseFloat(form.price)
    ? Math.round(((parseFloat(form.mrpPrice)-parseFloat(form.price))/parseFloat(form.mrpPrice))*100) : 0;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name||!form.price||!form.latitude||!form.longitude) return toast.error('Fill all required fields + location');
    if (form.mrpPrice && parseFloat(form.mrpPrice) < parseFloat(form.price)) return toast.error('MRP must be ≥ selling price');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      fd.append('useCustomDelivery', useCustom);
      if (useCustom) fd.append('deliverySlabs', JSON.stringify(slabs));
      if (image) fd.append('image', image);
      await api.post('/products', fd, { headers:{'Content-Type':'multipart/form-data'} });
      toast.success('Product added! 🎉');
      navigate('/seller/products');
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    setLoading(false);
  };

  if (subLoad) return <div className="flex items-center justify-center min-h-[50vh]"><Loader className="animate-spin text-brand-500" size={32}/></div>;
  const canAdd = sub && !sub.isExpired && sub.productsUsed < sub.planInfo?.productLimit;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-1">List your product for local buyers</p>
      </div>

      {sub && (
        <div className={`mb-5 p-3 rounded-xl flex items-center justify-between text-sm ${canAdd?'bg-green-50 border border-green-200 dark:bg-green-900/20':'bg-red-50 border border-red-200 dark:bg-red-900/20'}`}>
          {canAdd
            ? <span className="text-green-700 dark:text-green-300">✓ {sub.planInfo?.name} · {sub.productsUsed}/{sub.planInfo?.productLimit} used</span>
            : <span className="text-red-700 dark:text-red-300 flex items-center gap-2"><AlertCircle size={15}/>{sub.isExpired?'Subscription expired':'Product limit reached'}</span>}
          {!canAdd && <button onClick={()=>navigate('/seller/subscriptions')} className="btn-primary text-xs py-1.5 px-3">Upgrade</button>}
        </div>
      )}

      {!canAdd ? (
        <div className="card p-12 text-center"><AlertCircle size={40} className="text-red-400 mx-auto mb-3"/><p className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Subscription required to add products</p><button onClick={()=>navigate('/seller/subscriptions')} className="btn-primary">View Plans</button></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Image */}
          <div className="card p-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Product Image</label>
            {preview ? (
              <div className="relative"><img src={preview} alt="preview" className="w-full h-52 object-cover rounded-xl"/><button type="button" onClick={()=>{setPreview(null);setImage(null);}} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={14}/></button></div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all">
                <Upload size={24} className="text-gray-300 mb-2"/>
                <p className="text-sm text-gray-400">Click to upload (max 5MB)</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImage}/>
              </label>
            )}
          </div>

          {/* Details */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Product Details</h3>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label><input name="name" className="input-field" placeholder="Product name" value={form.name} onChange={handleChange}/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label><textarea name="description" className="input-field resize-none h-20 text-sm" placeholder="Describe your product..." value={form.description} onChange={handleChange}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">MRP Price (₹)</label>
                <input name="mrpPrice" type="number" min="0" step="0.01" className="input-field" placeholder="Original price" value={form.mrpPrice} onChange={handleChange}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Selling Price (₹) *</label>
                <input name="price" type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.price} onChange={handleChange}/>
                {discount > 0 && <p className="text-xs text-green-600 mt-1">🎉 {discount}% discount</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock *</label><input name="stock" type="number" min="0" className="input-field" value={form.stock} onChange={handleChange}/></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label><select name="category" className="input-field" value={form.category} onChange={handleChange}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="freeDelivery" checked={form.freeDelivery} onChange={handleChange} className="w-4 h-4 accent-brand-500"/><div><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Delivery 🚚</span><p className="text-xs text-gray-400">Attract more buyers</p></div></label>
          </div>

          {/* Location + Delivery Radius */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Location & Delivery Radius *</h3>
              <button type="button" onClick={getGPS} className="text-sm text-brand-600 flex items-center gap-1 font-medium"><Navigation size={14}/>GPS</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Latitude *</label><input name="latitude" type="number" step="any" className="input-field" placeholder="28.6139" value={form.latitude} onChange={handleChange}/></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Longitude *</label><input name="longitude" type="number" step="any" className="input-field" placeholder="77.2090" value={form.longitude} onChange={handleChange}/></div>
            </div>
            <input name="address" className="input-field" placeholder="Shop address or landmark" value={form.address} onChange={handleChange}/>
            {/* Delivery radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Radius: <span className="text-brand-600 font-bold">{form.deliveryRadius} km</span></label>
              <input name="deliveryRadius" type="range" min="1" max="50" step="1" className="w-full accent-brand-500" value={form.deliveryRadius} onChange={handleChange}/>
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1 km</span><span>Only buyers within this radius will see this product</span><span>50 km</span></div>
            </div>
          </div>

          {/* Delivery Config */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="font-semibold text-gray-800 dark:text-gray-100">Delivery Charges & Time</h3><p className="text-xs text-gray-400 mt-0.5">Customize per distance slab</p></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={useCustom} onChange={e=>setUseCustom(e.target.checked)} className="w-4 h-4 accent-brand-500"/><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom</span></label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-gray-500 uppercase"><th className="text-left py-2">Distance</th><th className="text-left py-2">₹ Charge</th><th className="text-left py-2">Est. Time</th></tr></thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {slabs.map((slab,i)=>(
                    <tr key={i}>
                      <td className="py-2 pr-3 text-gray-500 text-xs whitespace-nowrap">{slab.minKm}–{slab.maxKm>=9999?'∞':slab.maxKm}km</td>
                      <td className="py-2 pr-3"><input type="number" min="0" value={slab.charge} disabled={!useCustom} onChange={e=>updateSlab(i,'charge',e.target.value)} className={`w-20 px-2 py-1 border rounded-lg text-sm ${useCustom?'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700':'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400'}`}/></td>
                      <td className="py-2"><input type="text" value={slab.timeLabel} disabled={!useCustom} onChange={e=>updateSlab(i,'timeLabel',e.target.value)} className={`w-28 px-2 py-1 border rounded-lg text-sm ${useCustom?'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700':'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400'}`}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={()=>navigate('/seller/products')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading?<><Loader size={16} className="animate-spin"/>Adding...</>:'✓ Add Product'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
