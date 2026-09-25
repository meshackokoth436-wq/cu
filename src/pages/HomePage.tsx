import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Download,
  Heart,
  Home,
  Image as ImageIcon,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Users,
  X,
} from 'lucide-react';
import { fetchLandingMedia } from '@/features/landing-media/landing-media.api';
import { fetchPublicEvents, formatEventDate, EVENT_TYPE_LABELS } from '@/features/events/events.api';
import { fetchGalleryAlbums } from '@/features/gallery/gallery.api';
import { fetchTodayScripture, type DailyScripture } from '@/features/daily-scriptures/daily-scriptures.api';
import { useAuthStore } from '@/store/auth.store';
import tumcuLogo from '@/assets/tumcu-logo.png';
import tumGateImage from '@/assets/tum-gate-monument.jpg';
import photo1 from '@/assets/community/community-1.jpg';
import photo2 from '@/assets/community/community-2.jpg';
import photo3 from '@/assets/community/community-3.jpg';
import photo4 from '@/assets/community/community-4.jpg';
import photo5 from '@/assets/community/community-5.jpg';

const ministryCards = [
  { title: 'Worship', text: 'Lift high His name.', image: photo1, to: '/ministries' },
  { title: 'Fellowship', text: 'Build real relationships.', image: photo2, to: '/ministries' },
  { title: 'Discipleship', text: 'Grow in His Word.', image: photo3, to: '/ministries' },
  { title: 'Evangelism', text: 'Share the good news.', image: photo5, to: '/ministries' },
  { title: 'Leadership', text: 'Serve & make a difference.', image: photo4, to: '/elections' },
];

const quickActions = [
  { label: 'Register for Events', icon: CalendarDays, to: '/events' },
  { label: 'Join a Ministry', icon: Users, to: '/ministries' },
  { label: 'Download App', icon: Download, to: '/download' },
  { label: 'Contact Us', icon: Mail, to: '/contact' },
];

function EventDate({ value }: { value: string }) {
  const date = new Date(value);
  return (
    <div className="tumcu-event-date">
      <span>{date.toLocaleDateString('en-KE', { weekday: 'short' }).toUpperCase()}</span>
      <strong>{date.getDate()}</strong>
      <span>{date.toLocaleDateString('en-KE', { month: 'short' }).toUpperCase()}</span>
    </div>
  );
}

