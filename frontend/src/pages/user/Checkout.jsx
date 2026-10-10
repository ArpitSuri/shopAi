import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/order.api';
import { getErrorMessage } from '../../api/http';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import FormField from '../../components/FormField';
import OrderSummary from '../../components/OrderSummary';
import Spinner from '../../components/Spinner';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, loading, resetCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: user.name, phone: '', address: '', city: '', postalCode: '' });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Spinner />;
  if (!cart.items.length) return <Navigate to="/cart" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await orderApi.create({ shippingAddress: form, paymentMethod: 'COD' });
      resetCart();
      toast.success('Order placed!');
      navigate('/orders');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/cart" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to cart
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card space-y-4 p-5">
          <h2 className="font-semibold">Delivery address</h2>
          <FormField label="Full name" name="fullName" value={form.fullName} onChange={onChange} required />
          <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={onChange} required />
          <FormField label="Address" name="address" value={form.address} onChange={onChange} required />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City" name="city" value={form.city} onChange={onChange} required />
            <FormField label="Postal code" name="postalCode" value={form.postalCode} onChange={onChange} required />
          </div>
          <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-slate-600">Payment: cash on delivery</p>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="font-semibold">Order summary</h2>
          <OrderSummary cart={cart} />
          <button className="btn btn-primary mt-5 w-full" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
