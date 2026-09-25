import { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Users,
  Sparkles,
  Clock,
  MapPin,
  Megaphone,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { HeroCarousel } from '@/components/HeroCarousel';
import { PrayerArt } from '@/components/hero-art/PrayerArt';
import { BibleStudyArt } from '@/components/hero-art/BibleStudyArt';
import { CommunityArt } from '@/components/hero-art/CommunityArt';
import { fetchLandingMedia } from '@/features/landing-media/landing-media.api';
import {
  fetchPublicAnnouncements,
  type PublicAnnouncement,
} from '@/features/broadcast-messages/broadcast-messages.api';
import {
  fetchTodayScripture,
  type DailyScripture,
} from '@/features/daily-scriptures/daily-scriptures.api';

const stats = [
  { label: 'Active Ministries', value: '10', icon: Users },
  { label: 'Faith & Fellowship', value: '24/7', icon: HeartHandshake },
  { label: 'Word-Centred', value: '100%', icon: BookOpen },
];

const moments = [
  {
    title: 'Prayer that moves us',
    text: 'We gather to seek God, carry one another and intercede for our campus and nation.',
    Art: PrayerArt,
    tag: 'PRAYER',
  },
  {
    title: 'The Word that forms us',
    text: 'Bible study, discipleship, and grounded hermeneutics taking faith beyond Sunday into life.',
    Art: BibleStudyArt,
    tag: 'THE WORD',
  },
  {
    title: 'Community that sends us',
    text: 'We serve, evangelize, and build lifelong friendships that reflect the love of Christ.',
    Art: CommunityArt,
    tag: 'MISSION',
  },
];

export function HomePage() {
  // ---------------------------------------------------------------------------
  // LANDING MEDIA
  // ---------------------------------------------------------------------------
  const { data: media } = useQuery({
    queryKey: ['landing-media'],
    queryFn: fetchLandingMedia,
    staleTime: 30_000,
    refetchInterval: 25_000,
  });

  // ---------------------------------------------------------------------------
  // ANNOUNCEMENTS
  // ---------------------------------------------------------------------------
  const { data: announcements = [] } = useQuery<PublicAnnouncement[]>({
    queryKey: ['public-announcements'],
    queryFn: fetchPublicAnnouncements,
    staleTime: 30_000,
  });

  // ---------------------------------------------------------------------------
  // ADMIN-MANAGED ALTERNATING BACKDROP PICTURES
  //
  // If the admin has at least two active pictures, only active pictures are
  // rotated. If fewer than two are active, we use all configured pictures so
  // the homepage does not get stuck on a single image. No local fallback
  // photographs are hard-coded here.
  // ---------------------------------------------------------------------------
  const backdropSlides = useMemo(() => {
    const configured = (media?.backdropSlides ?? [])
      .filter((slide) => Boolean(slide?.src))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (configured.length <= 1) {
      return configured;
    }

    const active = configured.filter((slide) => slide.active);

    return active.length >= 2 ? active : configured;
  }, [media?.backdropSlides]);

  const [currentBackdropIdx, setCurrentBackdropIdx] = useState(0);

  // Keep the current index valid whenever the admin changes the number of
  // backdrop pictures.
  useEffect(() => {
    setCurrentBackdropIdx((current) => {
      if (backdropSlides.length === 0) return 0;
      return current >= backdropSlides.length ? 0 : current;
    });
  }, [backdropSlides.length]);

  // Automatically move to the next admin-managed backdrop.
  useEffect(() => {
    if (backdropSlides.length <= 1) return;

    const intervalMs = Math.max(2500, Number(media?.rotateIntervalMs) || 5000);

    const timer = window.setInterval(() => {
      setCurrentBackdropIdx((current) => (current + 1) % backdropSlides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [backdropSlides.length, media?.rotateIntervalMs]);

  const bgOpacity = media?.backgroundImage?.opacity ?? 0.82;
  const bgBlurPx = media?.backgroundImage?.blurPx ?? 1;

  // ---------------------------------------------------------------------------
  // DAILY SCRIPTURE
  // Database-managed five-day rotation.
  // The server determines which scripture is active for the current day.
  // ---------------------------------------------------------------------------
  const {
    data: dailyScripture,
    isLoading: dailyScriptureLoading,
  } = useQuery<DailyScripture | null>({
    queryKey: ['daily-scripture-today'],
    queryFn: fetchTodayScripture,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const [copiedScripture, setCopiedScripture] = useState(false);

  const handleCopyScripture = () => {
    if (!dailyScripture) {
      return;
    }

    const textToCopy = `${dailyScripture.text} — ${dailyScripture.reference} (TUMCU Daily Scripture)`;

    navigator.clipboard.writeText(textToCopy);

    setCopiedScripture(true);

    setTimeout(() => {
      setCopiedScripture(false);
    }, 2500);
  };

  return (
    <div className="overflow-hidden">
      {/* ===================================================================== */}
      {/* FULL-BLEED HERO                                                       */}
      {/* ===================================================================== */}

      <section className="home-hero">
        <div className="home-hero__backdrops" aria-hidden="true">
          {backdropSlides.map((slide, index) => (
            <div
              key={`${slide.id}-${slide.src}`}
              className={`home-hero__backdrop ${
                index === currentBackdropIdx
                  ? 'home-hero__backdrop--active'
                  : ''
              }`}
              style={{
                backgroundImage: `url("${slide.src}")`,
                backgroundPosition: 'center center',
                filter: `blur(${bgBlurPx}px)`,
              }}
            />
          ))}

          {backdropSlides.length === 0 && (
            <div className="home-hero__empty-backdrop" />
          )}
        </div>

        <div
          className="home-hero__overlay"
          style={{
            opacity: Math.min(0.92, Math.max(0.45, bgOpacity)),
          }}
        />

        <div className="home-hero__content">
          <div className="home-hero__topline">
            <span className="home-hero__eyebrow">
              <Sparkles size={14} />
              WELCOME TO TUMCU
            </span>

            {backdropSlides.length > 0 && (
              <div className="home-hero__indicator">
                <span>
                  {currentBackdropIdx + 1}/{backdropSlides.length}
                </span>

                <div className="home-hero__dots">
                  {backdropSlides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      className={
                        index === currentBackdropIdx
                          ? 'active'
                          : ''
                      }
                      onClick={() => setCurrentBackdropIdx(index)}
                      aria-label={`Show ${slide.title || `backdrop ${index + 1}`}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="home-hero__grid">
            <div className="home-hero__copy">
              <p className="home-hero__campus">
                TECHNICAL UNIVERSITY OF MOMBASA
              </p>

              <h1>
                A Christian
                <br />
                community{' '}
                <span>alive with purpose.</span>
              </h1>

              <p className="home-hero__description">
                A Christ-centred student community where faith becomes
                friendship, the Word becomes formation, and service becomes a
                way of life.
              </p>

              <div className="home-hero__actions">
                <Link to="/register" className="home-hero__primary">
                  Join the community
                  <ArrowRight size={18} />
                </Link>

                <Link to="/ministries" className="home-hero__secondary">
                  Discover TUMCU
                </Link>
              </div>

              <div className="home-hero__stats">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div key={stat.label} className="home-hero__stat">
                      <div className="home-hero__stat-icon">
                        <Icon size={18} />
                      </div>
                      <div>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="home-hero__visual">
              {media?.heroCarousel && media.heroCarousel.length > 0 ? (
                <div className="home-hero__carousel">
                  <HeroCarousel
                    slides={media.heroCarousel}
                    rotateIntervalMs={media.rotateIntervalMs}
                  />
                </div>
              ) : (
                <div className="home-hero__visual-empty">
                  <Sparkles size={28} />
                  <span>
                    Add hero content from the admin dashboard.
                  </span>
                </div>
              )}
            </div>
          </div>

          {backdropSlides[currentBackdropIdx]?.title && (
            <div className="home-hero__caption">
              <span className="home-hero__caption-dot" />
              {backdropSlides[currentBackdropIdx].title}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* OFFICIAL ANNOUNCEMENTS                                               */}
      {/* ===================================================================== */}

      {announcements.length > 0 && (
        <section className="bg-amber-50/90 border-y border-amber-200/80 py-3.5 px-4 sm:px-6">
          <div className="page-shell flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500 text-white grid place-items-center shrink-0 shadow-xs">
                <Megaphone size={16} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                    Official Announcement
                  </span>

                  <span className="text-xs font-bold text-slate-900">
                    {announcements[0].title}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-0.5 max-w-3xl line-clamp-1">
                  {announcements[0].body}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              {announcements[0].venue && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white/80 px-2.5 py-1 rounded-full border border-amber-200">
                  <MapPin size={12} className="text-amber-600" />
                  {String(announcements[0].venue)}
                </span>
              )}

              <Link
                to="/events"
                className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
              >
                All notices <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* DAILY SCRIPTURE                                                      */}
      {/* ===================================================================== */}

      <section className="page-shell py-8 sm:py-10">
        <div className="relative overflow-hidden rounded-[32px] border border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-[#004d26] to-slate-950 p-6 sm:p-10 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-gold-400/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30 px-3 py-1 text-xs font-black uppercase tracking-wider">
                  <Sparkles size={13} />
                  Scripture of the Day
                </span>

                <span className="text-[11px] font-medium text-emerald-200/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                  Changes automatically after midnight
                </span>
              </div>

              {dailyScriptureLoading ? (
                <div className="rounded-2xl bg-white/5 px-4 py-5 text-sm text-emerald-100">
                  Loading today's scripture…
                </div>
              ) : dailyScripture ? (
                <>
                  <div>
                    <blockquote className="text-lg sm:text-2xl font-serif font-medium leading-relaxed sm:leading-snug text-white/95 drop-shadow-sm">
                      {dailyScripture.text}
                    </blockquote>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-base sm:text-lg font-black tracking-wide text-gold-400">
                        — {dailyScripture.reference}
                      </span>

                      {dailyScripture.theme && (
                        <span className="text-xs font-semibold text-emerald-200/70 bg-emerald-800/40 px-2.5 py-0.5 rounded-md border border-emerald-700/50">
                          {dailyScripture.theme}
                        </span>
                      )}
                    </div>
                  </div>

                  {dailyScripture.reflection && (
                    <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed pt-2 border-t border-emerald-800/50">
                      <strong className="text-gold-300 font-bold">
                        Devotional Thought:{' '}
                      </strong>
                      {dailyScripture.reflection}
                    </p>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5 text-sm leading-relaxed text-emerald-100">
                  Today's scripture has not been published yet. Please check
                  back after the administration configures the five-day
                  scripture rotation.
                </div>
              )}
            </div>

            {dailyScripture && (
              <div className="flex flex-row lg:flex-col gap-2.5 shrink-0 self-start lg:self-center border-t lg:border-t-0 lg:border-l border-emerald-800/60 pt-4 lg:pt-0 lg:pl-8">
                <button
                  type="button"
                  onClick={handleCopyScripture}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition backdrop-blur-sm cursor-pointer"
                >
                  {copiedScripture ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Copied to clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy verse</span>
                    </>
                  )}
                </button>

                <Link
                  to="/library"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-400 px-4 py-2.5 text-xs font-black text-slate-950 transition shadow-sm"
                >
                  <BookOpen size={14} />
                  <span>Read e-books</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* THE TUMCU RHYTHM & CORE PILLARS                                      */}
      {/* ===================================================================== */}

      <section className="page-shell section-pad">
        <div className="max-w-2xl">
          <span className="eyebrow">The TUMCU rhythm</span>

          <h2 className="mt-5 text-4xl font-black tracking-tight text-primary-900 sm:text-5xl">
            More than a programme.{' '}
            <span className="text-primary-500">A way of life.</span>
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Different expressions. One family. Scroll through the moments that
            shape our community.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {moments.map((item) => (
            <Card
              key={item.title}
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-primary-950">
                <item.Art />

                <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[.2em] text-gold-300 backdrop-blur-md">
                  {item.tag}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-primary-950">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* CALL TO ACTION                                                        */}
      {/* ===================================================================== */}

      <section className="page-shell section-pad">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-primary-900 via-primary-950 to-slate-950 p-8 text-white sm:p-14">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-gold-300 backdrop-blur-md">
              Start your journey
            </div>

            <h2 className="mt-6 text-3xl font-black sm:text-4xl">
              Ready to be part of what God is doing at TUM?
            </h2>

            <p className="mt-4 text-base leading-7 text-white/80">
              Register as a member, find a ministry where your gifts can serve,
              and connect with fellow students pursuing Christ together.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button
                  variant="secondary"
                  className="px-6 py-3.5 text-sm font-bold"
                >
                  Register for membership <ArrowRight size={16} />
                </Button>
              </Link>

              <Link to="/ministries">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-6 py-3.5 text-sm font-bold"
                >
                  See our ministries
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}