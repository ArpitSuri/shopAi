import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { getErrorMessage } from '../../api/http';
import AuthCard from '../../components/AuthCard';
import FormField from '../../components/FormField';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 6) next.password = 'Use at least 6 characters';
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const { confirm, ...payload } = form;
      const data = await authApi.signup(payload);
      navigate('/verify-otp', { state: { email: data.email, devOtp: data.devOtp } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="You'll confirm your account with a 6-digit code."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Full name" name="name" value={form.name} onChange={onChange} required minLength={2} autoComplete="name" />
        <FormField label="Email" type="email" name="email" value={form.email} onChange={onChange} required autoComplete="email" />
        <FormField label="Password" type="password" name="password" value={form.password} onChange={onChange} error={errors.password} required autoComplete="new-password" />
        <FormField label="Confirm password" type="password" name="confirm" value={form.confirm} onChange={onChange} error={errors.confirm} required autoComplete="new-password" />
        <button className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}
