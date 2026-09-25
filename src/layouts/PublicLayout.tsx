import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import tumcuLogo from '@/assets/tumcu-logo.png';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { ThemeToggle } from '@/components/ThemeToggle';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/ministries', label: 'Ministries' },
  { to: '/events', label: 'Events' },
  { to: '/library', label: 'Library' },
  { to: '/e-teams', label: 'E-Teams' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/download', label: 'Download App' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-slate-950">
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 lg:px-7">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between rounded-[24px] border border-white/80 bg-white/85 px-3 py-2.5 shadow-[0_16px_55px_rgba(3,60,31,.12)] backdrop-blur-2xl sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1.5">
            <img src={tumcuLogo} alt="TUMCU Christian Union" className="h-11 w-11 rounded-full object-contain" />
            <span className="leading-none"><span className="block text-sm font-black tracking-wide text-emerald-950">TUMCU</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.18em] text-slate-500">Christian Union</span></span>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return <Link key={link.to} to={link.to} className={`rounded-full px-3 py-2 text-xs font-extrabold transition ${active ? 'bg-emerald-800 text-white shadow-md' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'}`}>{link.label}</Link>;
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <PWAInstallButton variant="pill" className="hidden sm:inline-flex" />
            {isAuthenticated ? <Link to="/dashboard" className="hidden items-center gap-1 rounded-full bg-emerald-800 px-4 py-2.5 text-xs font-black text-white md:inline-flex">Dashboard <ArrowUpRight size={14} /></Link> : <div className="hidden items-center gap-2 md:flex"><Link to="/login" className="rounded-full px-3 py-2.5 text-xs font-black text-emerald-800 hover:bg-emerald-50">Login</Link><Link to="/register" className="rounded-full bg-emerald-800 px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-900">Join TUMCU</Link></div>}
            <button type="button" onClick={() => setMenuOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-900 xl:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </nav>

        {menuOpen && <div className="mx-auto mt-2 max-w-[1440px] rounded-[24px] border border-white bg-white/95 p-3 shadow-2xl backdrop-blur-2xl xl:hidden"><div className="grid gap-1 sm:grid-cols-2">{navLinks.map((link) => <Link key={link.to} to={link.to} className={`rounded-2xl px-4 py-3 text-sm font-extrabold ${location.pathname === link.to ? 'bg-emerald-800 text-white' : 'text-slate-700 hover:bg-emerald-50'}`}>{link.label}</Link>)}</div><div className="mt-3 border-t border-slate-100 pt-3">{isAuthenticated ? <Link to="/dashboard" className="block rounded-2xl bg-emerald-800 px-4 py-3 text-center text-sm font-black text-white">Open dashboard</Link> : <div className="grid grid-cols-2 gap-2"><Link to="/login" className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-black text-emerald-800">Login</Link><Link to="/register" className="rounded-2xl bg-emerald-800 px-4 py-3 text-center text-sm font-black text-white">Join TUMCU</Link></div>}</div></div>}
      </header>

      <main><Outlet /></main>

      <footer className="mt-10 bg-[#032d1a] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:px-10">
          <div><div className="flex items-center gap-3"><img src={tumcuLogo} alt="TUMCU" className="h-12 w-12 rounded-full bg-white p-1" /><div><div className="font-black">TUMCU</div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-white/50">Christian Union</div></div></div><p className="mt-5 max-w-md text-sm leading-7 text-white/60">A Christ-centred university community committed to prayer, the Word, fellowship, service and mission.</p></div>
          <div><h3 className="text-sm font-black">Explore</h3><div className="mt-4 space-y-3 text-sm text-white/60"><Link className="block hover:text-emerald-300" to="/about">About TUMCU</Link><Link className="block hover:text-emerald-300" to="/ministries">Ministries</Link><Link className="block hover:text-emerald-300" to="/events">Events</Link><Link className="block hover:text-emerald-300" to="/gallery">Gallery</Link></div></div>
          <div><h3 className="text-sm font-black">Connect</h3><div className="mt-4 space-y-3 text-sm text-white/60"><Link className="block hover:text-emerald-300" to="/register">Become a member</Link><Link className="block hover:text-emerald-300" to="/contact">Contact the Union</Link><a className="block text-emerald-300 hover:text-emerald-200" href="mailto:tumcunion@gmail.com">tumcunion@gmail.com</a></div></div>
        </div>
        <div className="border-t border-white/10"><div className="mx-auto max-w-[1440px] px-5 py-5 text-xs text-white/40 sm:px-8 lg:px-10">© {new Date().getFullYear()} Technical University of Mombasa Christian Union. All rights reserved.</div></div>
      </footer>
    </div>
  );
}
