import { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  Camera,
  ExternalLink,
  Plus,
  Image as ImageIcon,
  Calendar,
  Filter,
  EyeOff,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  Images,
} from 'lucide-react';

import {
  fetchGalleryAlbums,
  createGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  type GalleryAlbum,
} from '@/features/gallery/gallery.api';

import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';

const categories = [
  'all',
  'Sunday Services',
  'Worship Services',
  'Prayer Meetings',
  'Conferences',
  'Retreats',
  'Evangelism',
  'Missions',
  'Fellowships',
  'Special Events',
];

const emptyForm: Partial<GalleryAlbum> = {
  title: '',
  category: 'Sunday Services',
  event_type: 'service',
  event_date: new Date().toISOString().split('T')[0],
  description: '',
  cover_image_url: '',
  google_photos_url: '',
  photo_count: 50,
  is_published: 1,
};

export function GalleryPage() {
  const queryClient = useQueryClient();

  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const isMediaLeader =
    hasRole('media_leader') ||
    hasRole('super_admin') ||
    user?.role === 'super_admin' ||
    hasPermission('gallery.manage') ||
    hasPermission('media.manage') ||
    hasPermission('*');

  const [selectedCategory, setSelectedCategory] =
    useState('all');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingAlbum, setEditingAlbum] =
    useState<GalleryAlbum | null>(null);

  const [form, setForm] =
    useState<Partial<GalleryAlbum>>(emptyForm);

  const {
    data: albums = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      'gallery-albums',
      selectedCategory,
      isMediaLeader,
    ],

    queryFn: () =>
      fetchGalleryAlbums({
        category: selectedCategory,
        include_unpublished: isMediaLeader,
      }),

    retry: 2,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<GalleryAlbum>) => {
      if (editingAlbum) {
        return updateGalleryAlbum(
          editingAlbum.id,
          payload
        );
      }

      return createGalleryAlbum(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['gallery-albums'],
      });

      setIsModalOpen(false);
      setEditingAlbum(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteGalleryAlbum(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['gallery-albums'],
      });
    },
  });

  const handleOpenAdd = () => {
    setEditingAlbum(null);

    setForm({
      ...emptyForm,
      event_date: new Date()
        .toISOString()
        .split('T')[0],
    });

    setIsModalOpen(true);
  };

  const handleOpenEdit = (
    album: GalleryAlbum
  ) => {
    setEditingAlbum(album);

    setForm({
      title: album.title,
      category: album.category,
      event_type:
        album.event_type || 'service',
      event_date: album.event_date,
      description:
        album.description || '',
      cover_image_url:
        album.cover_image_url,
      google_photos_url:
        album.google_photos_url || '',
      photo_count:
        album.photo_count,
      is_published:
        album.is_published ? 1 : 0,
    });

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saveMutation.isPending) return;

    setIsModalOpen(false);
    setEditingAlbum(null);
    setForm(emptyForm);
  };

  const handleDelete = (
    album: GalleryAlbum
  ) => {
    const confirmed = window.confirm(
      `Delete "${album.title}" album? This action cannot be undone.`
    );

    if (!confirmed) return;

    deleteMutation.mutate(album.id);
  };

  const getErrorMessage = () => {
    const responseMessage =
      (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      )?.response?.data?.message;

    if (responseMessage) {
      return responseMessage;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'We could not load the gallery. Please try again.';
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* ================================================================
          HEADER
          ================================================================ */}

      <section className="border-b border-[#006633]/10 bg-gradient-to-b from-[#006633]/5 via-[#FDFBF7] to-[#FDFBF7] pb-8 pt-12">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#006633]/20 bg-[#006633]/10 px-3.5 py-1 text-xs font-bold text-[#006633]">
                <Camera size={13} />
                <span>Protected Member Gallery</span>
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Moments of Grace &{' '}
                <span className="text-[#006633]">
                  Fellowship.
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Relive memories from Sunday services,
                retreats, evangelism missions and fellowship
                events.
              </p>
            </div>

            {isMediaLeader && (
              <Button
                variant="primary"
                onClick={handleOpenAdd}
                className="shrink-0 gap-2 bg-[#006633] text-xs font-bold text-white hover:bg-[#005229]"
              >
                <Plus size={14} />
                Create New Album
              </Button>
            )}
          </div>

          {/* Categories */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
            <Filter
              size={14}
              className="shrink-0 text-slate-400"
            />

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  selectedCategory === category
                    ? 'bg-[#006633] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {category === 'all'
                  ? 'All Moments'
                  : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          GALLERY CONTENT
          ================================================================ */}

      <main className="page-shell py-10">
        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#006633]/10">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#006633]/20 border-t-[#006633]" />
            </div>

            <h2 className="mt-5 text-lg font-black text-slate-900">
              Loading Gallery
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Please wait while we load the latest TUMCU
              memories.
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-red-100">
              <AlertCircle
                size={30}
                className="text-red-600"
              />
            </div>

            <h2 className="mt-5 text-lg font-black text-red-950">
              Gallery could not be loaded
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-red-800">
              {getErrorMessage()}
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-5 gap-2 border-red-200 bg-white text-red-700 hover:bg-red-100"
            >
              <RefreshCw size={14} />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !isError &&
          albums.length === 0 && (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-[#006633]/10">
                <Images
                  size={34}
                  className="text-[#006633]"
                />
              </div>

              <h2 className="mt-6 text-xl font-black text-slate-900">
                No gallery albums yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are currently no published photo
                albums in this category.
              </p>

              {isMediaLeader && (
                <Button
                  type="button"
                  onClick={handleOpenAdd}
                  className="mt-6 gap-2 bg-[#006633] text-white hover:bg-[#005229]"
                >
                  <Plus size={15} />
                  Create First Album
                </Button>
              )}
            </div>
          )}

        {/* Albums */}
        {!isLoading &&
          !isError &&
          albums.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#006633]">
                    TUMCU Memories
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {albums.length}{' '}
                    {albums.length === 1
                      ? 'album'
                      : 'albums'}
                  </p>
                </div>

                {isFetching && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <RefreshCw
                      size={13}
                      className="animate-spin"
                    />
                    Updating…
                  </div>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => (
                  <Card
                    key={album.id}
                    className="group flex flex-col justify-between overflow-hidden border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div>
                      {/* Cover */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={
                            album.cover_image_url ||
                            '/community/community-1.jpg'
                          }
                          alt={album.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(event) => {
                            const image =
                              event.currentTarget;

                            if (
                              image.src.includes(
                                '/community/community-1.jpg'
                              )
                            ) {
                              return;
                            }

                            image.src =
                              '/community/community-1.jpg';
                          }}
                        />

                        <div className="absolute left-3 top-3">
                          <span className="rounded-full bg-black/65 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                            {album.category}
                          </span>
                        </div>

                        {isMediaLeader &&
                          !album.is_published && (
                            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                              <EyeOff size={11} />
                              Unpublished
                            </div>
                          )}

                        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
                          <ImageIcon size={11} />
                          {album.photo_count} Photos
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-5">
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                          <Calendar
                            size={12}
                            className="text-[#006633]"
                          />

                          <span>
                            {new Date(
                              album.event_date
                            ).toLocaleDateString(
                              undefined,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>

                        <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition group-hover:text-[#006633]">
                          {album.title}
                        </h3>

                        {album.description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                            {album.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-2 border-t border-slate-100 p-5 pt-3">
                      <div className="flex items-center justify-between gap-2">
                        {album.google_photos_url ? (
                          <a
                            href={
                              album.google_photos_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#006633] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#005229]"
                          >
                            <ExternalLink size={13} />
                            View Photos
                          </a>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="w-full text-xs"
                          >
                            Photos Uploading Soon
                          </Button>
                        )}

                        {isMediaLeader && (
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenEdit(album)
                              }
                              className="p-2 text-slate-700 hover:bg-slate-100"
                              aria-label={`Edit ${album.title}`}
                            >
                              <Edit2 size={13} />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDelete(album)
                              }
                              className="p-2 text-red-600 hover:bg-red-50"
                              aria-label={`Delete ${album.title}`}
                              disabled={
                                deleteMutation.isPending
                              }
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
      </main>

      {/* ================================================================
          ADD / EDIT MODAL
          ================================================================ */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera
                  size={18}
                  className="text-[#006633]"
                />

                <h3 className="text-base font-bold text-slate-900">
                  {editingAlbum
                    ? 'Edit Gallery Album'
                    : 'Create Gallery Album'}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();

                saveMutation.mutate(form);
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Album Title
                </label>

                <Input
                  value={form.title || ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Nyali Beach Retreat"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category
                  </label>

                  <select
                    value={
                      form.category ||
                      'Sunday Services'
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10"
                  >
                    {categories
                      .filter(
                        (category) =>
                          category !== 'all'
                      )
                      .map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Event Date
                  </label>

                  <Input
                    type="date"
                    value={
                      form.event_date || ''
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        event_date:
                          event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Google Photos Album Link
                </label>

                <Input
                  type="url"
                  value={
                    form.google_photos_url || ''
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      google_photos_url:
                        event.target.value,
                    })
                  }
                  placeholder="https://photos.google.com/share/..."
                />

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Add a public Google Photos sharing
                  link so members can view the complete
                  album.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Cover Image URL
                  </label>

                  <Input
                    value={
                      form.cover_image_url || ''
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        cover_image_url:
                          event.target.value,
                      })
                    }
                    placeholder="/community/community-1.jpg"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Photo Count
                  </label>

                  <Input
                    type="number"
                    min="0"
                    value={
                      form.photo_count ?? 0
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        photo_count:
                          Number(
                            event.target.value
                          ),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description
                </label>

                <textarea
                  value={
                    form.description || ''
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Describe the event or memory…"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/10"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={Boolean(
                    form.is_published
                  )}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_published:
                        event.target.checked
                          ? 1
                          : 0,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#006633]"
                />

                <span className="text-xs font-semibold text-slate-700">
                  Publish immediately
                </span>
              </label>

              {saveMutation.isError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    Could not save this album. Please
                    check the information and try again.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={
                    saveMutation.isPending
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={
                    saveMutation.isPending
                  }
                  className="bg-[#006633] font-bold text-white hover:bg-[#005229]"
                >
                  {saveMutation.isPending
                    ? 'Saving…'
                    : editingAlbum
                      ? 'Save Changes'
                      : 'Create Album'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}