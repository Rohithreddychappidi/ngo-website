import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import CauseCard from '../components/ui/CauseCard';
import './Causes.css';

const CATEGORIES = ['All', 'Food', 'Birthday', 'Environment', 'Animals', 'Education', 'Orphanage', 'Healthcare'];

const DEMO_CAUSES = [
  { id: 'd1', title: 'Feed a Family', category: 'Food', amount: 200, unit: 'family/day', description: 'Help provide nutritious meals to underprivileged families.', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
  { id: 'd2', title: 'Plant a Sapling', category: 'Environment', amount: 50, unit: 'sapling', description: 'Help us grow a greener future for coming generations.', imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80' },
  { id: 'd3', title: 'Birthday Celebration', category: 'Birthday', amount: 500, unit: 'child', description: 'Bring smiles to orphanage children on their birthdays.', imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80' },
  { id: 'd4', title: 'School Supplies', category: 'Education', amount: 300, unit: 'student', description: 'Give a child the tools they need to learn and grow.', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80' },
  { id: 'd5', title: 'Animal Shelter Care', category: 'Animals', amount: 150, unit: 'animal/week', description: 'Support our local animal shelter with food and medicine.', imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&q=80' },
  { id: 'd6', title: 'Medical Camp Support', category: 'Healthcare', amount: 1000, unit: 'patient', description: 'Fund free medical checkups for the rural community.', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
  { id: 'd7', title: 'Orphanage Monthly Fund', category: 'Orphanage', amount: 2000, unit: 'month', description: 'Monthly contributions to support our partner orphanages.', imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80' },
  { id: 'd8', title: 'Clean Water Access', category: 'Healthcare', amount: 800, unit: 'household', description: 'Provide clean drinking water to underserved households.', imageUrl: 'https://images.unsplash.com/photo-1594671676461-7e649a2a7a4c?w=400&q=80' },
  { id: 'd9', title: 'Tree Plantation Drive', category: 'Environment', amount: 75, unit: 'tree', description: 'Plant indigenous trees to restore local ecosystem balance.', imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80' },
  { id: 'd10', title: 'Midday Meal Program', category: 'Food', amount: 25, unit: 'meal', description: 'Provide a nutritious midday meal for school children.', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' },
  { id: 'd11', title: 'Stray Animal Feeding', category: 'Animals', amount: 100, unit: 'week', description: 'Regular feeding and care for stray dogs and cats in the city.', imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=80' },
  { id: 'd12', title: 'Tutoring Program', category: 'Education', amount: 500, unit: 'student/month', description: 'One-on-one tutoring support for underprivileged students.', imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80' },
];

export default function CausesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'causes'), orderBy('createdAt', 'desc')))
      .then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCauses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sourceCauses = causes.length > 0 ? causes : DEMO_CAUSES;
  const filtered = activeCategory === 'All'
    ? sourceCauses
    : sourceCauses.filter(c => c.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <main className="causes-page">
      <div className="causes-page-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Support a Cause</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>
            Every Contribution Counts
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', maxWidth: 500 }}>
            Browse our causes and choose where your generosity makes the biggest impact.
          </p>
        </div>
      </div>

      <section className="causes-content">
        <div className="container">
          <div className="category-tabs" style={{ marginBottom: 36 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="results-count">{filtered.length} cause{filtered.length !== 1 ? 's' : ''} found</p>

          {loading ? (
            <div className="causes-grid-causes">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" style={{ height: 320, borderRadius: 20, background: 'var(--surface-alt)' }} />)}
            </div>
          ) : (
            <div className="causes-grid-causes">
              {filtered.map(cause => <CauseCard key={cause.id} cause={cause} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
