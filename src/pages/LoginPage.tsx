import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Home,
  LockKeyhole,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  UserRound,
} from 'lucide-react';

import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import {
  fetchCurrentSession,
  login,
} from '@/features/auth/auth.api';
import { useAuthStore } from '@/store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const setSession = useAuthStore((s) => s.setSession);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const setRoles = useAuthStore((s) => s.setRoles);

  const sessionExpired =
    new URLSearchParams(location.search).get('session') === 'expired';

  const justRegistered = Boolean(
    (location.state as { justRegistered?: boolean } | null)
      ?.justRegistered
  );

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: login,

    onSuccess: async (result) => {
      setSession(result.accessToken, result.user as never);

      try {
        const session = await fetchCurrentSession();

        setPermissions(
          Array.isArray(session.permissions)
            ? (session.permissions as string[])
            : []
        );

        setRoles(
          Array.isArray(session.roles)
            ? (session.roles as never)
            : []
        );
      } catch {
        // The backend session is still valid.
        // The dashboard can rehydrate the session later.
      }

      navigate('/dashboard', { replace: true });
    },

    onError: (err: unknown) => {
      const message =
        (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        )?.response?.data?.message ||
        'We could not sign you in. Please check your details and try again.';

      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);

    mutation.mutate({
      identifier: identifier.trim(),
      password,
    });
  };

  return (
    <main className="auth-photo-bg min-h-[calc(100vh-80px)] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Top navigation */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="auth-top-link"
          >
            <ArrowLeft size={17} />
            <Home size={17} />
            <span>Back to Home</span>
          </Link>

          <div className="auth-security-badge">
            <ShieldCheck size={17} />
            <span>Secure TUMCU account</span>
          </div>
        </div>

        {/* Login area */}
        <div className="flex justify-center">
          <section
            className="auth-login-card w-full max-w-[520px]"
            aria-labelledby="login-title"
          >
            {/* Header */}
            <div className="text-center">
              <div className="auth-lock-icon mx-auto">
                <LockKeyhole size={25} strokeWidth={2.2} />
              </div>

              <p className="auth-kicker">
                TUMCU MEMBER PORTAL
              </p>

              <h1
                id="login-title"
                className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
              >
                Welcome back
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 sm:text-base">
                Sign in to access your TUMCU account, dashboard and
                member services.
              </p>
            </div>

            {/* Status messages */}
            {sessionExpired && (
              <div className="auth-message auth-message-warning mt-6">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-bold">
                    Your session has ended
                  </p>

                  <p className="mt-0.5">
                    Please sign in again to continue.
                  </p>
                </div>
              </div>
            )}

            {justRegistered && (
              <div className="auth-message auth-message-success mt-6">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-bold">
                    Registration received
                  </p>

                  <p className="mt-0.5">
                    Your membership application is waiting for
                    administrator approval.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              className="mt-7 space-y-5"
              onSubmit={handleSubmit}
              noValidate={false}
            >
              {/* Identifier */}
              <div>
                <Input
                  label="Email, admission number, or phone"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. yourname@email.com"
                  required
                  autoComplete="username"
                  className="auth-input"
                />

                <p className="auth-input-help">
                  Use the email, admission number, or phone number
                  registered on your TUMCU account.
                </p>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="auth-input pr-12"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="auth-password-toggle"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    title={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <p className="auth-input-help">
                  Keep your password private. Do not share it with
                  anyone.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="auth-message auth-message-error"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-bold">
                      Sign-in unsuccessful
                    </p>

                    <p className="mt-0.5">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                loading={mutation.isPending}
                disabled={!identifier.trim() || !password}
                className="auth-sign-in-button w-full"
                size="lg"
              >
                {mutation.isPending
                  ? 'Signing in...'
                  : 'Sign In'}
              </Button>
            </form>

            {/* Account information */}
            <div className="auth-info-card mt-7">
              <div className="flex items-start gap-3">
                <div className="auth-info-icon">
                  <UserRound size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-black text-slate-950">
                    New to TUMCU?
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Register for membership first. New
                    registrations remain pending until an
                    authorised administrator approves the
                    application.
                  </p>

                  <Link
                    to="/register"
                    className="mt-3 inline-flex items-center font-bold text-sm text-emerald-800 hover:text-emerald-950 hover:underline"
                  >
                    Register for Membership
                    <ArrowLeft
                      size={15}
                      className="ml-1 rotate-180"
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Security footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] font-medium text-slate-500">
              <ShieldCheck
                size={14}
                className="text-emerald-700"
              />

              <span>
                Your account is protected by the TECUMP
                authentication system.
              </span>
            </div>
          </section>
        </div>

        {/* Bottom navigation */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-white/90 hover:text-white hover:underline drop-shadow-md"
          >
            ← Return to the TUMCU home page
          </Link>
        </div>
      </div>
    </main>
  );
}