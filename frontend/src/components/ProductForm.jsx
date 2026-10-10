import { useState } from 'react';
import FormField from './FormField';

const empty = { name: '', description: '', price: '', stock: '', image: '', category: '', isActive: true };

export default function ProductForm({ initial, categories, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial ? { ...empty, ...initial, category: initial.category?._id || initial.category || '' } : empty
  );

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image,
      category: form.category,
      isActive: form.isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Name" name="name" value={form.name} onChange={onChange} required minLength={2} />
      <FormField label="Description" as="textarea" rows={3} name="description" value={form.description} onChange={onChange} />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Price (₹)" type="number" min="0" step="0.01" name="price" value={form.price} onChange={onChange} required />
        <FormField label="Stock" type="number" min="0" step="1" name="stock" value={form.stock} onChange={onChange} required />
      </div>
      <FormField label="Image URL" type="url" name="image" placeholder="https://…" value={form.image} onChange={onChange} />
      <FormField label="Category" as="select" name="category" value={form.category} onChange={onChange} required>
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} className="h-4 w-4 accent-brand-700" />
        Visible in the shop
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  );
}
