import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FiCalendar, FiClock, FiChevronLeft, FiTag } from 'react-icons/fi';
import api from '../services/api';
import { format } from 'date-fns';

const STATIC_POSTS = [
  {
    _id: 'static-1',
    title: 'Mastering the Deadlift: Setup, Form & Mistakes',
    slug: 'mastering-the-deadlift-setup-form-mistakes',
    content: `
      <h2>The Importance of Deadlifts</h2>
      <p>The deadlift is one of the most effective exercises for building size, strength, and structural integrity. By training the entire posterior chain (hamstrings, glutes, spinal erectors, traps, and lats), it develops powerful structural strength that carries over directly to daily life and sports.</p>
      
      <h2>1. The Foot Positioning & Grip Setup</h2>
      <p>Stand with feet hip-width apart. The barbell should divide your feet exactly in half (about 1-2 inches from your shins). Walk up to the bar, hinge at the waist, and grab the bar just outside your knees with a double overhand or mixed grip.</p>
      
      <h2>2. Hip Hinge and Spine Neutrality</h2>
      <p>Without shifting the bar, drop your hips until your shins touch the metal. Keep your spine perfectly neutral. Pull your chest tall to flatten your back and contract your lats as if trying to squeeze oranges under your armpits.</p>
      
      <h2>3. The Execution</h2>
      <p>Push your feet hard into the floor, driving your legs down rather than pulling the bar up. Keep the barbell in contact with your shins and thighs throughout the ascent. Stand tall, lock your knees and hips, but avoid hyperextending your lower back at the top.</p>
    `,
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
    content: `
      <h2>Clean Bulking vs. Dirty Bulking</h2>
      <p>Clean bulking involves consuming a slight caloric surplus (250-500 kcal above maintenance) of nutrient-dense whole foods. This minimizes fat gain while providing the optimal metabolic environment for muscle protein synthesis.</p>
      
      <h2>1. Protein: The Muscle Builder</h2>
      <p>Maintain protein intake between 1.6 to 2.2 grams per kilogram of body weight (approx. 0.8 to 1.0g per lb). Distribute your protein evenly across 4-5 daily meals to trigger muscle growth signals consistently.</p>
      
      <h2>2. Carbohydrates: The Fuel Source</h2>
      <p>Carbohydrates are your primary energy source for high-intensity lifting sessions. Keep carbs high (45-55% of total calorie intake) to keep muscle glycogen stores full and maximize workout performance.</p>
      
      <h2>3. Fats: The Hormone Regulator</h2>
      <p>Fats are essential for testosterone production and general cell health. Allocate 20-30% of your daily calories to healthy fats, focusing on avocados, nuts, extra virgin olive oil, and egg yolks.</p>
    `,
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
    content: `
      <h2>What is Active Recovery?</h2>
      <p>Active recovery involves performing low-intensity exercise (such as steady-state walking, dynamic stretching, or light swimming) on rest days. Unlike passive rest, light movement keeps blood circulation high, flushing lactic acid and supplying fresh oxygenated blood to recovering muscle tissue.</p>
      
      <h2>1. Keeping Blood Circulation High</h2>
      <p>Muscles require nutrients to repair micro-tears. Dynamic movements pump fresh blood, oxygen, and amino acids to target muscle groups, expediting muscle building and reducing delayed-onset muscle soreness (DOMS).</p>
      
      <h2>2. Improving Joint Health and Mobility</h2>
      <p>Heavy lifting can compress joints and tighten tendons. Light yoga or active stretching lubricates joint capsules with synovial fluid, improving structural range of motion for your next leg day.</p>
      
      <h2>3. Recommendations</h2>
      <p>Keep your recovery sessions under 45 minutes and keep your heart rate below 120 beats per minute. Remember, the goal of an active recovery day is to recover, not to burn out.</p>
    `,
    category: 'recovery',
    tags: ['mobility', 'recovery'],
    authorName: 'Dr. Sarah Lopez',
    readTimeMinutes: 4,
    publishedAt: new Date(2026, 5, 10).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80'
  }
];

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    api.get(`/blog/${slug}`)
      .then((res) => {
        const p = res.data?.data?.post;
        if (p) {
          setPost(p);
          document.title = `Gymmix | ${p.title}`;
        } else {
          loadStaticPost();
        }
      })
      .catch(() => {
        loadStaticPost();
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const loadStaticPost = () => {
    const staticP = STATIC_POSTS.find(p => p.slug === slug);
    if (staticP) {
      setPost(staticP);
      document.title = `Gymmix | ${staticP.title}`;
    } else {
      setPost(null);
      document.title = 'Gymmix | Article Not Found';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <h3>Article Not Found</h3>
          <p>The post you are trying to view does not exist or has been archived.</p>
          <Link to="/blog" className="btn btn-primary"><FiChevronLeft size={16} /> Back to Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '120px 24px 80px' }}>
        <div className="container container-md">
          {/* Back button */}
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '0.85rem', marginBottom: '24px', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#C8F135'} onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
            <FiChevronLeft size={16} /> Back to Insights
          </Link>

          <article>
            {/* Header info */}
            <header style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <span className="badge badge-accent">{post.category}</span>
                {post.tags?.map(t => (
                  <span key={t} className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><FiTag size={10} /> {t}</span>
                ))}
              </div>

              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F0F2F8', lineHeight: 1.2, marginBottom: '20px' }}>
                {post.title}
              </h1>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderTop: '1px solid #1F2535', borderBottom: '1px solid #1F2535', padding: '16px 0' }}>
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt="" className="avatar avatar-md" />
                ) : (
                  <div className="avatar-placeholder avatar-md">{post.authorName?.[0] || 'C'}</div>
                )}
                <div>
                  <p style={{ color: '#F0F2F8', margin: '0 0 2px 0', fontSize: '0.9rem', fontWeight: 700 }}>{post.authorName || 'Gymmix Coach'}</p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#6B7280' }}>
                    <span>{post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : 'Recently Published'}</span>
                    <span>·</span>
                    <span>{post.readTimeMinutes || 5} min read</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div style={{ width: '100%', maxHeight: '420px', overflow: 'hidden', borderRadius: '16px', marginBottom: '40px', border: '1px solid #1F2535' }}>
                <img src={post.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Content Body */}
            <div
              className="blog-content"
              style={{
                color: '#9CA3AF',
                lineHeight: 1.8,
                fontSize: '1.05rem',
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
