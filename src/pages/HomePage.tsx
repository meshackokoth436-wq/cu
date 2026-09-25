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
import tumGateImage from '@/assets/tum-gate-monument.jpg';
import photo1 from '@/assets/community/community-1.jpg';
import photo2 from '@/assets/community/community-2.jpg';
import photo3 from '@/assets/community/community-3.jpg';
import photo5 from '@/assets/community/community-5.jpg';

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
  // 5 ALTERNATING BACKDROP PICTURES
  // ---------------------------------------------------------------------------
  const backdropSlides = useMemo(() => {
    if (media?.backdropSlides && media.backdropSlides.length > 0) {
      const activeOnly = media.backdropSlides.filter((b) => b.active);

      if (activeOnly.length > 0) {
        return activeOnly;
      }
    }

    return [
      {
        id: 'b-1',
        src: media?.backgroundImage?.src || tumGateImage,
        title: 'TUM Main Entrance Gate Monument',
        active: true,
        order: 1,
      },
      {
        id: 'b-2',
        src: photo1,
        title: 'Student Intercession & Prayer Gathering',
        active: true,
        order: 2,
      },
      {
        id: 'b-3',
        src: photo2,
        title: 'Joyful Praise & Worship in Unity',
        active: true,
        order: 3,
      },
      {
        id: 'b-4',
        src: photo3,
        title: 'Christian Fellowship & Discipleship',
        active: true,
        order: 4,
      },
      {
        id: 'b-5',
        src: photo5,
        title: 'Campus Evangelism & Servant Leadership',
        active: true,
        order: 5,
      },
    ];
  }, [media]);

  const [currentBackdropIdx, setCurrentBackdropIdx] = useState(0);

  useEffect(() => {
    setCurrentBackdropIdx((prev) =>
      Math.min(prev, Math.max(0, backdropSlides.length - 1))
    );

    if (backdropSlides.length <= 1) {
      return;
    }

    const interval = Math.max(
      1500,
      Number(media?.rotateIntervalMs) || 4000
    );

    const timer = setInterval(() => {
      setCurrentBackdropIdx(
        (prev) => (prev + 1) % backdropSlides.length
      );
    }, interval);

    return () => clearInterval(timer);
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
      {/* HERO SECTION                                                         */}
      {/* ===================================================================== */}

      <div className="relative overflow-hidden min-h-[640px] lg:min-h-[720px] flex flex-col justify-between">
        {/* Alternating backdrop images */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {backdropSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 bg-cover bg-no-repeat transform-gpu transition-all duration-1000 ease-in-out ${
                idx === currentBackdropIdx
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
              style={{
                backgroundImage: `url(${slide.src})`,
                backgroundPosition: 'center 25%',
                filter: `blur(${bgBlurPx}px)`,
              }}
            />
          ))}
        </div>

        {/* Ambient overlays */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.58) 50%, rgba(248,251,249,0.95) 100%)',
            opacity: bgOpacity,
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.8),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.7),transparent_60%)] pointer-events-none" />

        {/* Backdrop indicator */}
        <div className="relative z-10 pt-4 px-5 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1 text-[11px] font-bold text-slate-800 backdrop-blur-md border border-white/80 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>TUM Main Campus Fellowship</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-white text-[11px] font-medium border border-white/20 shadow-xs ml-auto">
            <span className="text-emerald-300 font-bold">
              Backdrop #{currentBackdropIdx + 1}/{backdropSlides.length}:
            </span>

            <span className="max-w-[160px] truncate">
              {backdropSlides[currentBackdropIdx]?.title}
            </span>

            <div className="flex gap-1 ml-1.5">
              {backdropSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentBackdropIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentBackdropIdx
                      ? 'w-4 bg-emerald-400'
                      : 'w-1.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`View backdrop photo ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hero main content */}
        <section className="relative px-5 pb-16 pt-10 sm:px-6 lg:pt-16">
          <div className="page-shell relative grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
            <div className="relative z-10">
              <span className="eyebrow shadow-xs bg-white/95 backdrop-blur-md border border-primary-200">
                <Sparkles size={14} className="text-primary-700" />
                A community on mission
              </span>

              <div className="mt-6 inline-block rounded-3xl bg-white/45 p-2 sm:p-3 -ml-2 sm:-ml-3 backdrop-blur-[2px]">
                <h1 className="max-w-3xl text-4xl font-black leading-[1.1] tracking-[-.035em] text-slate-950 sm:text-5xl lg:text-6xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
                  The Technical University of Mombasa{' '}
                  <span className="text-primary-700 drop-shadow-xs">
                    Christian Union
                  </span>
                </h1>
              </div>

              <p className="mt-5 max-w-xl text-base leading-8 text-slate-900 font-bold sm:text-lg drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]">
                Welcome to TUMCU — a Christ-centred community where students
                discover purpose, grow in the Word, find family and learn to
                serve.
              </p>

              {/* Landing page actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button
                    variant="primary"
                    className="px-6 py-3.5 text-sm font-bold shadow-lg shadow-primary-900/25 hover:shadow-xl transition"
                  >
                    Join the community <ArrowRight size={17} />
                  </Button>
                </Link>

                <Link to="/ministries">
                  <Button
                    variant="outline"
                    className="px-6 py-3.5 text-sm font-bold border-slate-400/80 bg-white/90 text-primary-950 hover:bg-white transition backdrop-blur-md shadow-xs"
                  >
                    Explore ministries
                  </Button>
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-300/80 pt-8 sm:gap-6">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-white/70 p-3 sm:p-4 backdrop-blur-md border border-white/80 shadow-xs"
                  >
                    <div className="text-2xl font-black text-primary-950 sm:text-3xl drop-shadow-2xs">
                      {s.value}
                    </div>

                    <div className="mt-1 text-xs font-black uppercase tracking-[.14em] text-slate-800 flex items-center gap-1.5">
                      <s.icon
                        size={13}
                        className="text-primary-700 shrink-0"
                      />
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero carousel */}
            <div className="relative lg:pl-6">
              <div className="absolute -right-4 top-10 h-28 w-28 rounded-full bg-gold-400/35 blur-3xl" />
              <div className="absolute -left-4 bottom-6 h-36 w-36 rounded-full bg-primary-500/25 blur-3xl" />

              <div className="relative rounded-[36px] p-3 shadow-2xl shadow-primary-950/20 bg-white/90 border border-white backdrop-blur-md">
                <div className="photo-frame rounded-[30px] bg-white/80 p-4 sm:p-6">
                  <HeroCarousel
                    slides={media?.heroCarousel}
                    rotateIntervalMs={media?.rotateIntervalMs}
                  />
                </div>
              </div>

              <div className="float-soft absolute -bottom-7 -left-2 hidden max-w-[220px] rounded-3xl p-4 sm:block bg-white/95 border border-white shadow-xl backdrop-blur-md">
                <div className="text-xs font-bold uppercase tracking-[.16em] text-gold-600">
                  Today
                </div>

                <div className="mt-1 font-bold text-primary-950">
                  Grow. Connect. Serve.
                </div>

                <div className="mt-1 text-xs leading-5 text-slate-800 font-bold">
                  There is a place for you here.
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-10 bg-gradient-to-t from-[#f8fbf9] to-transparent pointer-events-none" />
      </div>

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