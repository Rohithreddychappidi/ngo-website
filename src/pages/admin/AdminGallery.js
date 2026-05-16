import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AdminLayout from './AdminLayout';
import { Plus, Trash2, X, Upload } from 'lucide-react';

const SECTIONS = ['Food', 'Birthday', 'Environment', 'Animals', 'Education', 'Orphanage', 'Healthcare', 'Volunteers', 'General'];

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ url: '', caption: '', section: 'General' });
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => { fetchPhotos(); }, []);

  async function fetchPhotos() {
    try {
      const snap = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
  }

  async function handleAdd(e) {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = form.url;
      if (file) {
        const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'gallery'), {
        url: imageUrl,
        caption: form.caption,
        section: form.section,
        createdAt: new Date().toISOString(),
      });
      await fetchPhotos();
      setShowModal(false);
      setForm({ url: '', caption: '', section: 'General' });
      setFile(null);
    } catch (err) { alert('Error: ' + err.message); }
    setUploading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this photo?')) return;
    await deleteDoc(doc(db, 'gallery', id));
    fetchPhotos();
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Gallery Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Photo</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {photos.map(photo => (
          <div key={photo.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: 'white' }}>
            <img src={photo.url} alt={photo.caption} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.caption || 'No caption'}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>{photo.section}</div>
            </div>
            <button
              onClick={() => handleDelete(photo.id)}
              style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(231,76,60,0.9)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {photos.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)' }}>
            No photos yet. Click "Add Photo" to get started.
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-form-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-form-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--surface-alt)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            <h2>Add Photo</h2>
            <form onSubmit={handleAdd}>
              <div className="form-field">
                <label>Upload Image</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ padding: '8px 12px' }} />
              </div>
              <div className="form-field">
                <label>— OR — Image URL</label>
                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-field">
                <label>Caption</label>
                <input value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} placeholder="Photo caption" />
              </div>
              <div className="form-field">
                <label>Section</label>
                <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
                  {SECTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal-form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploading}><Upload size={14} /> {uploading ? 'Uploading...' : 'Add Photo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