export function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const { data: media } = useQuery({
    queryKey: ['landing-media'],
    queryFn: fetchLandingMedia,
    staleTime: 30_000,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['home-public-events'],
    queryFn: fetchPublicEvents,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: albums = [] } = useQuery({
    queryKey: ['home-gallery-albums'],
    queryFn: () => fetchGalleryAlbums({ category: 'all', include_unpublished: false }),
    staleTime: 60_000,
    enabled: isAuthenticated,
  });

  const { data: scripture } = useQuery<DailyScripture | null>({
    queryKey: ['daily-scripture-today'],
    queryFn: fetchTodayScripture,
    staleTime: 60_000,
  });

  const heroSlides = useMemo(() => {
    const managed = media?.backdropSlides?.filter((x) => x.active).sort((a, b) => a.order - b.order) ?? [];
    if (managed.length) return managed;
    return [
      { id: 'gate', src: media?.backgroundImage?.src || tumGateImage, title: 'TUM Main Campus' },
      { id: 'community', src: photo2, title: 'Community in Christ' },
      { id: 'worship', src: photo1, title: 'Worship & Fellowship' },
      { id: 'word', src: photo3, title: 'The Word' },
    ];
  }, [media]);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = window.setInterval(() => setHeroIndex((i) => (i + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((e) => new Date(e.start_at).getTime() >= now)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
      .slice(0, 4);
  }, [events]);

  const latestEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
      .slice(0, 3);
  }, [events]);

  const latestGallery = albums.slice(0, 4);

  return (
    <div className="tumcu-home-shell">
      {/* Desktop sidebar */}
      <aside className="tumcu-home-sidebar">
        <div>
          <Link to="/" className="tumcu-side-brand">
            <img src={tumcuLogo} alt="TUMCU" />
            <span><strong>TUMCU</strong><small>CHRISTIAN UNION</small></span>
          </Link>
          <nav className="tumcu-side-nav">
            <Link className="active" to="/"><Home size={19} /> Home</Link>
            <Link to="/about"><Users size={19} /> About Us</Link>
            <Link to="/ministries"><Users size={19} /> Ministries</Link>
            <Link to="/events"><CalendarDays size={19} /> Events</Link>
            <Link to="/gallery"><ImageIcon size={19} /> Gallery</Link>
            <Link to="/download"><Download size={19} /> Download App</Link>
            <Link to="/contact"><Mail size={19} /> Contact</Link>
          </nav>
        </div>
        <div className="tumcu-sidebar-bottom">
          <p>“Together in Christ,<br />for greater impact.”</p>
          <div className="tumcu-sidebar-line" />
          <div className="tumcu-socials"><span>f</span><span>◎</span><span>▶</span><span>𝕏</span></div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="tumcu-mobile-header">
        <Link to="/" className="tumcu-side-brand"><img src={tumcuLogo} alt="TUMCU" /><span><strong>TUMCU</strong><small>CHRISTIAN UNION</small></span></Link>
        <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">{menuOpen ? <X /> : <Menu />}</button>
      </header>
      {menuOpen && (
        <div className="tumcu-mobile-menu">
          {[
            ['Home', '/'], ['About Us', '/about'], ['Ministries', '/ministries'], ['Events', '/events'], ['Gallery', '/gallery'], ['Download App', '/download'], ['Contact', '/contact'],
          ].map(([label, to]) => <Link key={to} to={to} onClick={() => setMenuOpen(false)}>{label}<ChevronRight size={17} /></Link>)}
          {!isAuthenticated && <div className="tumcu-mobile-auth"><Link to="/login">Login</Link><Link to="/register">Register</Link></div>}
        </div>
      )}

      <main className="tumcu-home-main">
        <div className="tumcu-home-topbar">
          <div className="tumcu-search"><span>⌕</span> Search for events, ministries, or anything...</div>
          <div className="tumcu-user-tools"><Bell size={19} /><span className="tumcu-user-dot" />{isAuthenticated ? <Link to="/dashboard">Dashboard</Link> : <><Link to="/login">Login</Link><Link className="filled" to="/register">Register</Link></>}</div>
        </div>

        <div className="tumcu-dashboard-grid">
          <section>
            {/* Hero */}
            <div className="tumcu-dashboard-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,62,38,.95) 0%, rgba(0,62,38,.82) 40%, rgba(0,62,38,.18) 100%), url(${heroSlides[heroIndex]?.src})` }}>
              <div className="tumcu-hero-copy">
                <span className="tumcu-kicker">WELCOME TO TUMCU</span>
                <h1>Technical University<br />of Mombasa<br /><span>Christian Union</span></h1>
                <p>A Christ-centered community where students discover purpose, grow in faith, and make an impact for Christ.</p>
                <div className="tumcu-hero-actions"><Link to="/register" className="tumcu-btn green">Join the Community <ArrowRight size={16} /></Link><Link to="/ministries" className="tumcu-btn ghost">Explore Ministries</Link></div>
              </div>
              <div className="tumcu-hero-dots">{heroSlides.map((s, i) => <button key={s.id} className={i === heroIndex ? 'active' : ''} onClick={() => setHeroIndex(i)} aria-label={`Hero ${i + 1}`} />)}</div>
            </div>

            {/* Stats */}
            <div className="tumcu-stats-row">
              <div><span className="stat-icon"><Users /></span><strong>102+</strong><small>Active Members</small></div>
              <div><span className="stat-icon"><Heart /></span><strong>247</strong><small>Weekly Attendance</small></div>
              <div><span className="stat-icon"><BookOpen /></span><strong>100%</strong><small>Word-Centred</small></div>
              <div><span className="stat-icon"><Users /></span><strong>500+</strong><small>Students & Members</small></div>
            </div>

            {/* Ministries */}
            <section className="tumcu-panel">
              <div className="tumcu-section-heading"><div><h2><span>◉</span> Featured Ministries</h2></div><Link to="/ministries">View All <ArrowRight size={14} /></Link></div>
              <div className="tumcu-ministry-grid">
                {ministryCards.map((m) => <Link to={m.to} key={m.title} className="tumcu-ministry-card"><img src={m.image} alt={m.title} /><div><strong>{m.title}</strong><span>{m.text}</span></div><ChevronRight size={16} /></Link>)}
              </div>
            </section>

            {/* Gallery */}
            <section className="tumcu-panel">
              <div className="tumcu-section-heading"><h2><span>▣</span> Our Latest Gallery</h2><Link to="/gallery">View Gallery <ArrowRight size={14} /></Link></div>
              <div className="tumcu-latest-gallery">
                {(latestGallery.length ? latestGallery : [
                  { id: 'p1', title: 'Worship', cover_image_url: photo1 }, { id: 'p2', title: 'Fellowship', cover_image_url: photo2 }, { id: 'p3', title: 'Ministries', cover_image_url: photo3 }, { id: 'p4', title: 'Campus Life', cover_image_url: photo4 },
                ]).map((g: any) => <Link to="/gallery" key={g.id} className="tumcu-gallery-thumb"><img src={g.cover_image_url} alt={g.title} /><span>{g.title}</span></Link>)}
              </div>
            </section>

            {scripture && <section className="tumcu-scripture"><div><span>DAILY SCRIPTURE</span><blockquote>“{scripture.text}”</blockquote><strong>— {scripture.reference}</strong></div><BookOpen size={48} /></section>}
          </section>

          {/* Right rail */}
          <aside className="tumcu-home-rail">
            <section className="tumcu-rail-card">
              <div className="tumcu-section-heading"><h2><CalendarDays size={19} /> Upcoming Events</h2><Link to="/events">View All</Link></div>
              <div className="tumcu-upcoming-list">
                {eventsLoading ? <p className="tumcu-muted">Loading events…</p> : upcoming.length ? upcoming.map((event) => <Link to="/events" className="tumcu-upcoming-item" key={event.id}><EventDate value={event.start_at} /><div className="tumcu-event-thumb"><img src={event.category?.toLowerCase().includes('worship') ? photo1 : photo2} alt="" /></div><div className="tumcu-event-info"><strong>{event.title}</strong><small><Clock3 size={11} /> {new Date(event.start_at).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' })}</small><small><MapPin size={11} /> {event.location || 'TUMCU Main Campus'}</small></div><ChevronRight size={16} /></Link>) : <p className="tumcu-muted">No upcoming events right now.</p>}
              </div>
              <Link to="/events" className="tumcu-outline-action">View Full Calendar <ArrowRight size={15} /></Link>
            </section>

            <section className="tumcu-rail-card">
              <div className="tumcu-section-heading"><h2><MessageCircle size={19} /> Quick Actions</h2></div>
              <div className="tumcu-quick-grid">{quickActions.map((a) => <Link to={a.to} key={a.label}><span><a.icon size={18} /></span>{a.label}</Link>)}</div>
            </section>

            <section className="tumcu-rail-card">
              <div className="tumcu-section-heading"><h2><Bell size={19} /> Recent Events</h2><Link to="/events">View All</Link></div>
              {latestEvents.length ? latestEvents.map((e) => <Link to="/events" key={e.id} className="tumcu-news-item"><img src={photo5} alt="" /><div><strong>{e.title}</strong><span>{EVENT_TYPE_LABELS[e.event_type] || 'Event'} • {formatEventDate(e.start_at)}</span></div></Link>) : <p className="tumcu-muted">Events will appear here after publication.</p>}
            </section>
          </aside>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="tumcu-mobile-bottom"><Link className="active" to="/"><Home size={18} />Home</Link><Link to="/ministries"><Users size={18} />Ministries</Link><Link to="/events"><CalendarDays size={18} />Events</Link><Link to="/gallery"><ImageIcon size={18} />Gallery</Link><Link to="/more"><Menu size={18} />More</Link></nav>
    </div>
  );
}
