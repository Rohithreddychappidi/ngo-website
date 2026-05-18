import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '../ui/SocialIcons';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">❤</span>
              <div>
                <div className="logo-name">Aneesha Foundation</div>
                <div className="logo-tag">Making a difference, one life at a time</div>
              </div>
            </div>
            <p className="footer-desc">
              We are committed to uplifting lives through transparency, compassion, and meaningful action across food, education, healthcare, and more.
            </p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/aneesha_joyp?utm_source=qr&igsh=MWhrajFleGdjNnlsNg==" target="_blank" rel="noreferrer" className="social-btn instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="https://www.facebook.com/share/1CqAnysw7Z/" target="_blank" rel="noreferrer" className="social-btn facebook">
                <FacebookIcon size={18} />
              </a>
              <a href="https://youtube.com/@aneeshajoyp?si=7QnysqaG1JXy0Iu8" target="_blank" rel="noreferrer" className="social-btn youtube">
                <YoutubeIcon size={18} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/causes">Causes</Link>
            <Link to="/donate-monthly">Donate Monthly</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h4>Causes We Support</h4>
            <Link to="/causes">Food & Nutrition</Link>
            <Link to="/causes">Birthday Celebrations</Link>
            <Link to="/causes">Education</Link>
            <Link to="/causes">Healthcare</Link>
            <Link to="/causes">Animal Welfare</Link>
            <Link to="/causes">Environment</Link>
            <Link to="/causes">Orphanage Care</Link>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="contact-item">
              <Phone size={15} />
              <a href="tel:8886444317">8886444317</a>
            </div>
            <div className="contact-item">
              <Mail size={15} />
              <a href="mailto:aneshajoyp@gmail.com">aneshajoyp@gmail.com</a>
            </div>
            <div className="contact-item address">
              <MapPin size={15} />
              <span>19-27-25/1, Gandhi Nagar, VUDA Colony, Pedagantyada, Visakhapatnam - 530044</span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2024 Aneesha Foundation. All rights reserved.</span>
          <span className="made-with">Made with <Heart size={12} className="heart-icon" /> for a better world</span>
        </div>
      </div>
    </footer>
  );
}
