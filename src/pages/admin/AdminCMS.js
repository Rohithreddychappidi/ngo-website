import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminLayout from './AdminLayout';
import { Save, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function AdminCMS() {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState({});
  const [expanded, setExpanded] = useState({ homepage: true });

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

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>CMS — Page Content</h1>
      </div>
      <p style={{ color: 'var(--text-mid)', marginBottom: 24, fontSize: '0.9rem' }}>
        Edit text, images, and copy for each page. Click Save to apply changes to the website.
      </p>

      {PAGES.map(page => (
        <div key={page.key} className="admin-card" style={{ marginBottom: 16 }}>
          <div
            className="card-header"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setExpanded(prev => ({ ...prev, [page.key]: !prev[page.key] }))}
          >
            <h3>{page.label}</h3>
            {expanded[page.key] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {expanded[page.key] && (
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {page.fields.map(field => (
                  <div key={field.key} className="form-field" style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : undefined }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                      {field.label}
                    </label>
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
