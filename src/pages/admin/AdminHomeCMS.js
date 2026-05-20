import React, { useState, useEffect, useRef } from 'react';
import { cms } from '../../services/api';
import AdminLayout from './AdminLayout';
import { Save, Upload, ChevronDown, ChevronUp, Image, X } from 'lucide-react';
import './AdminHomeCMS.css';

// ─── Default content ──────────────────────────────────────────────────────────
const DEFAULTS = {
  // Hero
  'hero.label':           'Aneesha Joy Foundation',
  'hero.headline':        'Transform Lives With Every Donation',
  'hero.subheadline':     'Join Aneesha Joy Foundation in creating meaningful change across Visakhapatnam — one cause at a time.',
  'hero.ctaText':         'Start Donating',
  'hero.learnMoreText':   'Learn More',
  'hero.bgImage':         'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80',

  // Causes section
  'causes.label':    'Make an Impact',
  'causes.title':    'Choose a Cause to Support',
  'causes.subtitle': 'From food to education, every contribution creates lasting change.',

  // Transparency section
  'transparency.label':    'Why Trust Us',
  'transparency.title':    'Our Commitment to Transparency',
  'transparency.subtitle': 'Every contribution is documented, verified, and shared with our donors.',
  'transparency.card1.title': 'Donor Recognition',
  'transparency.card1.desc':  'Every donation is acknowledged with the donor\'s name, creating a transparent record.',
  'transparency.card2.title': 'Photo Documentation',
  'transparency.card2.desc':  'Every donor\'s contribution is backed with photo proof of the real impact.',
  'transparency.card3.title': 'Video Documentation',
  'transparency.card3.desc':  'Transparency shown through video, highlighting the real difference your support makes.',

  // Volunteer section
  'volunteer.label':   'Get Involved',
  'volunteer.title':   'Become a Volunteer',
  'volunteer.subtitle':'Join our growing family of changemakers. Your time and skills can transform lives.',
  'volunteer.ctaText': 'Join as Volunteer',
  'volunteer.perk1':   'Make a real, visible difference',
  'volunteer.perk2':   'Certificate of appreciation',
  'volunteer.perk3':   'Community of like-minded individuals',
  'volunteer.perk4':   'Flexible commitment, any skill set welcome',
  'volunteer.image':   'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=700&q=80',

  // CTA Banner
  'cta.title':    'Ready to Make a Difference?',
  'cta.subtitle': 'Reach out to us. Every question, every idea, and every offer of help matters.',
  'cta.btn1':     'Contact Us',
  'cta.btn2':     'Donate Now',
};

// ─── Reusable components ──────────────────────────────────────────────────────
const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', background: 'white' };
const lbl = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 };

