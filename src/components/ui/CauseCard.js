import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from './PaymentModal';
import './CauseCard.css';

export default function CauseCard({ cause }) {
  const [showPayment, setShowPayment] = useState(false);
  const { currentUser, loginWithGoogle } = useAuth();

  const handleDonateClick = () => {
    if (!currentUser) {
      loginWithGoogle();
    } else {
      setShowPayment(true);
    }
  };

  return (
    <>
      <div className="cause-card">
        <div className="cause-card-img-wrap">
          <img 
            src={cause.imageUrl || `https://source.unsplash.com/400x280/?${cause.category || 'charity'}`} 
            alt={cause.title}
            className="cause-card-img"
          />
          <span className="cause-badge">{cause.category || 'General'}</span>
        </div>
        <div className="cause-card-body">
          <h3 className="cause-card-title">{cause.title}</h3>
          <p className="cause-card-desc">{cause.description || ''}</p>
          <div className="cause-card-price">
            <span className="price-amount">₹{cause.amount}</span>
            <span className="price-unit">/{cause.unit || 'contribution'}</span>
          </div>
          <button className="cause-donate-btn" onClick={handleDonateClick}>
            <Heart size={15} /> Donate Now
          </button>
        </div>
      </div>
      {showPayment && (
        <PaymentModal
          cause={cause}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
