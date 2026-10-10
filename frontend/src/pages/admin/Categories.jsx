import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryApi } from '../../api/category.api';
import { getErrorMessage } from '../../api/http';
import FormField from '../../components/FormField';
import Spinner from '../../components/Spinner';

const empty = { name: '', description: '', isActive: true };

export default function Categories() {
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    categoryApi
      .adminList()
      .then((d) => setCategories(d.categories))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);
  useEffect(load, [load]);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await categoryApi.update(editingId, form);
      else await categoryApi.create(form);
      toast.success(editingId ? 'Category updated' : 'Category added');
      reset();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, description: c.description || '', isActive: c.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await categoryApi.remove(c._id);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Categories</h1>

      <form onSubmit={onSubmit} className="card mt-6 grid gap-4 p-5 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
        <FormField label="Name" name="name" value={form.name} onChange={onChange} required minLength={2} />
        <FormField label="Description (optional)" name="description" value={form.description} onChange={onChange} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} className="h-4 w-4 accent-brand-700" />
            Visible
          </label>
          <button className="btn btn-primary" disabled={saving}>
            {editingId ? 'Save' : 'Add'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6">
        {!categories ? (
          <Spinner />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="border-b border-slate-200 bg-stone-50">
                <tr>
                  <th className="th">Name</th>
                  <th className="th">Products</th>
                  <th className="th">Status</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 && (
                  <tr>
                    <td className="td text-slate-500" colSpan={4}>
                      No categories yet. Add one above.
                    </td>
                  </tr>
                )}
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td className="td">
                      <p className="font-medium">{c.name}</p>
                      {c.description && <p className="text-xs text-slate-500">{c.description}</p>}
                    </td>
                    <td className="td">{c.productCount}</td>
                    <td className="td">{c.isActive ? 'Visible' : <span className="text-slate-400">Hidden</span>}</td>
                    <td className="td whitespace-nowrap text-right">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(c)}>
                        Edit
                      </button>
                      <button className="btn btn-sm ml-2 text-red-600 hover:bg-red-50" onClick={() => remove(c)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
