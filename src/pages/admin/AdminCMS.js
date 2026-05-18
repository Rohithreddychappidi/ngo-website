import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Save, ChevronDown, ChevronUp, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

// ─── CMS Pages ────────────────────────────────────────────────────────────────

const PAGES = [
  {
    key: 'homepage',
    label: 'Home Page',
    fields: [
      { key: 'hero.headline', label: 'Hero Headline', type: 'text' },
      { key: 'hero.subheadline', label: 'Hero Subheadline', type: 'textarea' },
      { key: 'hero.ctaText', label: 'Hero CTA Button Text', type: 'text' },
      { key: 'hero.bgImage', label: 'Hero Background Image URL', type: 'text' },
      { key: 'causesSection.title', label: 'Causes Section Title', type: 'text' },
      { key: 'causesSection.subtitle', label: 'Causes Section Subtitle', type: 'textarea' },
      { key: 'transparency.title', label: 'Transparency Section Title', type: 'text' },
      { key: 'transparency.subtitle', label: 'Transparency Subtitle', type: 'textarea' },
      { key: 'volunteer.title', label: 'Volunteer Section Title', type: 'text' },
      { key: 'volunteer.subtitle', label: 'Volunteer Subtitle', type: 'textarea' },
      { key: 'volunteer.ctaText', label: 'Volunteer CTA Text', type: 'text' },
      { key: 'volunteer.image', label: 'Volunteer Section Image URL', type: 'text' },
    ]
  },
  {
    key: 'about',
    label: 'About Page',
    fields: [
      { key: 'heroTitle', label: 'Hero Title', type: 'text' },
      { key: 'heroSubtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'heroImage', label: 'Hero Background Image URL', type: 'text' },
      { key: 'mission', label: 'Mission Statement', type: 'textarea' },
      { key: 'vision', label: 'Vision Statement', type: 'textarea' },
      { key: 'story', label: 'Our Story (separate paragraphs with blank lines)', type: 'textarea', rows: 8 },
      { key: 'teamTitle', label: 'Team Section Title', type: 'text' },
    ]
  },
  {
    key: 'gallery',
    label: 'Gallery Page',
    fields: [
      { key: 'title', label: 'Page Title', type: 'text' },
      { key: 'subtitle', label: 'Page Subtitle', type: 'text' },
    ]
  },
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : ''), obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const result = { ...obj };
  let cur = result;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] || {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return result;
}

// ─── Donation Plans Section ───────────────────────────────────────────────────

const EMPTY_PLAN = { name: '', amount: '', perks: [''], featured: false, order: 99 };

