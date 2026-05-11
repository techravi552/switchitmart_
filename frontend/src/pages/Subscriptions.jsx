import { useState, useEffect } from 'react';
import { CheckCircle, Loader, AlertCircle, Calendar, Package, Zap } from 'lucide-react';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/Spinner';

const PLAN_STYLES = {
  free:     { grad:'from-gray-100 to-gray-200', text:'text-gray-700', btn:'bg-gray-700 hover:bg-gray-800 text-white', icon:'🛍️', border:'' },
  silver:   { grad:'from-slate-400 to-slate-600', text:'text-white',    btn:'bg-white text-slate-700 hover:bg-slate-50', icon:'🥈', border:'' },
  gold:     { grad:'from-yellow-400 to-amber-500', text:'text-white',   btn:'bg-white text-amber-700 hover:bg-amber-50', icon:'🥇', border:'ring-2 ring-amber-400 ring-offset-2' },
  platinum: { grad:'from-purple-500 to-indigo-600', text:'text-white',  btn:'bg-white text-purple-700 hover:bg-purple-50', icon:'💎', border:'ring-2 ring-purple-500 ring-offset-2', popular:true },
};

export default function Subscriptions() {
  const [current, setCurrent] = useState(null);
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        api.get('/subscriptions/my').catch(() => ({ data: { subscription: null } })),
        api.get('/subscriptions/plans'),
      ]);
      setCurrent(subRes.data.subscription);
      setPlans(plansRes.data.plans || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const purchase = async (planId) => {
    setPurchasing(planId);
    try {
      const r = await api.post('/subscriptions/purchase', { plan: planId });
      toast.success(r.data.message);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    }
    setPurchasing(null);
  };

  if (loading) return <PageLoader />;

  const isActive   = current && !current.isExpired;
  const progress   = current ? (current.productsUsed / (current.planInfo?.productLimit || 1)) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">Subscription Plans</h1>
        <p className="text-gray-500">Choose the plan that powers your store</p>
      </div>

      {/* Current subscription card */}
      {current && (
        <div className={`mb-8 p-5 rounded-2xl border-2 ${isActive?'bg-green-50 border-green-200':'bg-red-50 border-red-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isActive?<CheckCircle size={18} className="text-green-500"/>:<AlertCircle size={18} className="text-red-500"/>}
                <h3 className="font-semibold text-gray-900">
                  {current.planInfo?.name} Plan
                  <span className={`ml-2 text-sm font-medium ${isActive?'text-green-600':'text-red-600'}`}>{isActive?'✓ Active':'✗ Expired'}</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Calendar size={13}/>Expires: {formatDate(current.expiryDate)}</span>
                <span className="flex items-center gap-1"><Package size={13}/>{current.productsUsed}/{current.planInfo?.productLimit} products</span>
                <span className="flex items-center gap-1"><Zap size={13}/>{current.boostsUsed}/{current.planInfo?.boostLimit===-1?'∞':current.planInfo?.boostLimit} boosts</span>
              </div>
              <div className="mt-3 h-1.5 bg-gray-200 rounded-full max-w-xs">
                <div className={`h-full rounded-full ${progress>=90?'bg-red-400':'bg-green-400'}`} style={{width:`${Math.min(progress,100)}%`}}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map(plan => {
          const style = PLAN_STYLES[plan.id] || PLAN_STYLES.free;
          const isCurrent = isActive && current?.plan === plan.id;
          const isLoading = purchasing === plan.id;
          return (
            <div key={plan.id} className={`relative rounded-2xl overflow-hidden shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover ${style.border}`}>
              {style.popular && (
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold text-center py-1.5">💎 Most Popular</div>
              )}
              <div className={`bg-gradient-to-br ${style.grad} p-5 ${style.popular?'pt-8':''}`}>
                <div className="text-3xl mb-2">{style.icon}</div>
                <h2 className={`font-display font-bold text-xl ${style.text}`}>{plan.name}</h2>
                <p className={`text-2xl font-bold mt-1 ${style.text}`}>
                  {plan.price===0?'Free':`₹${plan.price}`}
                  {plan.price>0&&<span className={`text-sm font-normal opacity-80 ${style.text}`}>/mo</span>}
                </p>
                <p className={`text-xs mt-1 opacity-70 ${style.text}`}>{plan.productLimit} products/month</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4">
                <ul className="space-y-2 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0"/>{f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full py-2 rounded-xl bg-green-50 text-green-700 text-xs font-bold text-center flex items-center justify-center gap-1">
                    <CheckCircle size={13}/>Current Plan
                  </div>
                ) : (
                  <button onClick={()=>purchase(plan.id)} disabled={!!purchasing}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${style.btn}`}>
                    {isLoading?<><Loader size={13} className="animate-spin"/>Processing...</>:plan.price===0?'Start Free':`Get ${plan.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">ℹ️ How it works</p>
        <p className="text-xs text-blue-600 dark:text-blue-300">Plans activate instantly for 30 days. Upgrading replaces your current plan immediately. Payment is simulated in demo mode.</p>
      </div>
    </div>
  );
}
