import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/http';
import { homeFor } from '../../utils/constants';
import AuthCard from '../../components/AuthCard';

const RESEND_SECONDS = 30;

export default function VerifyOtp() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { email, devOtp: initialOtp } = useLocation().state || {};
  const [demoOtp, setDemoOtp] = useState(initialOtp || '');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Opened directly without an email -> back to signup
  if (!email) return <Navigate to="/signup" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await verifyOtp(email, otp);
      toast.success('Verified. Welcome!');
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setOtp('');
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    try {
      const data = await authApi.resendOtp(email);
      setDemoOtp(data.devOtp || '');
      toast.success('New code generated');
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthCard
      title="Verify your account"
      subtitle={`Enter the 6-digit code for ${email}.`}
      footer={
        <Link to="/signup" className="font-medium text-brand-700 hover:underline">
          Use a different email
        </Link>
      }
    >
      {demoOtp && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p>Email sending is off, so your code is shown here:</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xl font-bold tracking-[0.3em]">{demoOtp}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setOtp(demoOtp)}>
              Fill it in
            </button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="input text-center text-2xl font-semibold tracking-[0.5em]"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          aria-label="Verification code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />
        <button className="btn btn-primary w-full" disabled={submitting || otp.length !== 6}>
          {submitting ? 'Verifying…' : 'Verify and continue'}
        </button>
        <button type="button" onClick={onResend} disabled={cooldown > 0} className="btn btn-outline w-full">
          {cooldown > 0 ? `New code in ${cooldown}s` : 'Get a new code'}
        </button>
      </form>
    </AuthCard>
  );
}
