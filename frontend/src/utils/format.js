export const formatPrice = (n = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23e7e5e4'/%3E%3Cpath d='M130 270l50-60 40 45 30-35 40 50z' fill='%23d6d3d1'/%3E%3Ccircle cx='160' cy='150' r='20' fill='%23d6d3d1'/%3E%3C/svg%3E";
