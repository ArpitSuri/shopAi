import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../../api/product.api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';
import SafeImage from '../../components/SafeImage';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setStatus('loading');
    productApi
      .get(id)
      .then((d) => {
        setProduct(d.product);
        setStatus('ready');
      })
      .catch(() => setStatus('missing'));
  }, [id]);

  if (status === 'loading') return <Spinner />;
  if (status === 'missing')
    return (
      <EmptyState title="Product not found" text="It may have been removed.">
        <Link to="/" className="btn btn-primary">
          Back to shop
        </Link>
      </EmptyState>
    );

  const soldOut = product.stock === 0;

  const handleAdd = async () => {
    if (!user) return navigate('/login', { state: { from: `/products/${id}` } });
    await addItem(product._id, qty);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="card overflow-hidden">
        <SafeImage src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
      </div>

      <div>
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← All products
        </Link>
        <p className="mt-4 text-sm text-slate-500">{product.category?.name}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-2xl font-semibold">{formatPrice(product.price)}</p>
        <p className="mt-4 max-w-prose whitespace-pre-line text-slate-600">{product.description || 'No description yet.'}</p>

        <p className={`mt-4 text-sm font-medium ${soldOut ? 'text-red-600' : product.stock <= 5 ? 'text-amber-700' : 'text-emerald-700'}`}>
          {soldOut ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
        </p>

        {!soldOut && (
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-300 bg-white">
              <button className="px-3 py-2 text-lg" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button className="px-3 py-2 text-lg" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>
                +
              </button>
            </div>
            <button className="btn btn-primary px-6" onClick={handleAdd}>
              Add to cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
