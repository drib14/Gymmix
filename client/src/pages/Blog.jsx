import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Modal from '../components/ui/Modal';
import { FiSearch, FiCalendar, FiClock, FiPlus, FiTag, FiBookOpen, FiImage } from 'react-icons/fi';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';
import { format } from 'date-fns';

const STATIC_POSTS = [
  {
    _id: 'static-1',
    title: 'Mastering the Deadlift: Setup, Form & Mistakes',
    slug: 'mastering-the-deadlift-setup-form-mistakes',
    excerpt: 'Unlock explosive power and protect your lower back by mastering the setup and execution of the deadlift.',
    category: 'workout',
    tags: ['powerlifting', 'strength'],
    authorName: 'Coach Marcus',
    readTimeMinutes: 6,
    publishedAt: new Date(2026, 5, 15).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    _id: 'static-2',
    title: 'Optimal Macro Ratios for Clean Bulking',
    slug: 'optimal-macro-ratios-for-clean-bulking',
    excerpt: 'Bulking doesn\'t mean eating everything. Discover the science-backed macro splits to build lean muscle mass.',
    category: 'nutrition',
    tags: ['macros', 'bulking'],
    authorName: 'Dietitian Elena',
    readTimeMinutes: 5,
    publishedAt: new Date(2026, 5, 12).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80'
  },
  {
    _id: 'static-3',
    title: 'The Science of Active Recovery Days',
    slug: 'the-science-of-active-recovery-days',
    excerpt: 'Doing nothing isn\'t always the answer. Learn how active mobility workouts speed up muscle protein synthesis.',
    category: 'recovery',
    tags: ['mobility', 'recovery'],
    authorName: 'Dr. Sarah Lopez',
    readTimeMinutes: 4,
    publishedAt: new Date(2026, 5, 10).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80'
  }
];

const Blog = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // New Post Form State
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: 'workout', tags: '', readTimeMinutes: '5' });
  const [imageFile, setImageFile] = useState(null);

  const isAdmin = user?.role === 'admin';

  const fetchPosts = () => {
    setLoading(true);
    api.get('/blog', { params: { category: activeCategory === 'all' ? undefined : activeCategory, search: search || undefined } })
      .then((res) => {
        const fetched = res.data?.data?.posts || [];
        setPosts(fetched.length > 0 ? fetched : STATIC_POSTS);
      })
      .catch(() => {
        setPosts(STATIC_POSTS);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Gymmix | Blog';
    window.scrollTo(0, 0);
    fetchPosts();
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Title and content are required.');
      return;
    }
    setCreating(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('excerpt', form.excerpt);
      formData.append('category', form.category);
      formData.append('readTimeMinutes', form.readTimeMinutes);
      formData.append('status', 'published');
      
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      tagsArray.forEach(t => formData.append('tags[]', t));

      if (imageFile) {
        formData.append('coverImage', imageFile);
      }

      await api.post('/blog', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Blog post published successfully!', '🎉 Published');
      setCreateOpen(false);
      setForm({ title: '', content: '', excerpt: '', category: 'workout', tags: '', readTimeMinutes: '5' });
      setImageFile(null);
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create blog post.');
    } finally {
      setCreating(false);
    }
  };

  const categories = ['all', 'workout', 'nutrition', 'mindset', 'recovery', 'equipment', 'news'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '120px 24px 80px' }}>
        <div className="container">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '8px' }}>Gymmix Insights</h1>
              <p style={{ color: '#6B7280', margin: 0 }}>Expert fitness advice, workout programs, and nutrition guides.</p>
            </div>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => setCreateOpen(true)} id="create-post-btn">
                <FiPlus size={16} /> Create Post
              </button>
            )}
          </div>

          {/* Search & Categories Bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
            background: '#12151C', border: '1px solid #1F2535',
            padding: '16px 20px', borderRadius: '12px'
          }}>
            {/* Category selection */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 14px', borderRadius: '100px', border: 'none',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    textTransform: 'capitalize',
                    background: activeCategory === cat ? '#C8F135' : 'transparent',
                    color: activeCategory === cat ? '#0D0F14' : '#6B7280',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '300px', width: '100%' }}>
              <div className="input-icon-wrapper" style={{ flex: 1 }}>
                <span className="input-icon"><FiSearch size={15} /></span>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input"
                  style={{ fontSize: '0.8rem', padding: '9px 12px 9px 38px' }}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">Go</button>
            </form>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="grid-responsive">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '360px', borderRadius: '14px' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="grid-responsive">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="card"
                  style={{
                    display: 'flex', flexDirection: 'column', padding: 0,
                    background: '#12151C', border: '1px solid #1F2535',
                    overflow: 'hidden', borderRadius: '14px', transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                  {/* Cover Image */}
                  <div style={{ height: '180px', overflow: 'hidden', background: '#1A1F2C', position: 'relative' }}>
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4B5563' }}>
                        <FiImage size={40} />
                      </div>
                    )}
                    <span className="badge badge-accent" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                      {post.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#6B7280', marginBottom: '8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FiCalendar size={12} />
                        {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Recently'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={12} />
                        {post.readTimeMinutes || 5} min read
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      <Link to={`/blog/${post.slug}`} style={{ color: '#F0F2F8', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#C8F135'} onMouseLeave={(e) => e.currentTarget.style.color = '#F0F2F8'}>
                        {post.title}
                      </Link>
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: '#9CA3AF', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '58px' }}>
                      {post.excerpt || post.content}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #1F2535' }}>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>By {post.authorName || 'Gymmix Coach'}</span>
                      <Link to={`/blog/${post.slug}`} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C8F135', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Read <FiBookOpen size={13} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Admin CMS Create Post Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Publish New Article" size="md">
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-wrapper">
            <label className="input-label">Article Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. 5 Rules of Progressive Overload"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-wrapper">
              <label className="input-label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Read Time (minutes)</label>
              <input
                type="number"
                className="input"
                value={form.readTimeMinutes}
                onChange={(e) => setForm(f => ({ ...f, readTimeMinutes: e.target.value }))}
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Excerpt / Brief Description</label>
            <input
              type="text"
              className="input"
              placeholder="Brief summary of the article..."
              value={form.excerpt}
              onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Tags (comma separated)</label>
            <input
              type="text"
              className="input"
              placeholder="strength, core, workout"
              value={form.tags}
              onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Cover Image File</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Article Content (HTML/Markdown supported) *</label>
            <textarea
              className="input"
              placeholder="Write the full post here..."
              rows={8}
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={creating}
            style={{ width: '100%', padding: '12px' }}
            id="publish-submit-btn"
          >
            {creating ? (
              <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Uploading & Publishing...</>
            ) : (
              <>Publish Article <FiArrowRight size={15} /></>
            )}
          </button>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

export default Blog;
