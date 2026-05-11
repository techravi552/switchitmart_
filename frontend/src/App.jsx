// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import SellerDashboard from './pages/SellerDashboard';
// import BuyerDashboard from './pages/BuyerDashboard';
// import Products from './pages/Products';
// import ProductDetail from './pages/ProductDetail';
// import SellerProducts from './pages/SellerProducts';
// import SellerOrders from './pages/SellerOrders';
// import SellerAnalytics from './pages/SellerAnalytics';
// import BuyerOrders from './pages/BuyerOrders';
// import Subscriptions from './pages/Subscriptions';
// import AddProduct from './pages/AddProduct';
// import Wishlist from './pages/Wishlist';
// import LoadingScreen from './components/LoadingScreen';
// import ChatList from './pages/chat/ChatList';
// import ChatWindow from './pages/chat/ChatWindow';
// import SupportTickets from './pages/support/SupportTickets';
// import TicketDetail from './pages/support/TicketDetail';
// import AdminLayout from './pages/admin/AdminLayout';
// import AdminLogin from './pages/admin/AdminLogin';
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminUsers from './pages/admin/AdminUsers';
// import AdminProducts from './pages/admin/AdminProducts';
// import AdminOrders from './pages/admin/AdminOrders';
// import AdminSubscriptions from './pages/admin/AdminSubscriptions';
// import AdminNotify from './pages/admin/AdminNotify';
// import AdminActivityLogs from './pages/admin/AdminActivityLogs';
// import AdminSupport from './pages/admin/AdminSupport';
// import AdminChats from './pages/admin/AdminChats';

// const ProtectedRoute = ({ children, role }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <LoadingScreen />;
//   if (!user) return <Navigate to="/login" replace />;
//   if (role && user.role !== role) return <Navigate to="/" replace />;
//   return children;
// };
// const GuestRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <LoadingScreen />;
//   if (user) return <Navigate to={user.role==='seller'?'/seller/dashboard':'/products'} replace />;
//   return children;
// };
// const AdminRoute = ({ children }) => {
//   if (!localStorage.getItem('adminToken')) return <Navigate to="/admin/login" replace />;
//   return children;
// };

// function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/*" element={<><Navbar /><Routes>
//           <Route path="/"              element={<Home />} />
//           <Route path="/login"         element={<GuestRoute><Login /></GuestRoute>} />
//           <Route path="/signup"        element={<GuestRoute><Signup /></GuestRoute>} />
//           <Route path="/products"      element={<Products />} />
//           <Route path="/products/:id"  element={<ProductDetail />} />
//           <Route path="/seller/dashboard"     element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />
//           <Route path="/seller/products"      element={<ProtectedRoute role="seller"><SellerProducts /></ProtectedRoute>} />
//           <Route path="/seller/products/add"  element={<ProtectedRoute role="seller"><AddProduct /></ProtectedRoute>} />
//           <Route path="/seller/orders"        element={<ProtectedRoute role="seller"><SellerOrders /></ProtectedRoute>} />
//           <Route path="/seller/analytics"     element={<ProtectedRoute role="seller"><SellerAnalytics /></ProtectedRoute>} />
//           <Route path="/seller/subscriptions" element={<ProtectedRoute role="seller"><Subscriptions /></ProtectedRoute>} />
//           <Route path="/buyer/dashboard"      element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>} />
//           <Route path="/buyer/orders"         element={<ProtectedRoute role="buyer"><BuyerOrders /></ProtectedRoute>} />
//           <Route path="/wishlist"             element={<ProtectedRoute role="buyer"><Wishlist /></ProtectedRoute>} />
//           <Route path="/chat"                 element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
//           <Route path="/chat/:chatId"         element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
//           <Route path="/support"              element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
//           <Route path="/support/:id"          element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes></>} />
//         <Route path="/admin/login" element={<AdminLogin />} />
//         <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
//           <Route index element={<Navigate to="dashboard" replace />} />
//           <Route path="dashboard"     element={<AdminDashboard />} />
//           <Route path="users"         element={<AdminUsers />} />
//           <Route path="products"      element={<AdminProducts />} />
//           <Route path="orders"        element={<AdminOrders />} />
//           <Route path="subscriptions" element={<AdminSubscriptions />} />
//           <Route path="notify"        element={<AdminNotify />} />
//           <Route path="activity"      element={<AdminActivityLogs />} />
//           <Route path="support"       element={<AdminSupport />} />
//           <Route path="chats"         element={<AdminChats />} />
//         </Route>
//       </Routes>
//       <Toaster position="top-right" toastOptions={{ style:{ fontFamily:'DM Sans,sans-serif', borderRadius:'12px' }, success:{ iconTheme:{ primary:'#f97316', secondary:'white' } } }} />
//     </BrowserRouter>
//   );
// }

