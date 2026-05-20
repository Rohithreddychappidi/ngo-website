import React, { useState, useEffect, useRef } from 'react';
import { blog as blogApi, cms } from '../../services/api';
import AdminLayout from './AdminLayout';
import { Plus, Pencil, Trash2, X, Upload, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Food', 'Birthday', 'Environment', 'Animals', 'Education', 'Orphanage', 'Healthcare', 'General', 'Volunteers'];

const EMPTY = { title: '', category: 'General', authorName: '', excerpt: '', content: '', coverUrl: '', published: true };

const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', background: 'white' };
const lbl = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 };

// Blog page hero defaults
const HERO_D = {
  'blog.hero.label':    'Stories & Updates',
  'blog.hero.title':    'Our Blog',
  'blog.hero.subtitle': 'Impact stories, volunteer highlights, and field updates from the ground.',
};

function ImageUpload({ url, onUpload, onClear }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const file = e.target.files[0]; if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await cms.uploadImage(fd);
      onUpload(res.url);
    } catch { alert('Image upload failed'); }
    setBusy(false);
  }

  return (
    <div>
      <label style={lbl}>Cover Image</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {url && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={url} alt="cover" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1.5px solid var(--border)' }} />
            <button onClick={onClear} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#e74c3c', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
          </div>
        )}
        <button onClick={() => ref.current.click()} disabled={busy}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', border: '1.5px dashed var(--primary)', borderRadius: 8, background: 'rgba(232,82,26,0.04)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <Upload size={15} /> {busy ? 'Uploading...' : 'Upload Cover Image'}
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 5 }}>JPG, PNG, WebP — max 10MB</p>
    </div>
  );
}

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Blog page hero CMS
  const [heroVals, setHeroVals] = useState({});
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSaved, setHeroSaved] = useState('');
  const [heroOpen, setHeroOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
    cms.get('blog').then(data => { if (data) setHeroVals(data); }).catch(() => {});
  }, []);

  async function fetchPosts() {
    try { setPosts(await blogApi.getAllAdmin()); } catch {}
  }

  function openAdd() { setEditing(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(p) {
    setEditing(p);
    setForm({ title: p.title || '', category: p.category || 'General', authorName: p.authorName || '', excerpt: p.excerpt || '', content: p.content || '', coverUrl: p.coverUrl || '', published: p.published !== false });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Send as JSON (content is plain text, no file in this form)
      const fd = new FormData();
      fd.append('title',      form.title);
      fd.append('category',   form.category);
      fd.append('authorName', form.authorName);
      fd.append('excerpt',    form.excerpt);
      fd.append('content',    form.content);
      fd.append('cover_url',  form.coverUrl);
      fd.append('published',  String(form.published));
      if (editing) await blogApi.update(editing.id, fd);
      else await blogApi.create(fd);
      await fetchPosts();
      setShowModal(false);
    } catch (err) { alert('Error: ' + err.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return;
    await blogApi.remove(id);
    fetchPosts();
  }

  async function saveHero() {
    setHeroSaving(true);
    try {
      await cms.save('blog', {
        'blog.hero.label':    heroVals['blog.hero.label']    || HERO_D['blog.hero.label'],
        'blog.hero.title':    heroVals['blog.hero.title']    || HERO_D['blog.hero.title'],
        'blog.hero.subtitle': heroVals['blog.hero.subtitle'] || HERO_D['blog.hero.subtitle'],
      });
      setHeroSaved(new Date().toLocaleTimeString());
    } catch { alert('Save failed'); }
    setHeroSaving(false);
  }

  const hv = (k) => heroVals[k] ?? HERO_D[k] ?? '';

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Blog Management</h1>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> New Post</button>
      </div>

      {/* Blog Page Hero CMS */}
      <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 14, marginBottom: 20, overflow: 'hidden' }}>
        <div onClick={() => setHeroOpen(!heroOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', userSelect: 'none', background: 'var(--bg-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🖊️</span>
            <strong style={{ fontSize: '0.92rem' }}>Blog Page Header Text</strong>
          </div>
          {heroOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {heroOpen && (
          <div style={{ padding: 20 }}>
            {heroSaved && <p style={{ fontSize: '0.75rem', color: 'green', marginBottom: 10 }}>✓ Saved at {heroSaved}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[['blog.hero.label', 'Small Label'], ['blog.hero.title', 'Page Title'], ['blog.hero.subtitle', 'Subtitle']].map(([k, lab]) => (
                <div key={k}>
                  <label style={lbl}>{lab}</label>
                  <input type="text" value={hv(k)} onChange={e => setHeroVals(p => ({ ...p, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={saveHero} disabled={heroSaving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={14} /> {heroSaving ? 'Saving...' : 'Save Header'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Cover</th><th>Title</th><th>Category</th><th>Author</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {posts.length === 0
              ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No blog posts yet. Click "New Post" to create one.</td></tr>
              : posts.map(p => (
                <tr key={p.id}>
                  <td>{p.coverUrl ? <img src={p.coverUrl} alt="" style={{ width: 60, height: 42, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 60, height: 42, background: 'var(--bg-soft)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📝</div>}</td>
                  <td><strong style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</strong></td>
                  <td><span style={{ background: 'var(--bg-soft)', padding: '2px 8px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{p.category}</span></td>
                  <td>{p.authorName}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{p.createdAt ? format(new Date(p.createdAt), 'MMM d, yy') : '—'}</td>
                  <td><span className={`status-badge ${p.published ? 'status-success' : 'status-pending'}`}>{p.published ? 'Published' : 'Draft'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(p)} style={{ padding: '5px 10px', borderRadius: 6, background: 'var(--surface-alt)', border: '1px solid var(--border)', cursor: 'pointer' }}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="modal-form-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-form-box" style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'sticky', top: 0, float: 'right', background: 'var(--surface-alt)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', zIndex: 10 }}><X size={16} /></button>
            <h2 style={{ marginBottom: 20 }}>{editing ? 'Edit Post' : 'New Blog Post'}</h2>
            <form onSubmit={handleSave}>

              {/* Cover Image Upload */}
              <div style={{ marginBottom: 16 }}>
                <ImageUpload
                  url={form.coverUrl}
                  onUpload={url => setForm(f => ({ ...f, coverUrl: url }))}
                  onClear={() => setForm(f => ({ ...f, coverUrl: '' }))}
                />
              </div>

              {/* Title */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Post Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} placeholder="e.g. How We Fed 500 Families This Diwali" required />
              </div>

              {/* Category + Author + Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Author Name</label>
                  <input type="text" value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} style={inp} placeholder="Aneesha Joy" />
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select value={form.published ? 'published' : 'draft'} onChange={e => setForm(f => ({ ...f, published: e.target.value === 'published' }))} style={inp}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Excerpt (short summary shown on blog listing)</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Brief summary of the post..." />
              </div>

              {/* Full Content */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Full Content (plain text — press Enter twice between paragraphs)</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} placeholder={`Write the full story here...\n\nEach blank line creates a new paragraph on the post page.\n\nNo HTML needed — just plain text.`} />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 4 }}>Tip: Press Enter twice to start a new paragraph.</p>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Post' : 'Publish Post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}