import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/Spinner';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/products/wishlist')
      .then(r => setProducts(r.data.products || []))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Heart size={24} className="text-red-500 fill-red-500" />
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Wishlist</h1>
          <p className="text-gray-500 text-sm">{products.length} saved items</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card p-16 text-center">
          <Heart size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-gray-500 mb-2">Wishlist is empty</h3>
          <p className="text-gray-400 text-sm mb-6">Save products you love to find them here</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={16} /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
