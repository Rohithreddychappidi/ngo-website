import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')))
      .then(snap => { setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function markRead(msg) {
    setSelected(msg);
    if (!msg.read) {
      await updateDoc(doc(db, 'contact_messages', msg.id), { read: true });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this message?')) return;
    await deleteDoc(doc(db, 'contact_messages', id));
    setMessages(prev => prev.filter(m => m.id !== id));
    setSelected(null);
  }

  const unread = messages.filter(m => !m.read).length;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Contact Messages</h1>
        {unread > 0 && <span style={{ background: 'var(--primary)', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>{unread} unread</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>Loading...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No messages yet.</td></tr>
              ) : messages.map(m => (
                <tr key={m.id} style={{ fontWeight: m.read ? 400 : 700, cursor: 'pointer' }} onClick={() => markRead(m)}>
                  <td>
                    <div>
                      <div style={{ fontWeight: m.read ? 500 : 700 }}>{m.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-light)' }}>{m.email}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {!m.read && <span style={{ width: 7, height: 7, background: 'var(--primary)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />}
                      {m.subject}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{m.createdAt ? format(new Date(m.createdAt), 'MMM d') : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={e => { e.stopPropagation(); markRead(m); }} style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--surface-alt)', border: '1px solid var(--border)', cursor: 'pointer' }}><Eye size={13} /></button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(m.id); }} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="admin-card" style={{ padding: 24, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{selected.subject}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'var(--surface-alt)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{selected.name}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-light)' }}>{selected.email} {selected.phone && `· ${selected.phone}`}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 4 }}>{selected.createdAt ? format(new Date(selected.createdAt), 'MMMM d, yyyy h:mm a') : '—'}</div>
            </div>
            <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: 16, fontSize: '0.92rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
              {selected.message}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Reply via Email</a>
              <button onClick={() => handleDelete(selected.id)} style={{ padding: '8px 16px', borderRadius: 50, border: '1.5px solid rgba(231,76,60,0.4)', background: 'transparent', color: '#e74c3c', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
