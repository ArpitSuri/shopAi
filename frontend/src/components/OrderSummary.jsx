import { formatPrice } from '../utils/format';

// Price breakdown shared by the cart and checkout pages
export default function OrderSummary({ cart }) {
  return (
    <dl className="mt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-slate-500">Subtotal ({cart.totalItems} items)</dt>
        <dd>{formatPrice(cart.subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-slate-500">Shipping</dt>
        <dd>{cart.shippingPrice === 0 ? 'Free' : formatPrice(cart.shippingPrice)}</dd>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd>{formatPrice(cart.totalPrice)}</dd>
      </div>
    </dl>
  );
}
