import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productApi } from '../../api/product.api';
import { categoryApi } from '../../api/category.api';
import { getErrorMessage } from '../../api/http';
import useDebounce from '../../hooks/useDebounce';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';

export default function Home() {
  const [filters, setFilters] = useState({ search: '', category: '', sort: 'newest', page: 1 });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const search = useDebounce(filters.search);

  // Changing any filter returns to page 1
  const setFilter = (patch) => setFilters((f) => ({ ...f, page: 1, ...patch }));

  useEffect(() => {
    categoryApi.list().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi
      .list({ search, category: filters.category || undefined, sort: filters.sort, page: filters.page, limit: 12 })
      .then((d) => {
        setProducts(d.products);
        setPagination(d.pagination);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, filters.category, filters.sort, filters.page]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Shop all products</h1>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Search products"
          aria-label="Search products"
          value={filters.search}
          onChange={(e) => setFilter({ search: e.target.value })}
        />
        <select className="input sm:w-48" aria-label="Sort" value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value })}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[{ _id: '', name: 'All' }, ...categories].map((c) => (
          <button
            key={c._id}
            onClick={() => setFilter({ category: c._id })}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              filters.category === c._id
                ? 'border-brand-700 bg-brand-700 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" text="Try a different search or pick another category." />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} onChange={(page) => setFilters((f) => ({ ...f, page }))} />
      </div>
    </div>
  );
}
