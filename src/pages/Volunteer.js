import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Users, Heart, Clock, Award, Send } from 'lucide-react';
import './Volunteer.css';

const ROLES = ['Community Outreach', 'Food Distribution', 'Education Support', 'Healthcare Drive', 'Environmental Activity', 'Animal Welfare', 'Event Management', 'Photography/Videography', 'Social Media', 'Other'];
const AVAILABILITY = ['Weekdays', 'Weekends', 'Both', 'Flexible'];

export default function VolunteerPage() {
  const { currentUser, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', role: '', availability: '', experience: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentUser) { await loginWithGoogle(); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'volunteers'), {
        ...form,
        userId: currentUser.uid,
        userPhoto: currentUser.photoURL,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (err) {
      alert('Submission failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <main className="volunteer-page">
      <div className="vol-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Join Our Team</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>
            Become a Volunteer
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520 }}>
            Your time is the most powerful gift you can give. Join our community and help create real, lasting change.
          </p>
        </div>
      </div>

      {/* Why Volunteer */}
      <section className="vol-why">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">Why Join Us</p>
            <h2 className="section-title">What You'll Gain</h2>
          </div>
          <div className="vol-benefits-grid">
            {[
              { icon: <Heart size={26} />, title: 'Make Real Impact', desc: 'See the direct difference your efforts make in people\'s lives.' },
              { icon: <Users size={26} />, title: 'Community', desc: 'Join a warm, welcoming team of like-minded change-makers.' },
              { icon: <Clock size={26} />, title: 'Flexible Hours', desc: 'Volunteer on your own schedule — weekdays, weekends, or whenever you\'re free.' },
              { icon: <Award size={26} />, title: 'Recognition', desc: 'Receive an appreciation certificate and be featured on our donor wall.' },
            ].map((b, i) => (
              <div key={i} className="vol-benefit">
                <div className="vol-benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="vol-form-section">
        <div className="container vol-form-container">
          {!currentUser ? (
            <div className="vol-login-prompt">
              <Users size={52} color="var(--primary)" />
              <h2>Sign in to Apply</h2>
              <p>Please sign in with Google to submit your volunteer application. We use this to verify your identity and keep you updated.</p>
              <button className="btn-primary" onClick={loginWithGoogle}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          ) : submitted ? (
            <div className="vol-success">
              <CheckCircle size={56} color="var(--success)" />
              <h2>Application Submitted!</h2>
              <p>Thank you, <strong>{currentUser.displayName?.split(' ')[0]}</strong>! We've received your volunteer application.</p>
              <p className="vol-success-sub">Our team will review it and get back to you within 2–3 working days at <strong>{currentUser.email}</strong>.</p>
              <button className="btn-primary" onClick={() => setSubmitted(false)}>Submit Another</button>
            </div>
          ) : (
            <div className="vol-form-wrap">
              <div className="vol-form-header">
                <img src={currentUser.photoURL} alt="avatar" className="vol-avatar" />
                <div>
                  <h3>Hello, {currentUser.displayName?.split(' ')[0]}!</h3>
                  <p>Complete the form below to join as a volunteer.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="vol-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                  </div>
                  <div className="form-field">
                    <label>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required />
                  </div>
                  <div className="form-field">
                    <label>City</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Visakhapatnam" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Preferred Role *</label>
                    <select name="role" value={form.role} onChange={handleChange} required>
                      <option value="">Select a role</option>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Availability *</label>
                    <select name="availability" value={form.availability} onChange={handleChange} required>
                      <option value="">Select availability</option>
                      {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-field full">
                  <label>Prior Experience</label>
                  <input name="experience" value={form.experience} onChange={handleChange} placeholder="Any previous volunteer or NGO work?" />
                </div>
                <div className="form-field full">
                  <label>Why do you want to volunteer?</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Tell us your motivation..." />
                </div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Submitting...' : <><Send size={16} /> Submit Application</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
