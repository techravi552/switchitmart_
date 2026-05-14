import { Link } from 'react-router-dom';
import { MapPin, ShoppingBag, Store, Star, Truck, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo1 from '../assets/logo/logo-light.png';
import logo2 from '../assets/logo/logo2.png';


export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-navy-500/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-6 animate-fade-in">
            <MapPin size={14} className="text-brand-300" />
            Shop Switch, support your neighbourhood
          </div>

          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 animate-slide-up">
            Your Local Market,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-amber-300">
              Now Digital
            </span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in">
            Connect with sellers near you. Order fresh products with fast, affordable delivery based on real distance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up">
            {user ? (
              <Link
                to={user.role === 'seller' ? '/seller/dashboard' : '/products'}
                className="bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-3.5 rounded-2xl text-lg shadow-orange transition-all hover:-translate-y-1 flex items-center gap-2"
              >
                {user.role === 'seller' ? 'Go to Dashboard' : 'Start Shopping'}
                <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-3.5 rounded-2xl text-lg shadow-orange transition-all hover:-translate-y-1 flex items-center gap-2">
                  Start Shopping <ArrowRight size={20} />
                </Link>
                <Link to="/products" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3.5 rounded-2xl text-lg transition-all hover:-translate-y-1">
                  Browse Products
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/10">
            {[['Local Sellers', '500+'], ['Products', '10k+'], ['Happy Buyers', '25k+'], ['Cities', '50+']].map(([label, val]) => (
              <div key={label} className="text-center">
                <p className="font-display font-bold text-2xl text-white">{val}</p>
                <p className="text-white/50 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-3">Why SwitchitMart ?</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Everything you need for a seamless local shopping experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <MapPin className="text-brand-500" size={28} />,
              title: 'Location-Based',
              desc: 'Find sellers near you using real GPS distance. Always know how far your order is.',
              bg: 'bg-orange-50',
            },
            {
              icon: <Truck className="text-blue-500" size={28} />,
              title: 'Smart Delivery',
              desc: 'Transparent delivery charges based on actual distance. Some sellers even offer free delivery!',
              bg: 'bg-blue-50',
            },
            {
              icon: <Star className="text-amber-500" size={28} />,
              title: 'Trusted Sellers',
              desc: 'All sellers are verified with active subscriptions. Rated by real buyers like you.',
              bg: 'bg-amber-50',
            },
            {
              icon: <Zap className="text-purple-500" size={28} />,
              title: 'Boosted Listings',
              desc: 'Sellers can boost products for greater visibility. Always find the best deals first.',
              bg: 'bg-purple-50',
            },
            {
              icon: <Shield className="text-green-500" size={28} />,
              title: 'Secure Orders',
              desc: 'JWT-secured accounts, seller verification, and real-time order tracking.',
              bg: 'bg-green-50',
            },
            {
              icon: <Store className="text-rose-500" size={28} />,
              title: 'Multi-Seller',
              desc: 'Hundreds of sellers across categories. Compare prices and reviews easily.',
              bg: 'bg-rose-50',
            },
          ].map((f) => (
            <div key={f.title} className="card-hover p-6">
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>{f.icon}</div>
              <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl text-gray-900 mb-3">Seller Subscription Plans</h2>
          <p className="text-gray-500 mb-10">Choose a plan that fits your business. Start free, grow bigger.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              // { name: 'Normal', products: 5, price: 0, icon: '🛍️', color: 'border-gray-200' },
              { name: 'Silver', products: 20, price: 5000, icon: '🥈', color: 'border-gray-300 shadow-lg', popular: false },
              { name: 'Gold', products: 50, price: 10000, icon: '⭐', color: 'border-gray-200' },
                { name: 'platinumGold', products: 100, price: 15000, icon: '💎', color: 'border-brand-400 shadow-orange ring-2 ring-brand-400', popular: true },

            ].map((p) => (
              <div key={p.name} className={`card p-6 border-2 ${p.color} relative`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
                )}
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-display font-bold text-xl text-gray-900">{p.name}</h3>
                <p className="text-3xl font-bold text-brand-600 my-3">
                  {p.price === 0 ? 'Free' : `₹${p.price}`}
                  {p.price > 0 && <span className="text-sm font-normal text-gray-400">/mo</span>}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-gray-700">{p.products} products</span> per month
                </p>
                <div className="mt-4 space-y-1.5">
                  {['Order management', 'Analytics dashboard', p.products >= 20 ? 'Product boost' : null].filter(Boolean).map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-green-500" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/signup?role=seller" className="btn-primary inline-flex items-center gap-2">
              <Store size={18} /> Start Selling Today
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
          Ready to shop local?
        </h2>
        <p className="text-gray-500 text-lg mb-8">Join thousands of buyers and sellers on LocalKart</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/signup" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
            <ShoppingBag size={20} /> Join as Buyer
          </Link>
          <Link to="/signup" className="btn-secondary text-lg px-8 py-3 flex items-center gap-2">
            <Store size={20} /> Become a Seller
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white/60 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo2} className="w-9 h-6" alt="" />
            <span className="font-display font-bold text-white">SwitchitMart</span>
          </div>
          <p className="text-sm">© 2024 SwitchIT. Shop local, live better.</p>
        </div>
      </footer>
    </div>
  );
}








// import { Link } from 'react-router-dom';
// import { useState } from 'react';
// import {
//   MapPin,
//   ShoppingBag,
//   Store,
//   Star,
//   Truck,
//   Shield,
//   Zap,
//   ArrowRight,
//   CheckCircle
// } from 'lucide-react';

// import { useAuth } from '../context/AuthContext';

// import logo1 from '../assets/logo/logo-light.png';
// import logo2 from '../assets/logo/logo2.png';

// import SwitchItMartShowcase from '../components/SwitchItMartShowcase';

// export default function Home() {

//   const { user } = useAuth();

//   const [openShowcase, setOpenShowcase] = useState(false);

//   // OPEN SHOWCASE PAGE
//   if (openShowcase) {
//     return <SwitchItMartShowcase />;
//   }

//   return (
//     <div className="min-h-screen">

//       {/* Hero */}
//       <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 overflow-hidden">

//         {/* Background decoration */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
//           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-navy-500/30 rounded-full blur-3xl" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
//         </div>

//         <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">

//           <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-6 animate-fade-in">
//             <MapPin size={14} className="text-brand-300" />
//             Shop Switch, support your neighbourhood
//           </div>

//           <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 animate-slide-up">
//             Your Local Market,
//             <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-amber-300">
//               Now Digital
//             </span>
//           </h1>

//           <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in">
//             Connect with sellers near you. Order fresh products with fast,
//             affordable delivery based on real distance.
//           </p>

//           {/* BUTTONS */}
//           <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up">

//             {user ? (
//               <Link
//                 to={user.role === 'seller' ? '/seller/dashboard' : '/products'}
//                 className="bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-3.5 rounded-2xl text-lg shadow-orange transition-all hover:-translate-y-1 flex items-center gap-2"
//               >
//                 {user.role === 'seller'
//                   ? 'Go to Dashboard'
//                   : 'Start Shopping'}

//                 <ArrowRight size={20} />
//               </Link>
//             ) : (
//               <>
//                 <Link
//                   to="/signup"
//                   className="bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-3.5 rounded-2xl text-lg shadow-orange transition-all hover:-translate-y-1 flex items-center gap-2"
//                 >
//                   Start Shopping <ArrowRight size={20} />
//                 </Link>

//                 <Link
//                   to="/products"
//                   className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3.5 rounded-2xl text-lg transition-all hover:-translate-y-1"
//                 >
//                   Browse Products
//                 </Link>
//               </>
//             )}

//             {/* SHOWCASE BUTTON */}
//             <button
//               onClick={() => setOpenShowcase(true)}
//               className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3.5 rounded-2xl text-lg shadow-2xl transition-all hover:-translate-y-1 hover:scale-105"
//             >
//               About Us
//             </button>

//           </div>

//           {/* Stats */}
//           <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/10">

//             {[
//               ['Local Sellers', '500+'],
//               ['Products', '10k+'],
//               ['Happy Buyers', '25k+'],
//               ['Cities', '50+']
//             ].map(([label, val]) => (
//               <div key={label} className="text-center">
//                 <p className="font-display font-bold text-2xl text-white">
//                   {val}
//                 </p>

//                 <p className="text-white/50 text-sm">
//                   {label}
//                 </p>
//               </div>
//             ))}

//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="py-20 max-w-6xl mx-auto px-4">

//         <div className="text-center mb-12">
//           <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-3">
//             Why SwitchitMart ?
//           </h2>

//           <p className="text-gray-500 text-lg max-w-xl mx-auto">
//             Everything you need for a seamless local shopping experience
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

//           {[
//             {
//               icon: <MapPin className="text-brand-500" size={28} />,
//               title: 'Location-Based',
//               desc: 'Find sellers near you using real GPS distance.',
//               bg: 'bg-orange-50',
//             },
//             {
//               icon: <Truck className="text-blue-500" size={28} />,
//               title: 'Smart Delivery',
//               desc: 'Transparent delivery charges.',
//               bg: 'bg-blue-50',
//             },
//             {
//               icon: <Star className="text-amber-500" size={28} />,
//               title: 'Trusted Sellers',
//               desc: 'Verified sellers with ratings.',
//               bg: 'bg-amber-50',
//             },
//             {
//               icon: <Zap className="text-purple-500" size={28} />,
//               title: 'Boosted Listings',
//               desc: 'Boost products for more visibility.',
//               bg: 'bg-purple-50',
//             },
//             {
//               icon: <Shield className="text-green-500" size={28} />,
//               title: 'Secure Orders',
//               desc: 'Secure payments and tracking.',
//               bg: 'bg-green-50',
//             },
//             {
//               icon: <Store className="text-rose-500" size={28} />,
//               title: 'Multi-Seller',
//               desc: 'Compare sellers easily.',
//               bg: 'bg-rose-50',
//             },
//           ].map((f) => (

//             <div key={f.title} className="card-hover p-6">

//               <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
//                 {f.icon}
//               </div>

//               <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">
//                 {f.title}
//               </h3>

//               <p className="text-gray-500 text-sm leading-relaxed">
//                 {f.desc}
//               </p>

//             </div>
//           ))}

//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-navy-900 text-white/60 py-8">

//         <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">

//           <div className="flex items-center gap-2">
//             <img src={logo2} className="w-9 h-6" alt="" />

//             <span className="font-display font-bold text-white">
//               SwitchitMart
//             </span>
//           </div>

//           <p className="text-sm">
//             © 2026 SwitchIT. Shop local, live better.
//           </p>

//         </div>
//       </footer>

//     </div>
//   );
// }