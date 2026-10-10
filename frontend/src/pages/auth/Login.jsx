import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/http';
import { homeFor, ROLES } from '../../utils/constants';
import AuthCard from '../../components/AuthCard';
import FormField from '../../components/FormField';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(form);
      // Admins always land on the dashboard; customers return to where they came from
      const target = user.role === ROLES.ADMIN ? homeFor(user.role) : location.state?.from || homeFor(user.role);
      navigate(target, { replace: true });
    } catch (err) {
      if (err.response?.data?.code === 'NOT_VERIFIED') {
        // Account exists but was never verified: make a new code and go to the verify page
        const data = await authApi.resendOtp(form.email).catch(() => ({}));
        toast(getErrorMessage(err));
        return navigate('/verify-otp', { state: { email: form.email, devOtp: data.devOtp } });
      }
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to see your cart and orders."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-brand-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Email" type="email" name="email" value={form.email} onChange={onChange} required autoComplete="email" />
        <FormField label="Password" type="password" name="password" value={form.password} onChange={onChange} required autoComplete="current-password" />
        <button className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthCard>
  );
}