// export default function App() {
//   return <ThemeProvider><AuthProvider><AppRoutes /></AuthProvider></ThemeProvider>;
// }




import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import SellerAnalytics from './pages/SellerAnalytics';
import BuyerOrders from './pages/BuyerOrders';
import Subscriptions from './pages/Subscriptions';
import AddProduct from './pages/AddProduct';
import Wishlist from './pages/Wishlist';

import ChatList from './pages/chat/ChatList';
import ChatWindow from './pages/chat/ChatWindow';

import SupportTickets from './pages/support/SupportTickets';
import TicketDetail from './pages/support/TicketDetail';

import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminNotify from './pages/admin/AdminNotify';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import AdminSupport from './pages/admin/AdminSupport';
import AdminChats from './pages/admin/AdminChats';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    return (
      <Navigate
        to={user.role === 'seller' ? '/seller/dashboard' : '/products'}
        replace
      />
    );
  }

  return children;
};

const AdminRoute = ({ children }) => {
  if (!localStorage.getItem('adminToken')) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/*"
          element={
            <>
              <Navbar />

              <Routes>

                <Route path="/" element={<Home />} />

                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />

                <Route
                  path="/signup"
                  element={
                    <GuestRoute>
                      <Signup />
                    </GuestRoute>
                  }
                />

                <Route path="/products" element={<Products />} />

                <Route path="/products/:id" element={<ProductDetail />} />

                <Route
                  path="/seller/dashboard"
                  element={
                    <ProtectedRoute role="seller">
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/seller/products"
                  element={
                    <ProtectedRoute role="seller">
                      <SellerProducts />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/seller/products/add"
                  element={
                    <ProtectedRoute role="seller">
                      <AddProduct />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/seller/orders"
                  element={
                    <ProtectedRoute role="seller">
                      <SellerOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/seller/analytics"
                  element={
                    <ProtectedRoute role="seller">
                      <SellerAnalytics />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/seller/subscriptions"
                  element={
                    <ProtectedRoute role="seller">
                      <Subscriptions />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/buyer/dashboard"
                  element={
                    <ProtectedRoute role="buyer">
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/buyer/orders"
                  element={
                    <ProtectedRoute role="buyer">
                      <BuyerOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute role="buyer">
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatList />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/chat/:chatId"
                  element={
                    <ProtectedRoute>
                      <ChatWindow />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <SupportTickets />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/support/:id"
                  element={
                    <ProtectedRoute>
                      <TicketDetail />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >

          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="users" element={<AdminUsers />} />

          <Route path="products" element={<AdminProducts />} />

          <Route path="orders" element={<AdminOrders />} />

          <Route path="subscriptions" element={<AdminSubscriptions />} />

          <Route path="notify" element={<AdminNotify />} />

          <Route path="activity" element={<AdminActivityLogs />} />

          <Route path="support" element={<AdminSupport />} />

          <Route path="chats" element={<AdminChats />} />

        </Route>

      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans,sans-serif',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#f97316',
              secondary: 'white',
            },
          },
        }}
      />

    </BrowserRouter>
  );
}

export default function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}