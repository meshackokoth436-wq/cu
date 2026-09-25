import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/Button';
import {
  fetchTodayScripture,
  type DailyScripture,
} from '@/features/daily-scriptures/daily-scriptures.api';
import { fetchLandingMedia } from '@/features/landing-media/landing-media.api';
import {
  EVENT_TYPE_LABELS,
  fetchPublicEvents,
  formatEventDate,
  resolveMediaUrl,
  type PublicEvent,
} from '@/features/events/events.api';
import {
  fetchPublicGalleryAlbums,
  type GalleryAlbum,
} from '@/features/gallery/gallery.api';
import { fetchPublicAnnouncements, type PublicAnnouncement } from '@/features/broadcast-messages/broadcast-messages.api';

function formatTimeRange(event: PublicEvent) {
  const start = new Date(event.start_at);
  const end = event.end_at ? new Date(event.end_at) : null;
  const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const startText = start.toLocaleTimeString('en-KE', options);
  if (!end) return startText;
  return `${startText} – ${end.toLocaleTimeString('en-KE', options)}`;
}

function dateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString('en-KE', { day: '2-digit' }),
    month: date.toLocaleDateString('en-KE', { month: 'short' }).toUpperCase(),
    weekday: date.toLocaleDateString('en-KE', { weekday: 'short' }).toUpperCase(),
  };
}

function EventGlassCard({ event }: { event: PublicEvent }) {
  const parts = dateParts(event.start_at);
  const image = resolveMediaUrl(event.image_url);

  return (
    <Link
      to="/events"
      className="group grid grid-cols-[58px_72px_minmax(0,1fr)_24px] items-center gap-3 border-b border-white/15 px-4 py-4 last:border-b-0 hover:bg-white/10 transition"
    >
      <div className="rounded-2xl bg-white/15 border border-white/15 px-2 py-2 text-center text-white backdrop-blur-md">
        <div className="text-[9px] font-black tracking-[.16em] text-emerald-200">{parts.weekday}</div>
        <div className="text-xl font-black leading-none mt-1">{parts.day}</div>
        <div className="text-[9px] font-bold text-white/65 mt-1">{parts.month}</div>
      </div>

      <div className="h-[58px] w-[72px] overflow-hidden rounded-2xl bg-white/10 border border-white/15">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        ) : (
          <div className="h-full w-full grid place-items-center text-emerald-200"><CalendarDays size={21} /></div>
        )}
      </div>

      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-200">
          {EVENT_TYPE_LABELS[event.event_type] ?? event.category ?? 'Event'}
        </div>
        <h3 className="mt-1 truncate text-sm font-extrabold text-white">{event.title}</h3>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/65">
          <span className="inline-flex items-center gap-1"><Clock3 size={11} />{formatTimeRange(event)}</span>
          {event.location && <span className="inline-flex items-center gap-1 truncate"><MapPin size={11} />{event.location}</span>}
        </div>
      </div>

      <ChevronRight size={18} className="text-white/45 group-hover:text-white transition" />
    </Link>
  );
}

