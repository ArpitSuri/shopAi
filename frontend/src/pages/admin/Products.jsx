import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productApi } from '../../api/product.api';
import { categoryApi } from '../../api/category.api';
import { getErrorMessage } from '../../api/http';
import { formatPrice } from '../../utils/format';
import useDebounce from '../../hooks/useDebounce';
import Modal from '../../components/Modal';
import ProductForm from '../../components/ProductForm';
import SafeImage from '../../components/SafeImage';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const search = useDebounce(searchText);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    productApi
      .adminList({ page, search, limit: 10 })
      .then((d) => {
        setProducts(d.products);
        setPagination(d.pagination);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(load, [load]);
  useEffect(() => {
    categoryApi.adminList().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  const save = async (data) => {
    setSaving(true);
    try {
      if (editing._id) await productApi.update(editing._id, data);
      else await productApi.create(data);
      toast.success(editing._id ? 'Product updated' : 'Product added');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This also removes it from customers' carts.`)) return;
    try {
      await productApi.remove(p._id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <button className="btn btn-primary" onClick={() => setEditing({})} disabled={!categories.length}>
          Add product
        </button>
      </div>
      {!categories.length && <p className="mt-2 text-sm text-amber-700">Create a category first, then you can add products.</p>}

      <input
        className="input mt-5 max-w-xs"
        placeholder="Search products"
        aria-label="Search products"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setPage(1);
        }}
      />

      <div className="mt-4">
        {loading ? (
          <Spinner />
        ) : !products.length ? (
          <EmptyState title="No products" text="Add your first product to start selling." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-slate-200 bg-stone-50">
                <tr>
                  <th className="th">Product</th>
                  <th className="th">Category</th>
                  <th className="th">Price</th>
                  <th className="th">Stock</th>
                  <th className="th">Status</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id}>
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <SafeImage src={p.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="td text-slate-600">{p.category?.name}</td>
                    <td className="td">{formatPrice(p.price)}</td>
                    <td className={`td ${p.stock <= 5 ? 'font-medium text-red-600' : ''}`}>{p.stock}</td>
                    <td className="td">{p.isActive ? 'Visible' : <span className="text-slate-400">Hidden</span>}</td>
                    <td className="td whitespace-nowrap text-right">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>
                        Edit
                      </button>
                      <button className="btn btn-sm ml-2 text-red-600 hover:bg-red-50" onClick={() => remove(p)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
      </div>

      {editing && (
        <Modal title={editing._id ? 'Edit product' : 'Add product'} onClose={() => setEditing(null)}>
          <ProductForm
            initial={editing._id ? editing : null}
            categories={categories}
            submitting={saving}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
