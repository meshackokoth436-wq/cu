import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ArrowRight, Search, Download, Clock3, ChevronRight } from 'lucide-react';
import { EVENT_TYPE_LABELS, fetchPublicEvents, formatEventDate, downloadSemesterCalendarIcs } from '@/features/events/events.api';
import { useAuthStore } from '@/store/auth.store';
import photo1 from '@/assets/community/community-1.jpg';
import photo2 from '@/assets/community/community-2.jpg';
import photo3 from '@/assets/community/community-3.jpg';
import photo4 from '@/assets/community/community-4.jpg';

const eventImages = [photo1, photo2, photo3, photo4];

export function EventsPage() {
  const { user, hasPermission, isSuperAdmin } = useAuthStore();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');

  const isAdmin = isSuperAdmin() || hasPermission('events.create') || hasPermission('events.edit') || user?.role === 'super_admin';
  const { data: events = [], isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ['events', 'public'], queryFn: fetchPublicEvents, staleTime: 30_000, retry: 2 });

  const types = useMemo(() => Array.from(new Set(events.map((e) => e.event_type).filter(Boolean))), [events]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    return [...events]
      .filter((e) => dateFilter === 'all' ? true : dateFilter === 'past' ? new Date(e.start_at).getTime() < now : new Date(e.start_at).getTime() >= now)
      .filter((e) => type === 'all' || e.event_type === type)
      .filter((e) => !q || `${e.title} ${e.description || ''} ${e.location || ''}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }, [events, search, type, dateFilter]);

  const featured = filtered[0];
  const list = filtered.slice(1);

  return (
    <div className="tumcu-public-page">
      <section className="tumcu-page-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,50,31,.90), rgba(0,50,31,.45)), url(${photo1})` }}>
        <div className="page-shell"><span className="tumcu-kicker">EVENTS</span><h1>Upcoming Events</h1><p>Be part of what God is doing. Join us for fellowship, worship, learning and service.</p></div>
      </section>

      <section className="page-shell tumcu-events-content">
        <div className="tumcu-event-filters">
          <div className="tumcu-event-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." /></div>
          <select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All Event Types</option>{types.map((t) => <option key={t} value={t}>{EVENT_TYPE_LABELS[t] || t}</option>)}</select>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="all">All Dates</option></select>
          <button className="tumcu-btn green" onClick={() => refetch()}>Search</button>
        </div>

        <div className="tumcu-events-toolbar">
          <div><span>WHAT'S HAPPENING</span><h2>{dateFilter === 'past' ? 'Past Events' : 'Upcoming Events'}</h2></div>
          <div className="tumcu-event-tools"><button onClick={downloadSemesterCalendarIcs}><Download size={14} /> Download Calendar</button>{isAdmin && <Link to="/dashboard/admin?tab=events">Manage Events</Link>}</div>
        </div>

        {isError && <div className="tumcu-error-card"><strong>Events are taking a moment to arrive.</strong><p>We couldn't reach the event service. Try again.</p><button onClick={() => refetch()}>{isFetching ? 'Retrying…' : 'Try again'}</button></div>}

        {!isError && isLoading && <div className="tumcu-event-list">{[1,2,3].map((i) => <div className="tumcu-event-row skeleton" key={i} />)}</div>}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="tumcu-events-layout">
            {featured && <Link to={`/events`} className="tumcu-featured-event">
              <div className="tumcu-featured-image"><img src={eventImages[0]} alt="" /><span>FEATURED</span></div>
              <div className="tumcu-featured-body"><span className="tumcu-event-type">{EVENT_TYPE_LABELS[featured.event_type] || 'Event'}</span><h3>{featured.title}</h3><p>{featured.description || 'Join the TUMCU community for this special gathering.'}</p><div className="tumcu-event-meta"><span><CalendarDays size={14} /> {formatEventDate(featured.start_at)}</span><span><Clock3 size={14} /> {new Date(featured.start_at).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' })}</span><span><MapPin size={14} /> {featured.location || 'TUMCU Main Campus'}</span></div><strong className="tumcu-read-more">View event <ArrowRight size={15} /></strong></div>
            </Link>}

            <div className="tumcu-event-list">{list.map((event, index) => <Link to="/events" className="tumcu-event-row" key={event.id}>
              <div className="tumcu-event-date"><span>{new Date(event.start_at).toLocaleDateString('en-KE', { weekday: 'short' }).toUpperCase()}</span><strong>{new Date(event.start_at).getDate()}</strong><span>{new Date(event.start_at).toLocaleDateString('en-KE', { month: 'short' }).toUpperCase()}</span></div>
              <img src={eventImages[(index + 1) % eventImages.length]} alt="" />
              <div><span className="tumcu-event-type">{EVENT_TYPE_LABELS[event.event_type] || 'Event'}</span><h3>{event.title}</h3><small><Clock3 size={11} /> {new Date(event.start_at).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' })} · <MapPin size={11} /> {event.location || 'TUMCU Main Campus'}</small></div><ChevronRight size={17} />
            </Link>)}</div>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && <div className="tumcu-empty"><CalendarDays size={38} /><h3>No events found</h3><p>Try another search or date filter.</p></div>}
      </section>
    </div>
  );
}
