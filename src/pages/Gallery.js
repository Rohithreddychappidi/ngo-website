import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { X } from 'lucide-react';
import './Gallery.css';

const DEMO_GALLERY = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80', caption: 'Food Drive 2024', section: 'Food' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80', caption: 'Birthday Celebrations', section: 'Birthday' },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', caption: 'Education Drive', section: 'Education' },
  { id: 'g4', url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80', caption: 'Tree Plantation', section: 'Environment' },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&q=80', caption: 'Animal Shelter Visit', section: 'Animals' },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', caption: 'Medical Camp', section: 'Healthcare' },
  { id: 'g7', url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80', caption: 'Volunteer Gathering', section: 'Volunteers' },
  { id: 'g8', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', caption: 'Diwali Food Packages', section: 'Food' },
  { id: 'g9', url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80', caption: 'Tutoring Session', section: 'Education' },
  { id: 'g10', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', caption: 'Environment Drive', section: 'Environment' },
  { id: 'g11', url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&q=80', caption: 'Stray Dog Rescue', section: 'Animals' },
  { id: 'g12', url: 'https://images.unsplash.com/photo-1594671676461-7e649a2a7a4c?w=600&q=80', caption: 'Clean Water Project', section: 'Healthcare' },
];

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [pageInfo, setPageInfo] = useState({ title: 'Our Gallery', subtitle: 'Moments of impact, stories of change.' });

  useEffect(() => {
    // Fetch gallery photos
    getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')))
      .then(snap => {
        if (!snap.empty) {
          setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }).catch(() => {});

    // Fetch CMS info
    getDoc(doc(db, 'cms', 'gallery'))
      .then(snap => { if (snap.exists()) setPageInfo(snap.data()); })
      .catch(() => {});
  }, []);

  const sourcePhotos = photos.length > 0 ? photos : DEMO_GALLERY;

  // Build unique sections
  useEffect(() => {
    const s = ['All', ...new Set(sourcePhotos.map(p => p.section).filter(Boolean))];
    setSections(s);
  }, [sourcePhotos]);

  const filtered = activeSection === 'All'
    ? sourcePhotos
    : sourcePhotos.filter(p => p.section === activeSection);

  return (
    <main className="gallery-page">
      <div className="gallery-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Our Moments</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>
            {pageInfo.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>{pageInfo.subtitle}</p>
        </div>
      </div>

      <section className="gallery-content">
        <div className="container">
          <div className="category-tabs">
            {sections.map(sec => (
              <button
                key={sec}
                className={`cat-tab ${activeSection === sec ? 'active' : ''}`}
                onClick={() => setActiveSection(sec)}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="gallery-grid">
            {filtered.map((photo, i) => (
              <div key={photo.id} className="gallery-item" onClick={() => setLightbox(photo)}>
                <img src={photo.url} alt={photo.caption || ''} loading="lazy" />
                {photo.caption && (
                  <div className="gallery-caption">
                    <span>{photo.caption}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}><X size={24} /></button>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption} />
            {lightbox.caption && <p className="lightbox-caption">{lightbox.caption}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
