import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'volunteers'), orderBy('createdAt', 'desc')))
      .then(snap => { setVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    await updateDoc(doc(db, 'volunteers', id), { status });
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this application?')) return;
    await deleteDoc(doc(db, 'volunteers', id));
    setVolunteers(prev => prev.filter(v => v.id !== id));
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Volunteer Applications</h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{volunteers.length} applications</span>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Availability</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>Loading...</td></tr>
            ) : volunteers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No applications yet.</td></tr>
            ) : volunteers.map(v => (
              <tr key={v.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {v.userPhoto && <img src={v.userPhoto} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
                    <div>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-light)' }}>{v.email}</div>
                    </div>
                  </div>
                </td>
                <td>{v.phone}</td>
                <td>{v.role}</td>
                <td>{v.availability}</td>
                <td>{v.createdAt ? format(new Date(v.createdAt), 'MMM d, yyyy') : '—'}</td>
                <td>
                  <select
                    value={v.status || 'pending'}
                    onChange={e => updateStatus(v.id, e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.8rem', background: 'white' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleDelete(v.id)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', cursor: 'pointer', color: '#e74c3c' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
