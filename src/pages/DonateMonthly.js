import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, CheckCircle, ArrowRight, Repeat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './DonateMonthly.css';

const PLANS = [
  { id: 'supporter', name: 'Supporter', amount: 200, perks: ['Feed 1 family/month', 'Digital thank-you card', 'Monthly impact report'] },
  { id: 'champion', name: 'Champion', amount: 500, perks: ['Feed 3 families/month', 'Featured donor badge', 'Monthly impact report', 'Personal impact certificate'], featured: true },
  { id: 'guardian', name: 'Guardian', amount: 1000, perks: ['Full education kit for 3 children', 'Priority event invites', 'Quarterly impact video', 'Guardian certificate & recognition'] },
  { id: 'patron', name: 'Patron', amount: 2500, perks: ['Sponsor an orphanage child/month', 'Annual impact report', 'Patron recognition on website', 'Personal thank-you call', 'Special plaque'] },
];

export default function DonateMonthlyPage() {
  const { currentUser, loginWithGoogle } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleDonate = async (plan) => {
    if (!currentUser) {
      await loginWithGoogle();
      return;
    }
    setSelectedPlan(plan);
    // Load Razorpay and open
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || 'YOUR_RAZORPAY_KEY_ID',
        amount: plan.amount * 100,
        currency: 'INR',
        name: 'Aneesha Joy Foundation',
        description: `Monthly Donation — ${plan.name} Plan`,
        recurring: 1,
        subscription_card_change: 1,
        theme: { color: '#E8521A' },
        prefill: { name: currentUser.displayName, email: currentUser.email },
        handler: function (res) {
          alert('Subscription set up successfully! Thank you 🙏');
        },
      };
      new window.Razorpay(options).open();
    };
    document.body.appendChild(script);
  };

  return (
    <main className="donate-monthly-page">
      <div className="dm-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Recurring Giving</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>
            Donate Monthly
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520 }}>
            A monthly gift creates sustained, predictable impact. Choose a plan and become a pillar of our mission.
          </p>
        </div>
      </div>

      <section className="dm-content">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">Choose a Plan</p>
            <h2 className="section-title">Monthly Giving Plans</h2>
            <p className="section-subtitle">Every rupee goes directly to the cause. Cancel anytime.</p>
          </div>

          <div className="plans-grid">
            {PLANS.map(plan => (
              <div key={plan.id} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="plan-badge">Most Popular</div>}
                <div className="plan-icon"><Repeat size={24} /></div>
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">₹{plan.amount}</span>
                  <span className="per">/month</span>
                </div>
                <ul className="plan-perks">
                  {plan.perks.map((perk, i) => (
                    <li key={i}><CheckCircle size={14} /> {perk}</li>
                  ))}
                </ul>
                <button
                  className={plan.featured ? 'btn-primary plan-btn' : 'btn-outline plan-btn'}
                  onClick={() => handleDonate(plan)}
                >
                  {currentUser ? 'Start Monthly Giving' : 'Sign In & Donate'} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="dm-faq">
            <div className="section-head center" style={{ marginTop: 64 }}>
              <p className="section-label">Common Questions</p>
              <h2 className="section-title">FAQs</h2>
            </div>
            <div className="faq-grid">
              {[
                { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your monthly subscription anytime with no questions asked through the Razorpay portal.' },
                { q: 'Is my donation tax-deductible?', a: 'Yes. We provide an 80G certificate for donations. Contact us after subscribing to get yours.' },
                { q: 'How is my money used?', a: '100% of your monthly contribution goes directly to the cause you choose. We maintain full transparency with photo and video documentation.' },
                { q: 'How do I change my plan?', a: 'Email us at aneshajoyp@gmail.com or contact us via the website to upgrade or change your plan.' },
              ].map((faq, i) => (
                <div key={i} className="faq-item">
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