function Hero({ slides }: { slides: Array<{ id: string; src: string; caption: string; eyebrow: string }> }) {
  const [active, setActive] = useState(0);
  const current = slides[active];

  return (
    <div className="relative min-h-[700px] overflow-hidden rounded-[40px] bg-[#032d1a] shadow-[0_35px_100px_rgba(2,35,18,.28)]">
      {slides.length > 0 ? (
        slides.map((slide, index) => (
          <img
            key={slide.id}
            src={resolveMediaUrl(slide.src)}
            alt={slide.caption}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${index === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          />
        ))
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(25,166,91,.42),transparent_30%),linear-gradient(135deg,#032d1a,#071d14)]" />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,28,17,.94)_0%,rgba(2,28,17,.78)_38%,rgba(2,28,17,.22)_72%,rgba(2,28,17,.35)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(2,28,17,.65),transparent_55%)]" />

      <div className="relative z-10 flex min-h-[700px] flex-col justify-between p-7 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[.2em] text-white backdrop-blur-xl">
            <Sparkles size={14} className="text-emerald-300" />
            Welcome to TUMCU
          </div>
          <div className="hidden rounded-full border border-white/15 bg-black/20 px-4 py-2 text-[11px] font-semibold text-white/80 backdrop-blur-xl sm:block">
            Christ • Community • Impact
          </div>
        </div>

        <div className="max-w-4xl pb-10 lg:pb-20">
          <p className="text-sm font-bold uppercase tracking-[.28em] text-emerald-300">Technical University of Mombasa</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[.98] tracking-[-.045em] text-white sm:text-6xl lg:text-8xl">
            A Christian community <span className="text-emerald-300">alive with purpose.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/80 sm:text-lg lg:text-xl">
            A Christ-centred student community where faith becomes friendship, the Word becomes formation, and service becomes a way of life.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register"><Button variant="primary" className="px-6 py-3.5 text-sm font-extrabold shadow-xl">Join the community <ArrowRight size={17} /></Button></Link>
            <Link to="/about"><Button variant="outline" className="border-white/30 bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-white/20">Discover TUMCU</Button></Link>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <button key={slide.id} type="button" onClick={() => setActive(index)} aria-label={`Show ${slide.caption}`} className={`h-1.5 rounded-full transition-all ${index === active ? 'w-10 bg-emerald-300' : 'w-2 bg-white/35 hover:bg-white/70'}`} />
            ))}
          </div>
          {current?.caption && <div className="hidden max-w-xs text-right text-xs font-semibold text-white/65 sm:block">{current.caption}</div>}
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { data: media } = useQuery({ queryKey: ['landing-media'], queryFn: fetchLandingMedia, staleTime: 30_000 });
  const { data: events = [] } = useQuery({ queryKey: ['events', 'public'], queryFn: fetchPublicEvents, staleTime: 30_000 });
  const { data: gallery = [] } = useQuery({ queryKey: ['gallery', 'public', 'latest'], queryFn: () => fetchPublicGalleryAlbums(), staleTime: 30_000 });
  const { data: announcements = [] } = useQuery<PublicAnnouncement[]>({ queryKey: ['public-announcements'], queryFn: fetchPublicAnnouncements, staleTime: 30_000 });
  const { data: scripture } = useQuery<DailyScripture | null>({ queryKey: ['daily-scripture-today'], queryFn: fetchTodayScripture, staleTime: 60_000 });
  const [copied, setCopied] = useState(false);

  const heroSlides = useMemo(() =>
    (media?.heroCarousel ?? []).filter((slide) => slide.active).sort((a, b) => a.order - b.order).map((slide) => ({
      id: slide.id,
      src: slide.src,
      caption: slide.caption,
      eyebrow: slide.eyebrow,
    })), [media]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((event) => new Date(event.start_at).getTime() >= now)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
      .slice(0, 5);
  }, [events]);

  const latestGallery = gallery.slice(0, 6);

  const copyScripture = async () => {
    if (!scripture) return;
    await navigator.clipboard.writeText(`${scripture.text} — ${scripture.reference}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="bg-[#f5f8f6] text-slate-950">
      <section className="page-shell pt-4 sm:pt-6">
        <Hero slides={heroSlides} />
      </section>

      <section className="page-shell relative z-20 -mt-14 px-4 sm:-mt-20 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="grid grid-cols-2 overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-[0_25px_70px_rgba(4,57,31,.12)] backdrop-blur-xl sm:grid-cols-4">
            {[
              ['Community', 'Christ-centred'],
              ['Faith', 'Prayer & Word'],
              ['Service', 'Kingdom impact'],
              ['Mission', 'Campus & beyond'],
            ].map(([title, text], index) => (
              <div key={title} className={`px-5 py-5 sm:px-6 sm:py-7 ${index ? 'border-l border-slate-100' : ''}`}>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-800"><Users size={19} /></div>
                <div className="mt-3 text-sm font-black text-slate-950">{title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500">{text}</div>
              </div>
            ))}
          </div>

          <aside className="relative overflow-hidden rounded-[30px] border border-white/25 bg-[#06351f]/90 shadow-[0_25px_80px_rgba(2,35,18,.28)] backdrop-blur-2xl">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2 text-white"><Bell size={18} className="text-emerald-300" /><span className="text-sm font-black">Upcoming Events</span></div>
              <Link to="/events" className="text-xs font-bold text-emerald-300 hover:text-white">View all</Link>
            </div>
            {upcoming.length > 0 ? upcoming.map((event) => <EventGlassCard key={event.id} event={event} />) : (
              <div className="px-5 py-10 text-center text-sm text-white/65">No upcoming events have been published yet.</div>
            )}
            <Link to="/events" className="m-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/35 bg-emerald-300/10 px-4 py-3 text-xs font-black text-emerald-200 hover:bg-emerald-300/20 transition">View full events calendar <ArrowRight size={14} /></Link>
          </aside>
        </div>
      </section>

      {announcements[0] && (
        <section className="page-shell px-4 pt-10 sm:px-6 sm:pt-14">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><span className="text-[10px] font-black uppercase tracking-[.2em] text-amber-700">Announcement</span><h2 className="mt-1 text-sm font-black text-slate-900">{announcements[0].title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{announcements[0].body}</p></div>
              <Link to="/events" className="shrink-0 text-xs font-black text-amber-800">See updates <ArrowRight size={13} className="inline" /></Link>
            </div>
          </div>
        </section>
      )}

      <section className="page-shell px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-emerald-900"><ImageIcon size={13} /> Latest moments</div>
            <h2 className="mt-5 text-4xl font-black tracking-[-.035em] text-slate-950 sm:text-5xl">What&apos;s happening in our community.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Fresh photographs appear here only after an administrator publishes a gallery album. Nothing is pre-filled or invented.</p>
          </div>
          <div className="lg:text-right"><Link to="/gallery" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-xs font-black text-emerald-900 shadow-sm hover:bg-emerald-50">Open gallery <ArrowRight size={14} /></Link></div>
        </div>

        {latestGallery.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestGallery.map((album) => (
              <Link to="/gallery" key={album.id} className="group overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={resolveMediaUrl(album.cover_image_url)} alt={album.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div>
                <div className="p-5"><div className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-700">{album.category}</div><h3 className="mt-2 text-base font-black text-slate-950 line-clamp-1">{album.title}</h3><p className="mt-1 text-xs text-slate-500">{new Date(album.event_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[30px] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
            <ImageIcon className="mx-auto text-slate-300" size={42} />
            <h3 className="mt-4 text-lg font-black text-slate-700">Latest pictures will appear here.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">The gallery is currently empty. Once an administrator publishes an album, its latest cover photos will appear on the homepage automatically.</p>
          </div>
        )}
      </section>

      <section className="page-shell px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[34px] bg-[#06351f] p-7 text-white shadow-xl sm:p-10">
            <span className="text-[10px] font-black uppercase tracking-[.22em] text-emerald-300">Scripture of the day</span>
            {scripture ? <><blockquote className="mt-5 max-w-3xl text-2xl font-semibold leading-9 sm:text-3xl">“{scripture.text}”</blockquote><div className="mt-4 text-sm font-black text-emerald-300">{scripture.reference}</div>{scripture.reflection && <p className="mt-5 max-w-2xl border-t border-white/10 pt-5 text-sm leading-7 text-white/65">{scripture.reflection}</p>}<button onClick={copyScripture} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-black hover:bg-white/15">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy verse'}</button></> : <p className="mt-5 text-sm leading-7 text-white/65">No scripture has been published for today yet. An administrator can manage the five-day rotation from the admin area.</p>}
          </div>
          <div className="rounded-[34px] bg-white p-7 shadow-sm ring-1 ring-slate-200/70 sm:p-10">
            <span className="text-[10px] font-black uppercase tracking-[.22em] text-emerald-700">Stay connected</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">There is a place for you here.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Meet students, grow in the Word, serve with your gifts and become part of a community that points one another to Christ.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2"><Link to="/ministries" className="rounded-2xl bg-emerald-700 px-4 py-3 text-center text-xs font-black text-white hover:bg-emerald-800">Explore ministries</Link><Link to="/register" className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-xs font-black text-slate-800 hover:bg-slate-50">Join TUMCU</Link></div>
          </div>
        </div>
      </section>
    </div>
  );
}
