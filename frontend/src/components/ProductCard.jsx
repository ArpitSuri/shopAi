import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import SafeImage from './SafeImage';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const soldOut = product.stock === 0;

  const handleAdd = () => {
    if (!user) return navigate('/login', { state: { from: '/' } });
    addItem(product._id);
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      <Link to={`/products/${product._id}`} className="block aspect-square overflow-hidden bg-stone-100">
        <SafeImage src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-slate-500">{product.category?.name}</p>
        <Link to={`/products/${product._id}`} className="mt-0.5 font-medium leading-snug hover:text-brand-700">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {soldOut ? (
            <span className="text-xs font-medium text-red-600">Out of stock</span>
          ) : product.stock <= 5 ? (
            <span className="text-xs text-amber-700">Only {product.stock} left</span>
          ) : null}
        </div>
        <button className="btn btn-primary mt-3" disabled={soldOut} onClick={handleAdd}>
          Add to cart
        </button>
      </div>
    </div>
  );
}
