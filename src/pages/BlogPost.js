import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blog as blogApi } from '../services/api';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { format } from 'date-fns';
import './BlogPost.css';

const DEMO = {
  title: 'How We Fed 500 Families This Diwali',
  category: 'Food',
  authorName: 'Aneesha Joy',
  createdAt: '2024-10-28T10:00:00Z',
  coverUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80',
  excerpt: 'This Diwali, we distributed food packages to over 500 families across Visakhapatnam.',
  content: `This Diwali, Aneesha Joy Foundation undertook its most ambitious food drive yet — reaching over 500 families across Visakhapatnam's underserved neighborhoods.\n\nThree weeks before Diwali, our team of 40 volunteers began collecting donations and preparing food packages. Each package contained rice, dal, oil, sweets, and essentials for a family of four.\n\nBy 4 PM on the day of distribution, every single package had been delivered. Donors received photos and short video updates confirming their contributions reached real families.\n\nThank you to every donor, volunteer, and well-wisher who made this possible. Your generosity lit up more than just homes this Diwali.`
};

export default function BlogPostPage() {
  const { id } = useParams();
  const [post, setPost]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    blogApi.getOne(id)
      .then(data => {
        setPost(data);
        // Load related posts from same category
        blogApi.getAll().then(all => {
          setRelated(all.filter(p => p.id !== id && p.category === data.category).slice(0, 3));
        }).catch(() => {});
      })
      .catch(() => setPost(DEMO))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!post) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h2>Post not found</h2>
      <Link to="/blog" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>← Back to Blog</Link>
    </div>
  );

  // Split plain text content into paragraphs on double newline
  const paragraphs = (post.content || post.excerpt || '')
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <main className="blog-post-page">

      {/* Hero */}
      <div className="post-hero" style={{ backgroundImage: `url(${post.coverUrl})` }}>
        <div className="post-hero-overlay" />
        <div className="container post-hero-content">
          <Link to="/blog" className="back-link"><ArrowLeft size={16} /> Back to Blog</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="blog-cat-badge" style={{ position: 'static', display: 'inline-block' }}>{post.category}</span>
          </div>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span><User size={14} /> {post.authorName}</span>
            <span><Calendar size={14} /> {post.createdAt ? format(new Date(post.createdAt), 'MMMM d, yyyy') : ''}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container post-body">
        <article className="post-content">
          {post.excerpt && (
            <p className="post-lead">{post.excerpt}</p>
          )}
          {paragraphs.map((para, i) => (
            <p key={i} className="post-para">{para}</p>
          ))}
        </article>

        {/* Category Tag */}
        <div className="post-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={14} color="var(--text-light)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Filed under:</span>
            <button onClick={() => window.location.href = `/blog?category=${post.category}`}
              style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 12px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }}>
              {post.category}
            </button>
          </div>
          <Link to="/blog" className="btn-outline" style={{ fontSize: '0.85rem' }}>← All Posts</Link>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="related-posts">
            <h3>More from {post.category}</h3>
            <div className="related-grid">
              {related.map(r => (
                <Link to={`/blog/${r.id}`} key={r.id} className="related-card">
                  {r.coverUrl && <img src={r.coverUrl} alt={r.title} />}
                  <div className="related-info">
                    <strong>{r.title}</strong>
                    <span>{r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : ''}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </main>
  );
}