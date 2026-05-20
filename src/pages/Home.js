import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { causes as causesApi, payments, cms } from '../services/api';
import CauseCard from '../components/ui/CauseCard';
import { Camera, Video, ArrowRight, Users, CheckCircle, ChevronDown } from 'lucide-react';
import './Home.css';

const CATEGORIES = ['All', 'Food', 'Birthday', 'Environment', 'Animals', 'Education', 'Orphanage', 'Healthcare'];

const D = {
  'hero.label':               'Aneesha Joy Foundation',
  'hero.headline':            'Transform Lives With Every Donation',
  'hero.subheadline':         'Join Aneesha Joy Foundation in creating meaningful change across Visakhapatnam — one cause at a time.',
  'hero.ctaText':             'Start Donating',
  'hero.learnMoreText':       'Learn More',
  'hero.bgImage':             'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80',
  'causes.label':             'Make an Impact',
  'causes.title':             'Choose a Cause to Support',
  'causes.subtitle':          'From food to education, every contribution creates lasting change.',
  'transparency.label':       'Why Trust Us',
  'transparency.title':       'Our Commitment to Transparency',
  'transparency.subtitle':    'Every contribution is documented, verified, and shared with our donors.',
  'transparency.card1.title': 'Donor Recognition',
  'transparency.card1.desc':  "Every donation is acknowledged with the donor's name, creating a transparent record.",
  'transparency.card2.title': 'Photo Documentation',
  'transparency.card2.desc':  "Every donor's contribution is backed with photo proof of the real impact.",
  'transparency.card3.title': 'Video Documentation',
  'transparency.card3.desc':  'Transparency shown through video, highlighting the real difference your support makes.',
  'volunteer.label':          'Get Involved',
  'volunteer.title':          'Become a Volunteer',
  'volunteer.subtitle':       'Join our growing family of changemakers. Your time and skills can transform lives.',
  'volunteer.ctaText':        'Join as Volunteer',
  'volunteer.perk1':          'Make a real, visible difference',
  'volunteer.perk2':          'Certificate of appreciation',
  'volunteer.perk3':          'Community of like-minded individuals',
  'volunteer.perk4':          'Flexible commitment, any skill set welcome',
  'volunteer.image':          'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=700&q=80',
  'cta.title':                'Ready to Make a Difference?',
  'cta.subtitle':             'Reach out to us. Every question, every idea, and every offer of help matters.',
  'cta.btn1':                 'Contact Us',
  'cta.btn2':                 'Donate Now',
};

