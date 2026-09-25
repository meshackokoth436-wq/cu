import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, ExternalLink, Plus, Image as ImageIcon, Calendar, Filter, EyeOff, Edit2, Trash2, X, Grid2X2 } from 'lucide-react';
import { fetchGalleryAlbums, createGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum, type GalleryAlbum } from '@/features/gallery/gallery.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import photo1 from '@/assets/community/community-1.jpg';
import photo2 from '@/assets/community/community-2.jpg';
import photo3 from '@/assets/community/community-3.jpg';
import photo4 from '@/assets/community/community-4.jpg';
import photo5 from '@/assets/community/community-5.jpg';

const fallbackImages = [photo1, photo2, photo3, photo4, photo5];

export function GalleryPage() {
  const queryClient = useQueryClient();
  const { user, hasRole, hasPermission } = useAuthStore();
  const isMediaLeader = hasRole?.('media_leader') || hasRole?.('super_admin') || user?.role === 'super_admin' || hasPermission?.('gallery.manage') || hasPermission?.('media.manage') || hasPermission?.('*');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [form, setForm] = useState<Partial<GalleryAlbum>>({ title: '', category: 'Sunday Services', event_type: 'service', event_date: new Date().toISOString().split('T')[0], description: '', cover_image_url: '/community/community-1.jpg', google_photos_url: '', photo_count: 50, is_published: 1 });

  const categories = ['all', 'Sunday Services', 'Worship Services', 'Prayer Meetings', 'Conferences', 'Retreats', 'Evangelism', 'Missions', 'Fellowships', 'Special Events'];
  const { data: albums = [], isLoading } = useQuery({ queryKey: ['gallery-albums', selectedCategory, isMediaLeader], queryFn: () => fetchGalleryAlbums({ category: selectedCategory, include_unpublished: isMediaLeader }) });
  const saveMutation = useMutation({ mutationFn: (payload: Partial<GalleryAlbum>) => editingAlbum ? updateGalleryAlbum(editingAlbum.id, payload) : createGalleryAlbum(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gallery-albums'] }); setIsModalOpen(false); setEditingAlbum(null); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteGalleryAlbum(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery-albums'] }) });

  const openAdd = () => { setEditingAlbum(null); setForm({ title: '', category: 'Sunday Services', event_type: 'service', event_date: new Date().toISOString().split('T')[0], description: '', cover_image_url: '/community/community-1.jpg', google_photos_url: '', photo_count: 50, is_published: 1 }); setIsModalOpen(true); };
  const openEdit = (album: GalleryAlbum) => { setEditingAlbum(album); setForm({ title: album.title, category: album.category, event_type: album.event_type || 'service', event_date: album.event_date, description: album.description || '', cover_image_url: album.cover_image_url, google_photos_url: album.google_photos_url || '', photo_count: album.photo_count, is_published: album.is_published ? 1 : 0 }); setIsModalOpen(true); };

  return (
    <div className="tumcu-public-page">
      <section className="tumcu-page-hero tumcu-gallery-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,50,31,.90), rgba(0,50,31,.40)), url(${photo4})` }}>
        <div className="page-shell"><span className="tumcu-kicker">▣ GALLERY</span><h1>Moments That Matter</h1><p>Photos from our events, fellowship, ministry activities and more.</p></div>
      </section>

      <section className="page-shell tumcu-gallery-content">
        <div className="tumcu-gallery-toolbar">
          <div className="tumcu-gallery-filters"><Filter size={15} />{categories.map((cat) => <button key={cat} className={selectedCategory === cat ? 'active' : ''} onClick={() => setSelectedCategory(cat)}>{cat === 'all' ? 'All' : cat.replace(' Services', '')}</button>)}</div>
          <div className="tumcu-gallery-view"><Grid2X2 size={17} />{isMediaLeader && <button className="tumcu-btn green" onClick={openAdd}><Plus size={15} /> New Album</button>}</div>
        </div>

        {isLoading ? <div className="tumcu-gallery-grid">{[1,2,3,4,5,6].map((i) => <div className="tumcu-gallery-card skeleton" key={i} />)}</div> : albums.length === 0 ? <div className="tumcu-empty"><ImageIcon size={40} /><h3>No gallery albums yet</h3><p>Published photo collections will appear here.</p></div> : <div className="tumcu-gallery-grid">{albums.map((album, index) => <article key={album.id} className="tumcu-gallery-card">
          <div className="tumcu-gallery-image"><img src={album.cover_image_url || fallbackImages[index % fallbackImages.length]} alt={album.title} /><span className="tumcu-gallery-tag">{album.category}</span>{isMediaLeader && !album.is_published && <span className="tumcu-unpublished"><EyeOff size={11} /> Unpublished</span>}<span className="tumcu-photo-count"><ImageIcon size={12} /> {album.photo_count}</span></div>
          <div className="tumcu-gallery-body"><div className="tumcu-gallery-date"><Calendar size={12} /> {new Date(album.event_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div><h3>{album.title}</h3>{album.description && <p>{album.description}</p>}<div className="tumcu-gallery-actions">{album.google_photos_url ? <a href={album.google_photos_url} target="_blank" rel="noopener noreferrer" className="tumcu-btn green"><ExternalLink size={13} /> View Album</a> : <button className="tumcu-btn muted" disabled>Photos Coming Soon</button>}{isMediaLeader && <><button className="icon-btn" onClick={() => openEdit(album)}><Edit2 size={14} /></button><button className="icon-btn danger" onClick={() => { if (window.confirm(`Delete "${album.title}" album?`)) deleteMutation.mutate(album.id); }}><Trash2 size={14} /></button></>}</div></div>
        </article>)}</div>}
      </section>

      {isModalOpen && <div className="tumcu-modal-backdrop"><div className="tumcu-modal"><div className="tumcu-modal-head"><h3>{editingAlbum ? 'Edit Gallery Album' : 'Create Gallery Album'}</h3><button onClick={() => setIsModalOpen(false)}><X size={18} /></button></div><form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}>
        <label>Album Title<Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <div className="two-col"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.filter((c) => c !== 'all').map((c) => <option key={c}>{c}</option>)}</select></label><label>Event Date<Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required /></label></div>
        <label>Google Photos Album Link<Input type="url" value={form.google_photos_url} onChange={(e) => setForm({ ...form, google_photos_url: e.target.value })} placeholder="https://photos.google.com/share/..." required /></label>
        <div className="two-col"><label>Cover Image URL<Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} required /></label><label>Photo Count<Input type="number" min="1" value={form.photo_count} onChange={(e) => setForm({ ...form, photo_count: Number(e.target.value) })} required /></label></div>
        <label>Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label className="check-row"><input type="checkbox" checked={Boolean(form.is_published)} onChange={(e) => setForm({ ...form, is_published: e.target.checked ? 1 : 0 })} /> Publish immediately</label>
        <div className="tumcu-modal-actions"><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={saveMutation.isPending} className="bg-[#006633] text-white">{saveMutation.isPending ? 'Saving…' : editingAlbum ? 'Save Changes' : 'Create Album'}</Button></div>
      </form></div></div>}
    </div>
  );
}
