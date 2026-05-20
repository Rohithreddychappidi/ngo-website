import React, { useState, useEffect } from 'react';
import { cms } from '../services/api';
import './About.css';

const D = {
  'hero.label':    'Our Story',
  'hero.title':    'About Aneesha Joy Foundation',
  'hero.subtitle': 'A story of compassion, action, and community — rooted in Visakhapatnam, reaching hearts everywhere.',
  'hero.image':    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1400&q=80',
  'mission.title': 'Our Mission',
  'mission.text':  'Our mission is to uplift the underprivileged through transparent, community-driven initiatives spanning food, education, healthcare, and environmental care.',
  'vision.title':  'Our Vision',
  'vision.text':   'We envision a world where every child has access to education, every family has food on the table, and every community thrives with dignity.',
  'story.label':   'How It Started',
  'story.title':   'Our Story',
  'story.para1':   'Aneesha Joy Foundation was born from a simple belief — that small acts of kindness, done consistently and transparently, can transform entire communities.',
  'story.para2':   "Founded in Visakhapatnam, we began by organizing birthday celebrations for orphanage children and food drives in underserved neighborhoods. Today, we've grown into a multi-cause organization supporting food security, education, healthcare, animal welfare, and environmental conservation.",
  'story.para3':   'Every donation we receive is documented with photos and videos, shared with our community of donors. We believe in full transparency — because when you give, you deserve to see the difference it makes.',
  'story.image1':  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=80',
  'story.image2':  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80',
  'values.label':  'What We Stand For',
  'values.title':  'Our Core Values',
  'values.1.icon': '🔍', 'values.1.title': 'Transparency',   'values.1.desc': 'Every rupee is accounted for, with photo and video proof of impact.',
  'values.2.icon': '💛', 'values.2.title': 'Compassion',     'values.2.desc': 'We lead with empathy, treating every beneficiary with dignity.',
  'values.3.icon': '🤝', 'values.3.title': 'Community',      'values.3.desc': 'We believe in the power of community — donors, volunteers, and beneficiaries together.',
  'values.4.icon': '✅', 'values.4.title': 'Accountability',  'values.4.desc': 'We hold ourselves to the highest standards of integrity.',
  'team.label':    'People',
  'team.title':    'Meet Our Team',
  'team.count':    '3',
  'team.1.name': 'Aneesha Joy P',     'team.1.role': 'Founder & Director',   'team.1.image': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  'team.2.name': 'Volunteer Leader',  'team.2.role': 'Head of Operations',   'team.2.image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  'team.3.name': 'Community Manager', 'team.3.role': 'Outreach Coordinator', 'team.3.image': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
};

export default function AboutPage() {
  const [c, setC] = useState(D);
  const v = (k) => c[k] || D[k] || '';

  useEffect(() => {
    cms.get('about')
      .then(data => { if (data && Object.keys(data).length) setC(p => ({ ...p, ...data })); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teamCount = parseInt(v('team.count')) || 3;
  const team   = Array.from({ length: teamCount }, (_, i) => ({ name: v(`team.${i+1}.name`), role: v(`team.${i+1}.role`), image: v(`team.${i+1}.image`) }));
  const values = [1,2,3,4].map(n => ({ icon: v(`values.${n}.icon`), title: v(`values.${n}.title`), desc: v(`values.${n}.desc`) }));

  return (
    <main className="about-page">

      <section className="about-hero" style={{ backgroundImage: `url(${v('hero.image')})` }}>
        <div className="about-hero-overlay" />
        <div className="container about-hero-content">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>{v('hero.label')}</p>
          <h1 className="hero-title" style={{ color: 'white' }}>{v('hero.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', maxWidth: 560, marginTop: 12 }}>{v('hero.subtitle')}</p>
        </div>
      </section>

      <section className="mv-section">
        <div className="container mv-grid">
          <div className="mv-card"><div className="mv-icon">🎯</div><h3>{v('mission.title')}</h3><p>{v('mission.text')}</p></div>
          <div className="mv-card featured"><div className="mv-icon">🌟</div><h3>{v('vision.title')}</h3><p>{v('vision.text')}</p></div>
        </div>
      </section>

      <section className="story-section">
        <div className="container story-inner">
          <div className="story-text">
            <p className="section-label">{v('story.label')}</p>
            <h2 className="section-title">{v('story.title')}</h2>
            {[v('story.para1'), v('story.para2'), v('story.para3')].filter(Boolean).map((p, i) => <p key={i} className="story-para">{p}</p>)}
          </div>
          <div className="story-img-stack">
            {v('story.image1') && <img src={v('story.image1')} alt="impact" className="story-img-1" />}
            {v('story.image2') && <img src={v('story.image2')} alt="children" className="story-img-2" />}
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">{v('values.label')}</p>
            <h2 className="section-title">{v('values.title')}</h2>
          </div>
          <div className="values-grid">
            {values.map((val, i) => (
              <div key={i} className="value-card">
                <span className="value-icon">{val.icon}</span>
                <h3>{val.title}</h3>
                <p>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">{v('team.label')}</p>
            <h2 className="section-title">{v('team.title')}</h2>
          </div>
          <div className="team-grid">
            {team.filter(m => m.name).map((member, i) => (
              <div key={i} className="team-card">
                <img src={member.image} alt={member.name} className="team-img" />
                <div className="team-info"><h3>{member.name}</h3><span>{member.role}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}