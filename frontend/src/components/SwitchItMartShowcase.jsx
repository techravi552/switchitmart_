// STEP 1:
// Is component ko save karo:
// src/components/SwitchItMartShowcase.jsx

// STEP 2:
// Home page me use karne ke liye:
// import SwitchItMartShowcase from './components/SwitchItMartShowcase';
// <SwitchItMartShowcase />

// STEP 3:
// Agar button click par open karna hai to niche example diya gaya hai.

/*

Example Home.jsx

import { useState } from 'react';
import SwitchItMartShowcase from './components/SwitchItMartShowcase';

export default function Home() {
  const [openShowcase, setOpenShowcase] = useState(false);

  return (
    <div>
      {!openShowcase ? (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <button
            onClick={() => setOpenShowcase(true)}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xl font-bold hover:scale-105 duration-300 shadow-2xl"
          >
            Open SwitchItMart
          </button>
        </div>
      ) : (
        <SwitchItMartShowcase />
      )}
    </div>
  );
}

*/

export default function SwitchItMartShowcase() {
  const features = [
    {
      title: "Multi Seller Marketplace",
      desc: "Different sellers can manage products, pricing, and orders from their own dashboard.",
      icon: "🛍️",
    },
    {
      title: "Subscription Plans",
      desc: "₹5000, ₹10000, and ₹15000 seller plans with premium visibility and analytics.",
      icon: "💳",
    },
    {
      title: "Live Chat System",
      desc: "Buyers and sellers can connect instantly using the built-in chat system.",
      icon: "💬",
    },
    {
      title: "Delivery Charges",
      desc: "Automatic delivery charge calculation based on distance and product size.",
      icon: "🚚",
    },
    {
      title: "Modern Admin Panel",
      desc: "Control users, sellers, products, subscriptions, and reports from one place.",
      icon: "⚙️",
    },
    {
      title: "Secure Payments",
      desc: "Online payment integration with fast checkout experience.",
      icon: "🔒",
    },
  ];

  const futureIdeas = [
    "AI Product Recommendation",
    "Voice Search",
    "Dark / Light Mode",
    "Referral & Reward System",
    "Seller Verification Badge",
    "Real-time Delivery Tracking",
    "Wishlist",
    "Coupon System",
    "Inventory Analytics",
    "Product Reviews",
    "OTP Login",
    "Nearby Seller Detection",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white overflow-hidden">
      {/* HERO */}
      <section className="relative px-6 md:px-16 py-16 md:py-24">
        <div className="absolute top-0 left-0 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>

        <div className="grid lg:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <div className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-lg animate-pulse">
              🚀 Next Generation Marketplace
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Switch<span className="text-pink-500">It</span>Mart
            </h1>

            <p className="mt-6 text-zinc-300 text-lg leading-relaxed max-w-xl">
              A powerful multi-seller marketplace built with Vite + React where
              buyers and sellers connect with modern shopping, subscriptions,
              live chat, delivery system, and premium seller plans.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <button className="px-7 py-3 rounded-2xl bg-pink-500 hover:scale-105 duration-300 font-semibold shadow-2xl shadow-pink-500/30">
                Explore Platform
              </button>

              <button className="px-7 py-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 duration-300">
                View Features
              </button>
            </div>
          </div>

          {/* BOOK STYLE CARD */}
          <div className="relative flex justify-center">
            <div className="relative w-[320px] md:w-[450px] h-[500px] perspective-[2000px] group">
              <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-pink-500 to-purple-700 rotate-[-6deg] group-hover:rotate-[-12deg] duration-500 shadow-2xl"></div>

              <div className="absolute inset-0 rounded-[30px] bg-zinc-900 border border-white/10 overflow-hidden rotate-3 group-hover:rotate-6 duration-500 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1200&auto=format&fit=crop"
                  alt="marketplace"
                  className="w-full h-64 object-cover"
                />

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Marketplace Book</h2>
                    <span className="text-pink-400">2026</span>
                  </div>

                  <p className="text-zinc-400 mt-4 leading-relaxed">
                    Interactive marketplace experience with animated sections,
                    seller plans, buyer system, and modern ecommerce design.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-3xl font-bold text-pink-400">500+</p>
                      <p className="text-zinc-400 text-sm">Products</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-3xl font-bold text-blue-400">50+</p>
                      <p className="text-zinc-400 text-sm">Sellers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 md:px-16 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black">
            Powerful Features
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
            Everything you need for a modern multi-seller ecommerce platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 duration-300 hover:border-pink-500/40 backdrop-blur-lg"
            >
              <div className="text-5xl mb-5 group-hover:scale-110 duration-300 inline-block">
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>

              <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section className="px-6 md:px-16 py-20 bg-white/5">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black">Seller Plans</h2>
          <p className="text-zinc-400 mt-4">
            Choose a subscription plan to unlock premium marketplace features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              price: "₹5000",
              title: "Starter",
              color: "border-pink-500/30",
            },
            {
              price: "₹10000",
              title: "Professional",
              color: "border-blue-500/30",
            },
            {
              price: "₹15000",
              title: "Enterprise",
              color: "border-yellow-500/30",
            },
          ].map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-[35px] border ${plan.color} bg-zinc-900 p-8 hover:scale-105 duration-300 overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

              <h3 className="text-3xl font-black">{plan.title}</h3>

              <div className="text-6xl font-black mt-6 bg-gradient-to-r from-pink-400 to-blue-400 text-transparent bg-clip-text">
                {plan.price}
              </div>

              <ul className="space-y-4 mt-8 text-zinc-300">
                <li>✔ Unlimited Product Listings</li>
                <li>✔ Seller Dashboard</li>
                <li>✔ Chat Access</li>
                <li>✔ Premium Visibility</li>
                <li>✔ Analytics & Reports</li>
              </ul>

              <button className="mt-8 w-full py-3 rounded-2xl bg-white text-black font-bold hover:scale-105 duration-300">
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* BOOK PAGES STYLE */}
      <section className="px-6 md:px-16 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black">Interactive Pages</h2>
          <p className="text-zinc-400 mt-4">
            Book-style animated content sections for premium experience.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-pink-500/10 to-blue-500/10 border border-white/10 p-6 rounded-3xl hover:translate-x-3 duration-300">
              <h3 className="text-3xl font-bold mb-4">📦 Product Showcase</h3>
              <p className="text-zinc-400 leading-relaxed">
                Add product sliders, 3D cards, hover animations, quick view,
                and wishlist functionality.
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-white/10 p-6 rounded-3xl hover:translate-x-3 duration-300">
              <h3 className="text-3xl font-bold mb-4">💬 Chat Experience</h3>
              <p className="text-zinc-400 leading-relaxed">
                Add typing animation, emoji support, online status, and voice
                messages.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-white/10 p-6 rounded-3xl hover:translate-x-3 duration-300">
              <h3 className="text-3xl font-bold mb-4">🚚 Delivery Tracking</h3>
              <p className="text-zinc-400 leading-relaxed">
                Add map integration, live delivery tracking, estimated arrival,
                and shipping status.
              </p>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=1200&auto=format&fit=crop"
              alt="team"
              className="rounded-[40px] shadow-2xl border border-white/10"
            />

            <div className="absolute -bottom-6 -left-6 bg-black/70 backdrop-blur-lg border border-white/10 rounded-3xl p-5 w-64">
              <h4 className="font-bold text-xl">Creative UI Design</h4>
              <p className="text-zinc-400 mt-2 text-sm">
                Responsive animated layout with modern ecommerce styling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FUTURE IDEAS */}
      <section className="px-6 md:px-16 py-20 bg-gradient-to-b from-black to-zinc-950">
        <div className="text-center mb-14">
          <h2 className="text-5xl font-black">What You Can Add</h2>
          <p className="text-zinc-400 mt-4">
            Future features to make SwitchItMart even bigger.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {futureIdeas.map((idea, index) => (
            <div
              key={index}
              className="px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-pink-500 hover:text-white duration-300 cursor-pointer"
            >
              {idea}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-16 py-12 border-t border-white/10 text-center">
        <h2 className="text-4xl font-black">
          Build Your Marketplace Empire 🚀
        </h2>

        <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
          SwitchItMart combines ecommerce, subscriptions, delivery, and modern
          UI into one powerful platform.
        </p>

        <button className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-blue-500 font-bold hover:scale-105 duration-300 shadow-2xl">
          Launch Marketplace
        </button>
      </footer>
    </div>
  );
}
