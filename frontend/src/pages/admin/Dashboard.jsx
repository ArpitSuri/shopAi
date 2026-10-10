import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { formatPrice } from '../../utils/format';
import Spinner from '../../components/Spinner';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.stats().then((d) => setStats(d.stats)).catch(() => setStats({}));
  }, []);

  if (!stats) return <Spinner />;

  const cards = [
    { label: 'Revenue (excluding cancelled)', value: formatPrice(stats.revenue || 0), to: '/admin/orders' },
    { label: 'Pending orders', value: stats.pendingOrders ?? 0, to: '/admin/orders' },
    { label: 'Total orders', value: stats.orders ?? 0, to: '/admin/orders' },
    { label: 'Products', value: stats.products ?? 0, to: '/admin/products' },
    { label: 'Low stock (5 or fewer)', value: stats.lowStock ?? 0, to: '/admin/products' },
    { label: 'Categories', value: stats.categories ?? 0, to: '/admin/categories' },
    { label: 'Customers', value: stats.customers ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const body = (
            <>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-2 text-2xl font-semibold">{c.value}</p>
            </>
          );
          return c.to ? (
            <Link key={c.label} to={c.to} className="card p-5 hover:border-slate-300">
              {body}
            </Link>
          ) : (
            <div key={c.label} className="card p-5">
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
