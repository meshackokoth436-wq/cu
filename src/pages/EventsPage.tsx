import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  downloadSemesterCalendarIcs,
  EVENT_TYPE_LABELS,
  fetchPublicEvents,
  formatEventDate,
  resolveMediaUrl,
  type PublicEvent,
} from '@/features/events/events.api';
import { useAuthStore } from '@/store/auth.store';

function timeRange(event: PublicEvent) {
  const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const start = new Date(event.start_at).toLocaleTimeString('en-KE', options);
  return event.end_at ? `${start} – ${new Date(event.end_at).toLocaleTimeString('en-KE', options)}` : start;
}

function EventRow({ event }: { event: PublicEvent }) {
  const date = new Date(event.start_at);
  const image = resolveMediaUrl(event.image_url);

  return (
    <article className="group grid overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl md:grid-cols-[250px_minmax(0,1fr)]">
      <div className="relative min-h-[220px] overflow-hidden bg-emerald-950">
        {image ? <img src={image} alt={event.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(46,190,116,.42),transparent_30%),linear-gradient(135deg,#06351f,#001b10)]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-5 top-5 rounded-2xl border border-white/20 bg-black/25 px-4 py-3 text-center text-white backdrop-blur-xl">
          <div className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-200">{date.toLocaleDateString('en-KE', { weekday: 'short' })}</div>
          <div className="mt-1 text-3xl font-black leading-none">{date.getDate()}</div>
          <div className="mt-1 text-[10px] font-bold uppercase text-white/70">{date.toLocaleDateString('en-KE', { month: 'short' })}</div>
        </div>
        <div className="absolute bottom-5 left-5 right-5"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] text-white backdrop-blur-md">{EVENT_TYPE_LABELS[event.event_type] ?? event.category ?? 'Event'}</span></div>
      </div>

      <div className="flex flex-col justify-between p-6 sm:p-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">{formatEventDate(event.start_at)}</div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{event.title}</h2>
          {event.description && <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{event.description}</p>}
          <div className="mt-6 grid gap-3 text-xs font-semibold text-slate-600 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3"><Clock3 size={16} className="text-emerald-700" />{timeRange(event)}</div>
            {event.location && <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3"><MapPin size={16} className="text-emerald-700" />{event.location}</div>}
          </div>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5"><span className="text-xs font-bold text-slate-400">TUMCU • Official Event</span><span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800">Save the date <ArrowRight size={14} /></span></div>
      </div>
    </article>
  );
}

export function EventsPage() {
  const { user, hasPermission, isSuperAdmin } = useAuthStore();
  const isAdmin = isSuperAdmin() || hasPermission('events.create') || hasPermission('events.edit') || user?.role === 'super_admin';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [windowFilter, setWindowFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const { data: events = [], isLoading } = useQuery({ queryKey: ['events', 'public'], queryFn: fetchPublicEvents, staleTime: 30_000 });

  const eventTypes = useMemo(() => ['all', ...Array.from(new Set(events.map((event) => event.event_type)))], [events]);
  const filtered = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((event) => {
        const matchesWindow = windowFilter === 'all' || (windowFilter === 'upcoming' ? new Date(event.start_at).getTime() >= now : new Date(event.start_at).getTime() < now);
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || `${event.title} ${event.description ?? ''} ${event.location ?? ''}`.toLowerCase().includes(q);
        const matchesType = filter === 'all' || event.event_type === filter;
        return matchesWindow && matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }, [events, filter, search, windowFilter]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="bg-[#f5f8f6] pb-20">
      <section className="page-shell px-4 pt-4 sm:px-6">
        <div className="relative min-h-[500px] overflow-hidden rounded-[40px] bg-[radial-gradient(circle_at_80%_20%,rgba(48,193,115,.35),transparent_28%),linear-gradient(135deg,#022d1a,#06170f)] px-7 py-12 text-white shadow-[0_30px_90px_rgba(2,35,18,.22)] sm:px-12 sm:py-16 lg:min-h-[560px] lg:px-16">
          <div className="absolute inset-0 opacity-25 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,.08)_45%,transparent_70%)]" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[.2em] text-emerald-200 backdrop-blur-xl"><Sparkles size={14} /> TUMCU calendar</div>
            <h1 className="mt-6 text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-8xl">Show up for what <span className="text-emerald-300">matters.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">Prayer, worship, fellowship, discipleship, missions and the moments where our community gathers around Christ.</p>
            <div className="mt-8 flex flex-wrap gap-3"><button onClick={downloadSemesterCalendarIcs} className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-xs font-black text-[#032d1a] hover:bg-emerald-300"><Download size={15} /> Download calendar</button>{isAdmin && <Link to="/dashboard/admin?tab=events" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-black text-white hover:bg-white/15">Manage events <ArrowRight size={15} /></Link>}</div>
          </div>
        </div>
      </section>

      <section className="page-shell -mt-10 relative z-20 px-4 sm:px-6">
        <div className="rounded-[28px] border border-white bg-white/90 p-4 shadow-[0_20px_70px_rgba(3,50,27,.12)] backdrop-blur-xl">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"><Search size={17} className="text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events, locations or ministries..." className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" /></label>
            <div className="flex items-center gap-2 overflow-x-auto"><Filter size={15} className="text-slate-400 shrink-0" />{eventTypes.map((type) => <button key={type} onClick={() => setFilter(type)} className={`whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-black transition ${filter === type ? 'bg-emerald-700 text-white' : 'bg-slate-50 text-slate-600 hover:bg-emerald-50'}`}>{type === 'all' ? 'All types' : EVENT_TYPE_LABELS[type] ?? type.replaceAll('_', ' ')}</button>)}</div>
            <div className="flex rounded-2xl bg-slate-50 p-1"><button onClick={() => setWindowFilter('upcoming')} className={`rounded-xl px-3 py-2 text-[11px] font-black ${windowFilter === 'upcoming' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}>Upcoming</button><button onClick={() => setWindowFilter('past')} className={`rounded-xl px-3 py-2 text-[11px] font-black ${windowFilter === 'past' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}>Past</button><button onClick={() => setWindowFilter('all')} className={`rounded-xl px-3 py-2 text-[11px] font-black ${windowFilter === 'all' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}>All</button></div>
          </div>
        </div>
      </section>

      <section className="page-shell px-4 pt-12 sm:px-6 sm:pt-16">
        {isLoading ? <div className="rounded-[30px] bg-white p-16 text-center text-sm font-bold text-slate-500">Loading events…</div> : filtered.length === 0 ? <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/70 p-16 text-center"><CalendarDays className="mx-auto text-slate-300" size={42} /><h2 className="mt-4 text-xl font-black text-slate-700">No events match your current filters.</h2><p className="mt-2 text-sm text-slate-500">Published events will appear here automatically when their dates and status make them public.</p></div> : <div className="space-y-5">{featured && <EventRow event={featured} />}{rest.map((event) => <EventRow key={event.id} event={event} />)}</div>}
      </section>

      <section className="page-shell px-4 pt-12 sm:px-6"><Link to="/calendar" className="group flex items-center justify-between rounded-[30px] border border-emerald-100 bg-emerald-50 px-6 py-5 hover:bg-emerald-100 transition"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">Plan ahead</div><div className="mt-1 text-lg font-black text-emerald-950">Open the full TUMCU calendar</div></div><ChevronRight className="text-emerald-700 transition group-hover:translate-x-1" /></Link></section>
    </div>
  );
}
