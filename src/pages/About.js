import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './About.css';

const DEFAULT = {
  heroTitle: "About Aneesha Joy Foundation",
  heroSubtitle: "A story of compassion, action, and community — rooted in Visakhapatnam, reaching hearts everywhere.",
  heroImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1400&q=80",
  mission: "Our mission is to uplift the underprivileged through transparent, community-driven initiatives spanning food, education, healthcare, and environmental care.",
  vision: "We envision a world where every child has access to education, every family has food on the table, and every community thrives with dignity.",
  story: `Aneesha Joy Foundation was born from a simple belief — that small acts of kindness, done consistently and transparently, can transform entire communities.\n\nFounded in Visakhapatnam, we began by organizing birthday celebrations for orphanage children and food drives in underserved neighborhoods. Today, we've grown into a multi-cause organization supporting food security, education, healthcare, animal welfare, and environmental conservation.\n\nEvery donation we receive is documented with photos and videos, shared with our community of donors. We believe in full transparency — because when you give, you deserve to see the difference it makes.`,
  teamTitle: "Meet Our Team",
  team: [
    { name: "Aneesha Joy P", role: "Founder & Director", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
    { name: "Volunteer Leader", role: "Head of Operations", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
    { name: "Community Manager", role: "Outreach Coordinator", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
  ],
  values: [
    { title: "Transparency", desc: "Every rupee is accounted for, with photo and video proof of impact.", icon: "🔍" },
    { title: "Compassion", desc: "We lead with empathy, treating every beneficiary with dignity.", icon: "💛" },
    { title: "Community", desc: "We believe in the power of community — donors, volunteers, and beneficiaries together.", icon: "🤝" },
    { title: "Accountability", desc: "We hold ourselves to the highest standards of integrity.", icon: "✅" },
  ]
};

export default function AboutPage() {
  const [content, setContent] = useState(DEFAULT);

  useEffect(() => {
    getDoc(doc(db, 'cms', 'about')).then(snap => {
      if (snap.exists()) setContent({ ...DEFAULT, ...snap.data() });
    }).catch(() => {});
  }, []);

  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero" style={{ backgroundImage: `url(${content.heroImage})` }}>
        <div className="about-hero-overlay" />
        <div className="container about-hero-content">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Our Story</p>
          <h1 className="hero-title" style={{ color: 'white' }}>{content.heroTitle}</h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', maxWidth: 560, marginTop: 12 }}>
            {content.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mv-section">
        <div className="container mv-grid">
          <div className="mv-card">
            <div className="mv-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>{content.mission}</p>
          </div>
          <div className="mv-card featured">
            <div className="mv-icon">🌟</div>
            <h3>Our Vision</h3>
            <p>{content.vision}</p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="story-section">
        <div className="container story-inner">
          <div className="story-text">
            <p className="section-label">How It Started</p>
            <h2 className="section-title">Our Story</h2>
            {content.story?.split('\n\n').map((para, i) => (
              <p key={i} className="story-para">{para}</p>
            ))}
          </div>
          <div className="story-img-stack">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=80" alt="impact" className="story-img-1" />
            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80" alt="children" className="story-img-2" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">What We Stand For</p>
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="values-grid">
            {content.values?.map((v, i) => (
              <div key={i} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">People</p>
            <h2 className="section-title">{content.teamTitle || 'Meet Our Team'}</h2>
          </div>
          <div className="team-grid">
            {content.team?.map((member, i) => (
              <div key={i} className="team-card">
                <img src={member.image} alt={member.name} className="team-img" />
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span>{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
