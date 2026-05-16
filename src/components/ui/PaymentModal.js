import React, { useState } from 'react';
import { X, Heart, Shield, CheckCircle } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './PaymentModal.css';

export default function PaymentModal({ cause, onClose }) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState(cause.amount || 100);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [anonymousDonate, setAnonymousDonate] = useState(false);

  const totalAmount = amount * quantity;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert('Payment SDK failed to load. Check your internet connection.');
      setLoading(false);
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || 'YOUR_RAZORPAY_KEY_ID',
      amount: totalAmount * 100, // in paise
      currency: 'INR',
      name: 'Aneesha Joy Foundation',
      description: cause.title,
      image: '/logo192.png',
      handler: async function (response) {
        // Save donation to Firestore
        try {
          await addDoc(collection(db, 'donations'), {
            userId: currentUser.uid,
            userName: anonymousDonate ? 'Anonymous' : currentUser.displayName,
            userEmail: currentUser.email,
            userPhoto: currentUser.photoURL,
            causeId: cause.id,
            causeTitle: cause.title,
            causeCategory: cause.category,
            amount: totalAmount,
            quantity,
            paymentId: response.razorpay_payment_id,
            status: 'success',
            anonymous: anonymousDonate,
            createdAt: new Date().toISOString(),
          });

          // Update user total donated
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            totalDonated: increment(totalAmount),
          });

          setSuccess(true);
        } catch (err) {
          console.error('Error saving donation:', err);
          setSuccess(true); // Still show success since payment went through
        }
        setLoading(false);
      },
      prefill: {
        name: currentUser.displayName,
        email: currentUser.email,
      },
      theme: {
        color: '#E8521A',
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box success-box" onClick={e => e.stopPropagation()}>
          <CheckCircle size={56} color="var(--success)" />
          <h2>Thank You!</h2>
          <p>Your donation of <strong>₹{totalAmount}</strong> for <strong>{cause.title}</strong> was successful.</p>
          <p className="success-sub">Your generosity makes a real difference. 🙏</p>
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <div className="modal-header">
          <Heart size={24} color="var(--primary)" />
          <h2>Make a Donation</h2>
        </div>

        <div className="modal-cause-info">
          <img src={cause.imageUrl || `https://source.unsplash.com/120x80/?${cause.category}`} alt={cause.title} />
          <div>
            <h3>{cause.title}</h3>
            <span className="cause-badge-sm">{cause.category}</span>
          </div>
        </div>

        <div className="modal-field">
          <label>Amount per unit (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            min={1}
            className="modal-input"
          />
          <p className="field-hint">₹{cause.amount}/{cause.unit}</p>
        </div>

        <div className="modal-field">
          <label>Quantity</label>
          <div className="qty-control">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
        </div>

        <div className="total-row">
          <span>Total Donation</span>
          <span className="total-amount">₹{totalAmount}</span>
        </div>

        <label className="anon-toggle">
          <input type="checkbox" checked={anonymousDonate} onChange={e => setAnonymousDonate(e.target.checked)} />
          <span>Donate anonymously</span>
        </label>

        <div className="donor-info">
          <img src={currentUser?.photoURL} alt="" className="donor-avatar" />
          <div>
            <strong>{anonymousDonate ? 'Anonymous' : currentUser?.displayName}</strong>
            <span>{currentUser?.email}</span>
          </div>
        </div>

        <button className="pay-btn" onClick={handlePayment} disabled={loading}>
          {loading ? 'Processing...' : `Pay ₹${totalAmount} Securely`}
        </button>

        <div className="secure-note">
          <Shield size={13} /> Secured by Razorpay. Your data is protected.
        </div>
      </div>
    </div>
  );
}
