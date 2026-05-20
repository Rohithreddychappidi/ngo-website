import React, { useState, useEffect, useRef } from 'react';
import { cms } from '../../services/api';
import AdminLayout from './AdminLayout';
import { Save, Upload, ChevronDown, ChevronUp, X, Plus, Trash2 } from 'lucide-react';

// ─── Defaults ─────────────────────────────────────────────────────────────────
const D = {
  'hero.label':    'Our Story',
  'hero.title':    'About Aneesha Joy Foundation',
  'hero.subtitle': 'A story of compassion, action, and community — rooted in Visakhapatnam, reaching hearts everywhere.',
  'hero.image':    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1400&q=80',

  'mission.title': 'Our Mission',
  'mission.text':  'Our mission is to uplift the underprivileged through transparent, community-driven initiatives spanning food, education, healthcare, and environmental care.',

  'vision.title': 'Our Vision',
  'vision.text':  'We envision a world where every child has access to education, every family has food on the table, and every community thrives with dignity.',

  'story.label':  'How It Started',
  'story.title':  'Our Story',
  'story.para1':  'Aneesha Joy Foundation was born from a simple belief — that small acts of kindness, done consistently and transparently, can transform entire communities.',
  'story.para2':  "Founded in Visakhapatnam, we began by organizing birthday celebrations for orphanage children and food drives in underserved neighborhoods. Today, we've grown into a multi-cause organization supporting food security, education, healthcare, animal welfare, and environmental conservation.",
  'story.para3':  'Every donation we receive is documented with photos and videos, shared with our community of donors. We believe in full transparency — because when you give, you deserve to see the difference it makes.',
  'story.image1': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=80',
  'story.image2': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80',

  'values.label': 'What We Stand For',
  'values.title': 'Our Core Values',
  'values.1.icon': '🔍', 'values.1.title': 'Transparency',   'values.1.desc': 'Every rupee is accounted for, with photo and video proof of impact.',
  'values.2.icon': '💛', 'values.2.title': 'Compassion',     'values.2.desc': 'We lead with empathy, treating every beneficiary with dignity.',
  'values.3.icon': '🤝', 'values.3.title': 'Community',      'values.3.desc': 'We believe in the power of community — donors, volunteers, and beneficiaries together.',
  'values.4.icon': '✅', 'values.4.title': 'Accountability',  'values.4.desc': 'We hold ourselves to the highest standards of integrity.',

  'team.label': 'People',
  'team.title': 'Meet Our Team',
  'team.count': '3',
  'team.1.name': 'Aneesha Joy P',      'team.1.role': 'Founder & Director',      'team.1.image': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  'team.2.name': 'Volunteer Leader',   'team.2.role': 'Head of Operations',      'team.2.image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  'team.3.name': 'Community Manager',  'team.3.role': 'Outreach Coordinator',    'team.3.image': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
};

// ─── Reusable UI ──────────────────────────────────────────────────────────────
const inp  = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', background: 'white' };
const lbl  = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 };
const card = { background: 'var(--bg-soft, #f9f9f9)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' };

function Field({ label, fk, vals, set, multiline, rows = 3 }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      {multiline
        ? <textarea value={vals[fk] ?? D[fk] ?? ''} onChange={e => set(fk, e.target.value)} rows={rows} style={{ ...inp, resize: 'vertical' }} />
        : <input type="text" value={vals[fk] ?? D[fk] ?? ''} onChange={e => set(fk, e.target.value)} style={inp} />
      }
    </div>
  );
}

function ImgField({ label, fk, vals, set }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const url = vals[fk] || D[fk] || '';

  async function pick(e) {
    const file = e.target.files[0]; if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await cms.uploadImage(fd);
      set(fk, res.url);
    } catch { alert('Upload failed'); }
    setBusy(false);
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {url && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={url} alt="" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, border: '1.5px solid var(--border)' }} />
            <button onClick={() => set(fk, '')} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#e74c3c', border: 'none', color: 'white', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
          </div>
        )}
        <button onClick={() => ref.current.click()} disabled={busy}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px dashed var(--primary)', borderRadius: 8, background: 'rgba(232,82,26,0.04)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
          <Upload size={13} /> {busy ? 'Uploading...' : 'Upload Image'}
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
      </div>
    </div>
  );
}

