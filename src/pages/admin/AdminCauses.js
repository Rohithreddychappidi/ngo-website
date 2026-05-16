import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const CATEGORIES = ['Food', 'Birthday', 'Environment', 'Animals', 'Education', 'Orphanage', 'Healthcare', 'General'];
const EMPTY = { title: '', category: 'Food', amount: '', unit: '', description: '', imageUrl: '', active: true };

export default function AdminCauses() {
  const [causes, setCauses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCauses(); }, []);

  async function fetchCauses() {
    const snap = await getDocs(query(collection(db, 'causes'), orderBy('createdAt', 'desc')));
    setCauses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  function openAdd() { setEditing(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(c) { setEditing(c); setForm({ ...c }); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, amount: Number(form.amount), updatedAt: new Date().toISOString() };
    try {
      if (editing) {
        await updateDoc(doc(db, 'causes', editing.id), data);
      } else {
        await addDoc(collection(db, 'causes'), { ...data, createdAt: new Date().toISOString() });
      }
      await fetchCauses();
      setShowModal(false);
    } catch (err) { alert('Save failed: ' + err.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this cause?')) return;
    await deleteDoc(doc(db, 'causes', id));
    fetchCauses();
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Causes Management</h1>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Cause</button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {causes.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No causes yet. Click "Add Cause" to create one.</td></tr>
            ) : causes.map(c => (
              <tr key={c.id}>
                <td>
                  {c.imageUrl ? <img src={c.imageUrl} alt="" style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : '—'}
                </td>
                <td><strong>{c.title}</strong></td>
                <td>{c.category}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{c.amount}</td>
                <td>{c.unit}</td>
                <td><span className={`status-badge ${c.active !== false ? 'status-success' : 'status-pending'}`}>{c.active !== false ? 'Active' : 'Hidden'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(c)} style={{ padding: '5px 10px', borderRadius: 6, background: 'var(--surface-alt)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-mid)' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', cursor: 'pointer', color: '#e74c3c' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-form-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-form-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--surface-alt)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            <h2>{editing ? 'Edit Cause' : 'Add New Cause'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-field">
                <label>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Plant a Sapling" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-field">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={form.active ? 'active' : 'hidden'} onChange={e => setForm({ ...form, active: e.target.value === 'active' })}>
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-field">
                  <label>Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="50" required min={1} />
                </div>
                <div className="form-field">
                  <label>Unit *</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="sapling / meal / child" required />
                </div>
              </div>
              <div className="form-field">
                <label>Image URL</label>
                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Short description of this cause" />
              </div>
              <div className="modal-form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create Cause'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
