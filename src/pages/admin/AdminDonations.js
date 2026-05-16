import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from './AdminLayout';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getDocs(query(collection(db, 'donations'), orderBy('createdAt', 'desc')))
      .then(snap => { setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = donations.filter(d =>
    !filter || d.userName?.toLowerCase().includes(filter.toLowerCase()) ||
    d.causeTitle?.toLowerCase().includes(filter.toLowerCase())
  );

  const total = filtered.reduce((s, d) => s + (d.amount || 0), 0);

  function exportCSV() {
    const header = 'Donor,Email,Cause,Amount,Payment ID,Date\n';
    const rows = filtered.map(d =>
      `${d.anonymous ? 'Anonymous' : d.userName},${d.userEmail},${d.causeTitle},${d.amount},${d.paymentId},${d.createdAt ? format(new Date(d.createdAt), 'yyyy-MM-dd') : ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'donations.csv'; a.click();
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Donations</h1>
        <button className="btn-primary" onClick={exportCSV}><Download size={16} /> Export CSV</button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search by donor or cause..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: 50, fontSize: '0.88rem', outline: 'none', minWidth: 260 }}
        />
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 18px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Total (filtered)</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>₹{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Email</th>
              <th>Cause</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Payment ID</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No donations found.</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {d.userPhoto && !d.anonymous && <img src={d.userPhoto} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />}
                    <span>{d.anonymous ? '🔒 Anonymous' : d.userName}</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>{d.anonymous ? '—' : d.userEmail}</td>
                <td>{d.causeTitle}</td>
                <td><span style={{ background: 'rgba(232,82,26,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>{d.causeCategory}</span></td>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{d.amount}</td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>{d.paymentId?.slice(0, 16)}...</td>
                <td>{d.createdAt ? format(new Date(d.createdAt), 'MMM d, yyyy') : '—'}</td>
                <td><span className={`status-badge ${d.status === 'success' ? 'status-success' : 'status-pending'}`}>{d.status || 'success'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