function Section({ title, icon, sk, exp, toggle, save, saving, saved, children }) {
  return (
    <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 14, marginBottom: 14, overflow: 'hidden' }}>
      <div onClick={() => toggle(sk)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: '1.1rem' }}>{icon}</span><h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{title}</h3></div>
        {exp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {exp && (
        <div style={{ padding: 20, borderTop: '1.5px solid var(--border)' }}>
          {saved && <p style={{ fontSize: '0.75rem', color: 'green', marginBottom: 10 }}>✓ Saved at {saved}</p>}
          {children}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button className="btn-primary" onClick={() => save(sk)} disabled={saving[sk]}>
              <Save size={14} /> {saving[sk] ? 'Saving...' : 'Save Section'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminAboutCMS() {
  const [vals, setVals]     = useState({});
  const [exp, setExp]       = useState({ hero: true });
  const [saving, setSaving] = useState({});
  const [saved, setSaved]   = useState({});
  const [teamCount, setTeamCount] = useState(3);

  useEffect(() => {
    cms.get('about').then(data => {
      if (data && Object.keys(data).length) {
        setVals(data);
        if (data['team.count']) setTeamCount(parseInt(data['team.count']) || 3);
      }
    }).catch(() => {});
  }, []);

  const set    = (k, v) => setVals(p => ({ ...p, [k]: v }));
  const toggle = (k)    => setExp(p => ({ ...p, [k]: !p[k] }));
  const v      = (k)    => vals[k] ?? D[k] ?? '';

  const saveSection = async (prefix) => {
    setSaving(p => ({ ...p, [prefix]: true }));
    try {
      const fields = {};
      // Collect all matching keys including defaults not yet changed
      Object.keys(D).filter(k => k.startsWith(prefix + '.') || k === prefix)
        .forEach(k => { fields[k] = vals[k] ?? D[k] ?? ''; });
      // Also grab any vals keys matching prefix
      Object.keys(vals).filter(k => k.startsWith(prefix + '.'))
        .forEach(k => { fields[k] = vals[k]; });
      await cms.save('about', fields);
      setSaved(p => ({ ...p, [prefix]: new Date().toLocaleTimeString() }));
    } catch { alert('Save failed'); }
    setSaving(p => ({ ...p, [prefix]: false }));
  };

  const addTeamMember = () => {
    const n = teamCount + 1;
    setTeamCount(n);
    set('team.count', String(n));
  };

  const removeTeamMember = (n) => {
    // Shift members down
    for (let i = n; i < teamCount; i++) {
      set(`team.${i}.name`,  vals[`team.${i + 1}.name`]  || '');
      set(`team.${i}.role`,  vals[`team.${i + 1}.role`]  || '');
      set(`team.${i}.image`, vals[`team.${i + 1}.image`] || '');
    }
    const n2 = teamCount - 1;
    setTeamCount(n2);
    set('team.count', String(n2));
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>About Page CMS</h1>
        <a href="/about" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Preview About Page ↗</a>
      </div>

      {/* Hero */}
      <Section title="Hero Section" icon="🖼️" sk="hero" exp={exp.hero} toggle={toggle} save={saveSection} saving={saving} saved={saved.hero}>
        <ImgField label="Background Image" fk="hero.image" vals={vals} set={set} />
        <Field label="Small Label (above title)" fk="hero.label" vals={vals} set={set} />
        <Field label="Page Title" fk="hero.title" vals={vals} set={set} />
        <Field label="Subtitle" fk="hero.subtitle" vals={vals} set={set} multiline />
      </Section>

      {/* Mission & Vision */}
      <Section title="Mission & Vision" icon="🎯" sk="mission" exp={exp.mission} toggle={toggle} save={saveSection} saving={saving} saved={saved.mission}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 10 }}>🎯 Mission Card</p>
            <Field label="Card Title" fk="mission.title" vals={vals} set={set} />
            <Field label="Mission Text" fk="mission.text" vals={vals} set={set} multiline rows={4} />
          </div>
          <div style={card}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 10 }}>🌟 Vision Card</p>
            <Field label="Card Title" fk="vision.title" vals={vals} set={set} />
            <Field label="Vision Text" fk="vision.text" vals={vals} set={set} multiline rows={4} />
          </div>
        </div>
      </Section>

      {/* Story */}
      <Section title="Our Story Section" icon="📖" sk="story" exp={exp.story} toggle={toggle} save={saveSection} saving={saving} saved={saved.story}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <Field label="Section Label" fk="story.label" vals={vals} set={set} />
          <Field label="Section Title" fk="story.title" vals={vals} set={set} />
        </div>
        <Field label="Paragraph 1" fk="story.para1" vals={vals} set={set} multiline rows={4} />
        <Field label="Paragraph 2" fk="story.para2" vals={vals} set={set} multiline rows={4} />
        <Field label="Paragraph 3" fk="story.para3" vals={vals} set={set} multiline rows={4} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
          <ImgField label="Story Image 1 (large)" fk="story.image1" vals={vals} set={set} />
          <ImgField label="Story Image 2 (small)" fk="story.image2" vals={vals} set={set} />
        </div>
      </Section>

      {/* Values */}
      <Section title="Core Values" icon="💎" sk="values" exp={exp.values} toggle={toggle} save={saveSection} saving={saving} saved={saved.values}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <Field label="Section Label" fk="values.label" vals={vals} set={set} />
          <Field label="Section Title" fk="values.title" vals={vals} set={set} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={card}>
              <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary)', marginBottom: 10 }}>Value {n}</p>
              <Field label="Emoji Icon" fk={`values.${n}.icon`} vals={vals} set={set} />
              <Field label="Title" fk={`values.${n}.title`} vals={vals} set={set} />
              <Field label="Description" fk={`values.${n}.desc`} vals={vals} set={set} multiline rows={2} />
            </div>
          ))}
        </div>
      </Section>

      {/* Team */}
      <Section title="Team Members" icon="👥" sk="team" exp={exp.team} toggle={toggle} save={saveSection} saving={saving} saved={saved.team}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <Field label="Section Label" fk="team.label" vals={vals} set={set} />
          <Field label="Section Title" fk="team.title" vals={vals} set={set} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: teamCount }, (_, i) => i + 1).map(n => (
            <div key={n} style={{ ...card, display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 16, alignItems: 'start' }}>
              <div>
                <p style={lbl}>Photo</p>
                <ImgField fk={`team.${n}.image`} vals={vals} set={set} label="" />
              </div>
              <Field label={`Member ${n} Name`} fk={`team.${n}.name`} vals={vals} set={set} />
              <div>
                <Field label="Role / Position" fk={`team.${n}.role`} vals={vals} set={set} />
                {n > 1 && (
                  <button onClick={() => removeTeamMember(n)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>
                    <Trash2 size={12} /> Remove member
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {teamCount < 8 && (
          <button onClick={addTeamMember} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px dashed var(--primary)', borderRadius: 8, background: 'rgba(232,82,26,0.04)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <Plus size={14} /> Add Team Member
          </button>
        )}
      </Section>
    </AdminLayout>
  );
}