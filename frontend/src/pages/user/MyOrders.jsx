import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/order.api';
import { getErrorMessage } from '../../api/http';
import { formatDate, formatPrice } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import SafeImage from '../../components/SafeImage';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';

export default function MyOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    orderApi
      .mine()
      .then((d) => setOrders(d.orders))
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setOrders([]);
      });
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const { order } = await orderApi.cancel(id);
      setOrders((list) => list.map((o) => (o._id === id ? order : o)));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!orders) return <Spinner />;
  if (!orders.length)
    return (
      <EmptyState title="No orders yet" text="Once you place an order, you can track it here.">
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </EmptyState>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">My orders</h1>
      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <article key={o._id} className="card overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-stone-50 px-5 py-3 text-sm">
              <div>
                <span className="font-medium">Order #{o._id.slice(-6).toUpperCase()}</span>
                <span className="ml-3 text-slate-500">{formatDate(o.createdAt)}</span>
              </div>
              <StatusBadge status={o.status} />
            </header>

            <ul className="divide-y divide-slate-100 px-5">
              {o.items.map((i) => (
                <li key={i.product} className="flex items-center gap-3 py-3">
                  <SafeImage src={i.image} alt={i.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-slate-500">
                      {i.quantity} × {formatPrice(i.price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
              <span className="text-slate-500">
                Deliver to {o.shippingAddress.city} · Total <strong className="text-slate-900">{formatPrice(o.totalPrice)}</strong>
              </span>
              {o.status === 'pending' && (
                <button className="btn btn-outline btn-sm" onClick={() => cancel(o._id)}>
                  Cancel order
                </button>
              )}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