const DEMO_CAUSES = [
  { id: 'd1', title: 'Feed a Family',        category: 'Food',        amount: 200,  unit: 'family/day',  description: 'Help provide nutritious meals to underprivileged families.',  imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
  { id: 'd2', title: 'Plant a Sapling',      category: 'Environment', amount: 50,   unit: 'sapling',     description: 'Help us grow a greener future for coming generations.',         imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80' },
  { id: 'd3', title: 'Birthday Celebration', category: 'Birthday',    amount: 500,  unit: 'child',       description: 'Bring smiles to orphanage children on their birthdays.',       imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80' },
  { id: 'd4', title: 'School Supplies',      category: 'Education',   amount: 300,  unit: 'student',     description: 'Give a child the tools they need to learn and grow.',           imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80' },
  { id: 'd5', title: 'Animal Shelter Care',  category: 'Animals',     amount: 150,  unit: 'animal/week', description: 'Support our local animal shelter with food and medicine.',       imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&q=80' },
  { id: 'd6', title: 'Medical Camp',         category: 'Healthcare',  amount: 1000, unit: 'patient',     description: 'Fund free medical checkups for the rural community.',           imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [causesList, setCausesList]         = useState([]);
  const [content, setContent]              = useState(D);
  const [donors, setDonors]                = useState([]);
  const [stats, setStats]                  = useState({ totalDonors: 0, totalRaised: 0, causesSupported: 0 });
  const [loading, setLoading]              = useState(true);

  const v = (key) => content[key] || D[key] || '';

  useEffect(() => {
    Promise.allSettled([
      cms.get('homepage'),
      causesApi.getAll(),
      payments.getAll(),
    ]).then(([cmsRes, causesRes, donationsRes]) => {
      if (cmsRes.status === 'fulfilled' && cmsRes.value && Object.keys(cmsRes.value).length)
        setContent(prev => ({ ...prev, ...cmsRes.value }));
      if (causesRes.status === 'fulfilled') setCausesList(causesRes.value);
      if (donationsRes.status === 'fulfilled') {
        const donations   = donationsRes.value;
        const totalRaised = donations.reduce((s, d) => s + (Number(d.amount) || 0), 0);
        const uniqueDonors = new Set(donations.map(d => d.userId)).size;
        setStats({ totalDonors: uniqueDonors, totalRaised, causesSupported: causesRes.value?.length || 7 });
        const seen = new Set();
        setDonors(donations.filter(d => { if (d.anonymous || seen.has(d.userId)) return false; seen.add(d.userId); return true; }).slice(0, 8));
      }
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const source   = causesList.length > 0 ? causesList : DEMO_CAUSES;
  const filtered = activeCategory === 'All' ? source : source.filter(c => c.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <main className="home-page">

      {/* ── Hero ── */}
      <section className="hero-section" style={{ backgroundImage: `url(${v('hero.bgImage')})` }}>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="hero-label">{v('hero.label')}</p>
          <h1 className="hero-title">{v('hero.headline')}</h1>
          <p className="hero-sub">{v('hero.subheadline')}</p>
          <div className="hero-ctas">
            <Link to="/causes" className="btn-primary">{v('hero.ctaText')} <ArrowRight size={16} /></Link>
            <Link to="/about" className="btn-hero-outline">{v('hero.learnMoreText')}</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="stat-num">₹{(stats.totalRaised / 1000).toFixed(0)}K+</span><span className="stat-label">Raised</span></div>
            <div className="stat-divider" />
            <div className="hero-stat"><span className="stat-num">{stats.totalDonors}+</span><span className="stat-label">Donors</span></div>
            <div className="stat-divider" />
            <div className="hero-stat"><span className="stat-num">{stats.causesSupported || 7}+</span><span className="stat-label">Causes</span></div>
          </div>
        </div>
        <a href="#causes-section" className="scroll-hint"><ChevronDown size={22} /></a>
      </section>

      {/* ── Causes ── */}
      <section id="causes-section" className="causes-section">
        <div className="container">
          <div className="section-head">
            <p className="section-label">{v('causes.label')}</p>
            <h2 className="section-title">{v('causes.title')}</h2>
            <p className="section-subtitle">{v('causes.subtitle')}</p>
          </div>
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
          {loading
            ? <div className="causes-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
            : <div className="causes-grid">{filtered.map(cause => <CauseCard key={cause.id} cause={cause} />)}</div>
          }
        </div>
      </section>

      {/* ── Transparency ── */}
      <section className="transparency-section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">{v('transparency.label')}</p>
            <h2 className="section-title">{v('transparency.title')}</h2>
            <p className="section-subtitle">{v('transparency.subtitle')}</p>
          </div>
          <div className="transparency-grid">
            <div className="trans-card">
              <div className="trans-icon donor-icon"><Users size={28} /></div>
              <h3>{v('transparency.card1.title')}</h3>
              <p>{v('transparency.card1.desc')}</p>
            </div>
            <div className="trans-card featured">
              <div className="trans-icon photo-icon"><Camera size={28} /></div>
              <h3>{v('transparency.card2.title')}</h3>
              <p>{v('transparency.card2.desc')}</p>
            </div>
            <div className="trans-card">
              <div className="trans-icon video-icon"><Video size={28} /></div>
              <h3>{v('transparency.card3.title')}</h3>
              <p>{v('transparency.card3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Donors strip ── */}
      {donors.length > 0 && (
        <section className="donors-strip">
          <div className="container">
            <p className="section-label" style={{ textAlign: 'center' }}>Our Generous Donors</p>
            <div className="donors-row">
              {donors.map((d, i) => (
                <div key={i} className="donor-chip">
                  <img src={d.userPhoto || '/default-avatar.png'} alt={d.userName} />
                  <div><strong>{d.userName}</strong><span>₹{d.amount}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Volunteer ── */}
      <section className="volunteer-section">
        <div className="container volunteer-inner">
          <div className="volunteer-text">
            <p className="section-label">{v('volunteer.label')}</p>
            <h2 className="section-title">{v('volunteer.title')}</h2>
            <p className="section-subtitle">{v('volunteer.subtitle')}</p>
            <ul className="volunteer-perks">
              {[1, 2, 3, 4].map(n => (
                <li key={n}><CheckCircle size={16} color="var(--primary)" /> {v(`volunteer.perk${n}`)}</li>
              ))}
            </ul>
            <Link to="/volunteer" className="btn-primary">{v('volunteer.ctaText')} <ArrowRight size={16} /></Link>
          </div>
          <div className="volunteer-image">
            <img src={v('volunteer.image')} alt="Volunteers" />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="home-contact-section">
        <div className="container home-contact-inner">
          <div>
            <h2 className="section-title" style={{ color: 'white' }}>{v('cta.title')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>{v('cta.subtitle')}</p>
          </div>
          <div className="contact-ctas">
            <Link to="/contact" className="btn-white">{v('cta.btn1')}</Link>
            <Link to="/causes" className="btn-outline-white">{v('cta.btn2')}</Link>
          </div>
        </div>
      </section>

    </main>
  );
}