function Field({ label, fieldKey, values, onChange, multiline }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      {multiline
        ? <textarea value={values[fieldKey] ?? DEFAULTS[fieldKey] ?? ''} onChange={e => onChange(fieldKey, e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
        : <input type="text" value={values[fieldKey] ?? DEFAULTS[fieldKey] ?? ''} onChange={e => onChange(fieldKey, e.target.value)} style={inp} />
      }
    </div>
  );
}

function ImageField({ label, fieldKey, values, onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const currentUrl = values[fieldKey] || DEFAULTS[fieldKey] || '';

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await cms.uploadImage(fd);
      onChange(fieldKey, res.url);
    } catch { alert('Upload failed. Try again.'); }
    setUploading(false);
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {currentUrl && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={currentUrl} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1.5px solid var(--border)' }} />
            <button onClick={() => onChange(fieldKey, '')} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#e74c3c', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', border: '1.5px dashed var(--primary)', borderRadius: 8, background: 'rgba(232,82,26,0.04)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}>
            <Upload size={15} /> {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 5 }}>JPG, PNG, WebP — max 10MB</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, sectionKey, expanded, onToggle, children, onSave, saving }) {
  return (
    <div className="cms-section-card">
      <div className="cms-section-header" onClick={() => onToggle(sectionKey)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
          <h3>{title}</h3>
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {expanded && (
        <div className="cms-section-body">
          {children}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button className="btn-primary" onClick={() => onSave(sectionKey)} disabled={saving[sectionKey]} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={14} /> {saving[sectionKey] ? 'Saving...' : 'Save Section'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminHomeCMS() {
  const [values, setValues]   = useState({});
  const [expanded, setExpanded] = useState({ hero: true });
  const [saving, setSaving]   = useState({});
  const [lastSaved, setLastSaved] = useState({});

  useEffect(() => {
    cms.get('homepage')
      .then(data => { if (data && Object.keys(data).length) setValues(data); })
      .catch(() => {});
  }, []);

  const onChange = (key, val) => setValues(prev => ({ ...prev, [key]: val }));
  const toggle   = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Only save fields belonging to the section prefix
  const saveSection = async (prefix) => {
    setSaving(prev => ({ ...prev, [prefix]: true }));
    try {
      const fields = Object.fromEntries(
        Object.entries(values).filter(([k]) => k.startsWith(prefix + '.') || k === prefix)
      );
      // Also save defaults for any fields not yet changed
      Object.keys(DEFAULTS)
        .filter(k => k.startsWith(prefix + '.'))
        .forEach(k => { if (!(k in fields)) fields[k] = DEFAULTS[k]; });

      await cms.save('homepage', fields);
      setLastSaved(prev => ({ ...prev, [prefix]: new Date().toLocaleTimeString() }));
    } catch { alert('Save failed. Check backend is running.'); }
    setSaving(prev => ({ ...prev, [prefix]: false }));
  };

  const val = (key) => values[key] ?? DEFAULTS[key] ?? '';

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Home Page CMS</h1>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Changes reflect instantly on the live site</span>
      </div>

      {/* Live preview link */}
      <div style={{ background: 'rgba(232,82,26,0.06)', border: '1px solid rgba(232,82,26,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Image size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem' }}>Preview: </span>
        <a href="/" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Open Home Page ↗</a>
      </div>

      {/* ── Hero Section ── */}
      <Section title="Hero Section" icon="🎯" sectionKey="hero" expanded={expanded.hero} onToggle={toggle} onSave={saveSection} saving={saving}>
        {lastSaved.hero && <p style={{ fontSize: '0.75rem', color: 'green', marginBottom: 10 }}>✓ Saved at {lastSaved.hero}</p>}
        <ImageField label="Background Image" fieldKey="hero.bgImage" values={values} onChange={onChange} />
        <Field label="Top Label (small text above headline)" fieldKey="hero.label" values={values} onChange={onChange} />
        <Field label="Main Headline" fieldKey="hero.headline" values={values} onChange={onChange} />
        <Field label="Subheading" fieldKey="hero.subheadline" values={values} onChange={onChange} multiline />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Primary Button Text" fieldKey="hero.ctaText" values={values} onChange={onChange} />
          <Field label="Secondary Button Text" fieldKey="hero.learnMoreText" values={values} onChange={onChange} />
        </div>
        <div style={{ background: 'var(--bg-soft)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-mid)' }}>
          ℹ️ Stats (₹ Raised, Donors, Causes) are pulled automatically from the database.
        </div>
      </Section>

      {/* ── Causes Section ── */}
      <Section title="Causes Section" icon="❤️" sectionKey="causes" expanded={expanded.causes} onToggle={toggle} onSave={saveSection} saving={saving}>
        {lastSaved.causes && <p style={{ fontSize: '0.75rem', color: 'green', marginBottom: 10 }}>✓ Saved at {lastSaved.causes}</p>}
        <Field label="Section Label (small text)" fieldKey="causes.label" values={values} onChange={onChange} />
        <Field label="Section Title" fieldKey="causes.title" values={values} onChange={onChange} />
        <Field label="Section Subtitle" fieldKey="causes.subtitle" values={values} onChange={onChange} multiline />
        <div style={{ background: 'var(--bg-soft)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-mid)' }}>
          ℹ️ Cause cards are managed in <strong>Causes</strong> section of the admin panel.
        </div>
      </Section>

      {/* ── Transparency Section ── */}
      <Section title="Transparency Section" icon="🔍" sectionKey="transparency" expanded={expanded.transparency} onToggle={toggle} onSave={saveSection} saving={saving}>
        {lastSaved.transparency && <p style={{ fontSize: '0.75rem', color: 'green', marginBottom: 10 }}>✓ Saved at {lastSaved.transparency}</p>}
        <Field label="Section Label" fieldKey="transparency.label" values={values} onChange={onChange} />
        <Field label="Section Title" fieldKey="transparency.title" values={values} onChange={onChange} />
        <Field label="Section Subtitle" fieldKey="transparency.subtitle" values={values} onChange={onChange} multiline />
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
        <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 12 }}>3 Feature Cards</p>
        <div style={{ display: 'grid', gap: 16 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ background: 'var(--bg-soft)', borderRadius: 10, padding: 14 }}>
              <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary)', marginBottom: 10 }}>Card {n}</p>
              <Field label="Card Title" fieldKey={`transparency.card${n}.title`} values={values} onChange={onChange} />
              <Field label="Card Description" fieldKey={`transparency.card${n}.desc`} values={values} onChange={onChange} multiline />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Volunteer Section ── */}
      <Section title="Volunteer Section" icon="🤝" sectionKey="volunteer" expanded={expanded.volunteer} onToggle={toggle} onSave={saveSection} saving={saving}>
        {lastSaved.volunteer && <p style={{ fontSize: '0.75rem', color: 'green', marginBottom: 10 }}>✓ Saved at {lastSaved.volunteer}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <Field label="Section Label" fieldKey="volunteer.label" values={values} onChange={onChange} />
            <Field label="Section Title" fieldKey="volunteer.title" values={values} onChange={onChange} />
            <Field label="Subtitle" fieldKey="volunteer.subtitle" values={values} onChange={onChange} multiline />
            <Field label="CTA Button Text" fieldKey="volunteer.ctaText" values={values} onChange={onChange} />
          </div>
          <div>
            <ImageField label="Section Image" fieldKey="volunteer.image" values={values} onChange={onChange} />
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
        <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 12 }}>Bullet Points (4 perks)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[1, 2, 3, 4].map(n => (
            <Field key={n} label={`Perk ${n}`} fieldKey={`volunteer.perk${n}`} values={values} onChange={onChange} />
          ))}
        </div>
      </Section>

      {/* ── CTA Banner ── */}
      <Section title="Bottom CTA Banner" icon="📣" sectionKey="cta" expanded={expanded.cta} onToggle={toggle} onSave={saveSection} saving={saving}>
        {lastSaved.cta && <p style={{ fontSize: '0.75rem', color: 'green', marginBottom: 10 }}>✓ Saved at {lastSaved.cta}</p>}
        <Field label="Title" fieldKey="cta.title" values={values} onChange={onChange} />
        <Field label="Subtitle" fieldKey="cta.subtitle" values={values} onChange={onChange} multiline />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Button 1 Text" fieldKey="cta.btn1" values={values} onChange={onChange} />
          <Field label="Button 2 Text" fieldKey="cta.btn2" values={values} onChange={onChange} />
        </div>
      </Section>
    </AdminLayout>
  );
}