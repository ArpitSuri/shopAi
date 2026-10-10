import { Fragment, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/order.api';
import { getErrorMessage } from '../../api/http';
import { formatDate, formatPrice } from '../../utils/format';
import { ORDER_FLOW, ORDER_STATUSES } from '../../utils/constants';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    orderApi
      .adminList({ page, status: status || undefined })
      .then((d) => {
        setOrders(d.orders);
        setPagination(d.pagination);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, status]);
  useEffect(load, [load]);

  const changeStatus = async (id, next) => {
    if (!next) return;
    if (next === 'cancelled' && !window.confirm('Cancel this order? Stock will be returned.')) return;
    try {
      const { order } = await orderApi.updateStatus(id, next);
      setOrders((list) => list.map((o) => (o._id === id ? order : o)));
      toast.success(`Order marked as ${next}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <select
          className="input w-44"
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : !orders.length ? (
          <EmptyState title="No orders found" text="Orders will appear here when customers check out." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-slate-200 bg-stone-50">
                <tr>
                  <th className="th">Order</th>
                  <th className="th">Customer</th>
                  <th className="th">Date</th>
                  <th className="th">Total</th>
                  <th className="th">Status</th>
                  <th className="th">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <Fragment key={o._id}>
                    <tr>
                      <td className="td">
                        <button className="font-medium text-brand-700 hover:underline" onClick={() => setOpenId(openId === o._id ? null : o._id)}>
                          #{o._id.slice(-6).toUpperCase()}
                        </button>
                      </td>
                      <td className="td">
                        <p>{o.user?.name || 'Deleted user'}</p>
                        <p className="text-xs text-slate-500">{o.user?.email}</p>
                      </td>
                      <td className="td">{formatDate(o.createdAt)}</td>
                      <td className="td">{formatPrice(o.totalPrice)}</td>
                      <td className="td">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="td">
                        {ORDER_FLOW[o.status].length ? (
                          <select
                            className="input w-36 py-1"
                            aria-label="Change status"
                            value=""
                            onChange={(e) => changeStatus(o._id, e.target.value)}
                          >
                            <option value="">Change to…</option>
                            {ORDER_FLOW[o.status].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400">Final</span>
                        )}
                      </td>
                    </tr>
                    {openId === o._id && (
                      <tr className="bg-stone-50">
                        <td className="td" colSpan={6}>
                          <div className="grid gap-4 md:grid-cols-2">
                            <ul className="space-y-1 text-sm">
                              {o.items.map((i) => (
                                <li key={i.product} className="flex justify-between gap-4">
                                  <span>
                                    {i.name} × {i.quantity}
                                  </span>
                                  <span>{formatPrice(i.price * i.quantity)}</span>
                                </li>
                              ))}
                              <li className="flex justify-between border-t border-slate-200 pt-1 text-slate-500">
                                <span>Shipping</span>
                                <span>{o.shippingPrice ? formatPrice(o.shippingPrice) : 'Free'}</span>
                              </li>
                            </ul>
                            <address className="text-sm not-italic text-slate-600">
                              <p className="font-medium text-slate-800">{o.shippingAddress.fullName}</p>
                              <p>{o.shippingAddress.address}</p>
                              <p>
                                {o.shippingAddress.city} {o.shippingAddress.postalCode}
                              </p>
                              <p>{o.shippingAddress.phone}</p>
                            </address>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
      </div>
    </div>
  );
}
