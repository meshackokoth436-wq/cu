import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import {
  fetchCurrentSession,
  refreshSession,
} from '@/features/auth/auth.api';

export function RequireAuth() {
  const location = useLocation();

  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const setPermissions = useAuthStore((s) => s.setPermissions);
  const setRoles = useAuthStore((s) => s.setRoles);
  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const logout = useAuthStore((s) => s.logout);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hasValidToken = Boolean(
      accessToken &&
        typeof accessToken === 'string' &&
        accessToken !== 'null' &&
        accessToken !== 'undefined' &&
        accessToken.trim().length > 0
    );

    const bootstrap = async () => {
      try {
        /*
         * If there is no access token, try the refresh-token
         * mechanism first.
         */
        if (!hasValidToken) {
          const refreshed = await refreshSession();

          if (!mounted) return;

          setTokens(refreshed.accessToken);
        }

        /*
         * Always verify the current backend session.
         */
        const session = await fetchCurrentSession();

        if (!mounted) return;

        if (session.user || (session as any).email) {
          setUser((session.user || session) as any);
        }

        setPermissions(
          Array.isArray(session.permissions)
            ? (session.permissions as string[])
            : []
        );

        setRoles(
          Array.isArray(session.roles)
            ? (session.roles as Parameters<typeof setRoles>[0])
            : []
        );
      } catch {
        if (!mounted) return;

        logout();
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [
    accessToken,
    setPermissions,
    setRoles,
    setTokens,
    setUser,
    logout,
  ]);

  /*
   * While the authentication state is being restored,
   * show a proper loading screen instead of a blank page.
   */
  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f7f5] px-4">
        <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-white bg-white p-8 text-center shadow-2xl">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#006633]/10">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#006633]/20 border-t-[#006633]" />
          </div>

          <h1 className="text-lg font-black text-slate-900">
            Securing your session
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please wait while we verify your TUMCU account.
          </p>
        </div>
      </div>
    );
  }

  /*
   * IMPORTANT:
   * The previous version referenced `isAuthenticated` without
   * obtaining it from the Zustand store. That caused the Gallery
   * page and other protected routes to crash.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  const user = useAuthStore.getState().user;
  const isSuperAdmin = useAuthStore.getState().isSuperAdmin();

  const membershipType =
    (user as any)?.membership_type || 'full';

  const isAssociateOrGlobal =
    membershipType === 'associate' ||
    membershipType === 'special';

  const hasIdentifier = Boolean(
    user?.admission_number ||
      (user as any)?.membership_number ||
      isAssociateOrGlobal
  );

  const isMissingInfo =
    !hasIdentifier ||
    !(user as any)?.declaration_accepted;

  /*
   * Members who have not completed their required information
   * are sent to the personal-information page.
   */
  if (isMissingInfo && !isSuperAdmin) {
    return (
      <Navigate
        to="/personal-information"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}