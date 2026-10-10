import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';
import SafeImage from '../../components/SafeImage';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import OrderSummary from '../../components/OrderSummary';

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (!cart.items.length)
    return (
      <EmptyState title="Your cart is empty" text="Add something you like and it will show up here.">
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </EmptyState>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Your cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="card divide-y divide-slate-100">
          {cart.items.map(({ product, quantity, lineTotal }) => (
            <li key={product._id} className="flex gap-4 p-4">
              <SafeImage src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col">
                <Link to={`/products/${product._id}`} className="font-medium hover:text-brand-700">
                  {product.name}
                </Link>
                <span className="text-sm text-slate-500">{formatPrice(product.price)} each</span>
                {quantity > product.stock && <span className="text-xs text-red-600">Only {product.stock} left in stock</span>}

                <div className="mt-auto flex items-center gap-3 pt-2">
                  <div className="flex items-center rounded-lg border border-slate-300">
                    <button className="px-2.5 py-1 disabled:opacity-40" disabled={quantity <= 1} aria-label="Decrease quantity" onClick={() => updateItem(product._id, quantity - 1)}>
                      −
                    </button>
                    <span className="w-7 text-center text-sm">{quantity}</span>
                    <button className="px-2.5 py-1 disabled:opacity-40" disabled={quantity >= product.stock} aria-label="Increase quantity" onClick={() => updateItem(product._id, quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button className="text-sm text-red-600 hover:underline" onClick={() => removeItem(product._id)}>
                    Remove
                  </button>
                </div>
              </div>
              <span className="font-semibold">{formatPrice(lineTotal)}</span>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-5">
          <h2 className="font-semibold">Order summary</h2>
          <OrderSummary cart={cart} />
          <button className="btn btn-primary mt-5 w-full" onClick={() => navigate('/checkout')}>
            Continue to checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