function DonationPlansAdmin() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newPlan, setNewPlan] = useState(EMPTY_PLAN);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'donationPlans'), orderBy('order', 'asc')));
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      setPlans([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSavePlan = async (plan) => {
    setSaving(true);
    try {
      const data = {
        name: plan.name,
        amount: Number(plan.amount),
        perks: plan.perks.filter(p => p.trim() !== ''),
        featured: plan.featured || false,
        order: Number(plan.order) || 99,
      };
      if (plan.id && plan.id !== 'new') {
        await updateDoc(doc(db, 'donationPlans', plan.id), data);
      } else {
        await addDoc(collection(db, 'donationPlans'), data);
      }
      await fetchPlans();
      setEditingId(null);
      setAdding(false);
      setNewPlan(EMPTY_PLAN);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    await deleteDoc(doc(db, 'donationPlans', id));
    fetchPlans();
  };

  const PerkInputs = ({ perks, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {perks.map((perk, i) => (
        <div key={i} style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={perk}
            placeholder={`Perk ${i + 1}`}
            onChange={e => {
              const updated = [...perks];
              updated[i] = e.target.value;
              onChange(updated);
            }}
            style={inputStyle}
          />
          <button
            onClick={() => onChange(perks.filter((_, idx) => idx !== i))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...perks, ''])}
        style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: 0 }}
      >
        + Add perk
      </button>
    </div>
  );

  const PlanForm = ({ plan, onChange, onSave, onCancel }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 0' }}>
      <div>
        <label style={labelStyle}>Plan Name</label>
        <input type="text" value={plan.name} onChange={e => onChange({ ...plan, name: e.target.value })} style={inputStyle} placeholder="e.g. Supporter" />
      </div>
      <div>
        <label style={labelStyle}>Amount (₹)</label>
        <input type="number" value={plan.amount} onChange={e => onChange({ ...plan, amount: e.target.value })} style={inputStyle} placeholder="e.g. 500" min={1} />
      </div>
      <div>
        <label style={labelStyle}>Display Order</label>
        <input type="number" value={plan.order} onChange={e => onChange({ ...plan, order: e.target.value })} style={inputStyle} placeholder="1, 2, 3..." min={1} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
        <input type="checkbox" id="featured" checked={plan.featured} onChange={e => onChange({ ...plan, featured: e.target.checked })} />
        <label htmlFor="featured" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mark as Featured (Most Popular)</label>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={labelStyle}>Perks (bullet points shown on card)</label>
        <PerkInputs perks={plan.perks || ['']} onChange={perks => onChange({ ...plan, perks })} />
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onCancel} style={{ padding: '8px 16px' }}>Cancel</button>
        <button className="btn-primary" onClick={() => onSave(plan)} disabled={saving} style={{ padding: '8px 16px' }}>
          <Check size={14} /> {saving ? 'Saving...' : 'Save Plan'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {loading ? (
        <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem' }}>Loading plans...</p>
      ) : plans.length === 0 && !adding ? (
        <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem' }}>No donation plans yet. Add one below.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '14px 18px', background: plan.featured ? 'rgba(232,82,26,0.04)' : 'white' }}>
              {editingId === plan.id ? (
                <PlanForm
                  plan={editData}
                  onChange={setEditData}
                  onSave={handleSavePlan}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{plan.name}</span>
                    {plan.featured && <span style={{ marginLeft: 8, fontSize: '0.72rem', background: 'var(--primary)', color: 'white', borderRadius: 4, padding: '2px 7px' }}>Featured</span>}
                    <span style={{ marginLeft: 12, color: 'var(--primary)', fontWeight: 600 }}>₹{plan.amount}</span>
                    <span style={{ marginLeft: 12, color: 'var(--text-mid)', fontSize: '0.82rem' }}>Order: {plan.order}</span>
                    <div style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-mid)' }}>
                      {(plan.perks || []).join(' · ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setEditingId(plan.id); setEditData({ ...plan, perks: plan.perks || [''] }); }}
                      style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      style={{ background: 'none', border: '1.5px solid #fecaca', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div style={{ border: '1.5px dashed var(--primary)', borderRadius: 10, padding: '14px 18px', marginTop: 12 }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8, color: 'var(--primary)' }}>New Plan</p>
          <PlanForm
            plan={newPlan}
            onChange={setNewPlan}
            onSave={handleSavePlan}
            onCancel={() => { setAdding(false); setNewPlan(EMPTY_PLAN); }}
          />
        </div>
      ) : (
        <button
          className="btn-primary"
          style={{ marginTop: 16, padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setAdding(true)}
        >
          <Plus size={15} /> Add New Plan
        </button>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
  borderRadius: 8, fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box'
};
const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-mid)',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5
};

// ─── Main AdminCMS Component ──────────────────────────────────────────────────

export default function AdminCMS() {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState({});
  const [expanded, setExpanded] = useState({ homepage: true, donationPlans: true });

  useEffect(() => {
    PAGES.forEach(async page => {
      const snap = await getDoc(doc(db, 'cms', page.key));
      if (snap.exists()) setData(prev => ({ ...prev, [page.key]: snap.data() }));
    });
  }, []);

  function handleChange(pageKey, fieldKey, value) {
    setData(prev => ({
      ...prev,
      [pageKey]: setNestedValue(prev[pageKey] || {}, fieldKey, value)
    }));
  }

  async function handleSave(pageKey) {
    setSaving(prev => ({ ...prev, [pageKey]: true }));
    try {
      await setDoc(doc(db, 'cms', pageKey), data[pageKey] || {}, { merge: true });
      alert(`${pageKey} saved successfully!`);
    } catch (err) { alert('Save failed: ' + err.message); }
    setSaving(prev => ({ ...prev, [pageKey]: false }));
  }

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>CMS — Page Content</h1>
      </div>
      <p style={{ color: 'var(--text-mid)', marginBottom: 24, fontSize: '0.9rem' }}>
        Edit text, images, and copy for each page. Manage donation plans below.
      </p>

      {/* Donation Plans Section */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div
          className="card-header"
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => toggle('donationPlans')}
        >
          <h3>Donation Plans</h3>
          {expanded['donationPlans'] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {expanded['donationPlans'] && (
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginBottom: 16 }}>
              These plans appear on the public Donation page. Add, edit, or remove plans. A "Custom Amount" card is always shown automatically.
            </p>
            <DonationPlansAdmin />
          </div>
        )}
      </div>

      {/* Existing CMS Pages */}
      {PAGES.map(page => (
        <div key={page.key} className="admin-card" style={{ marginBottom: 16 }}>
          <div
            className="card-header"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => toggle(page.key)}
          >
            <h3>{page.label}</h3>
            {expanded[page.key] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expanded[page.key] && (
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {page.fields.map(field => (
                  <div key={field.key} className="form-field" style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : undefined }}>
                    <label style={labelStyle}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={getNestedValue(data[page.key] || {}, field.key) || ''}
                        onChange={e => handleChange(page.key, field.key, e.target.value)}
                        rows={field.rows || 3}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={getNestedValue(data[page.key] || {}, field.key) || ''}
                        onChange={e => handleChange(page.key, field.key, e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-body)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => handleSave(page.key)} disabled={saving[page.key]}>
                  <Save size={15} /> {saving[page.key] ? 'Saving...' : `Save ${page.label}`}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}