import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FiSearch, FiChevronDown, FiHelpCircle, FiSettings, FiActivity, FiCreditCard } from 'react-icons/fi';
import api from '../services/api';

const STATIC_FAQS = [
  { category: 'general', question: 'What is Gymmix?', answer: 'Gymmix is a modern, comprehensive fitness tracking platform designed for both beginners and seasoned athletes. It allows you to build custom workout routines, log training volume, monitor your macro-nutrients, and visualize fitness metrics on an advanced analytics dashboard.' },
  { category: 'general', question: 'Is Gymmix free to use?', answer: 'Yes! Our standard tier is completely free and allows you to log meals, create up to 3 custom workout plans, and view our comprehensive exercise library.' },
  { category: 'workouts', question: 'How do I build a custom workout plan?', answer: 'Navigate to the Workout Plans page from your sidebar, click "New Plan", name your session, and begin searching and adding exercises. You can customize target sets, reps, and rest intervals directly inside the builder.' },
  { category: 'workouts', question: 'Does Gymmix count active rest intervals?', answer: 'Yes, when you launch an active workout, the session tracker includes built-in rest countdown alerts to keep you focused between your sets.' },
  { category: 'subscriptions', question: 'What payment methods does Gymmix support?', answer: 'We support secure payment processing via the Paymongo checkout gateway. You can subscribe to Pro or Elite plans using credit cards, GCash, or PayMaya.' },
  { category: 'subscriptions', question: 'How do I cancel my subscription?', answer: 'You can cancel your subscription at any time from your Profile settings under the billing tab. You will continue to have full access to your plan features until the end of your current billing cycle.' },
  { category: 'support', question: 'How do I report a bug or request a feature?', answer: 'You can get in touch with our team directly through our Contact Us page. We read all support requests and typically respond within 24 hours.' }
];

const FAQ = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    document.title = 'Gymmix | FAQ';
    window.scrollTo(0, 0);

    // Fetch FAQs from API, combine with static fallbacks
    api.get('/blog/faqs')
      .then((res) => {
        const fetched = res.data?.data?.faqs || [];
        if (fetched.length > 0) {
          const mapped = fetched.map(f => ({
            category: f.category || 'general',
            question: f.faqQuestion,
            answer: f.content
          }));
          setFaqs(mapped);
        } else {
          setFaqs(STATIC_FAQS);
        }
      })
      .catch(() => {
        setFaqs(STATIC_FAQS);
      });
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All FAQs', icon: <FiHelpCircle size={15} /> },
    { id: 'general', label: 'General', icon: <FiHelpCircle size={15} /> },
    { id: 'workouts', label: 'Workouts', icon: <FiActivity size={15} /> },
    { id: 'subscriptions', label: 'Billing', icon: <FiCreditCard size={15} /> },
    { id: 'support', label: 'Support', icon: <FiSettings size={15} /> }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '120px 24px 80px' }}>
        <div className="container container-md">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }} className="animate-fade-in-down">
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, marginBottom: '12px' }}>Frequently Asked Questions</h1>
            <p style={{ color: '#6B7280', maxWidth: '480px', margin: '0 auto 24px' }}>Got questions? We have answers. Search or select a category below to find what you need.</p>
            
            {/* Search Input */}
            <div className="input-icon-wrapper" style={{ maxWidth: '440px', margin: '0 auto' }}>
              <span className="input-icon"><FiSearch size={16} /></span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search FAQs..."
                className="input"
                id="faq-search-input"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }} className="animate-fade-in-up">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                className="btn btn-sm"
                style={{
                  background: activeCategory === cat.id ? '#C8F135' : '#12151C',
                  color: activeCategory === cat.id ? '#0D0F14' : '#9CA3AF',
                  borderColor: activeCategory === cat.id ? '#C8F135' : '#2A3045',
                  borderRadius: '100px'
                }}
              >
                {cat.icon} <span style={{ marginLeft: '4px' }}>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in-up">
            {filteredFaqs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No answers found</h3>
                <p>Try searching for different keywords or checking a different category.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      background: '#12151C',
                      border: '1px solid #1F2535',
                      padding: '0',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C8F135')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1F2535')}
                  >
                    <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <h5 style={{ fontFamily: 'Outfit, sans-serif', margin: 0, fontWeight: 700, fontSize: '0.95rem', color: isOpen ? '#C8F135' : '#F0F2F8' }}>
                        {faq.question}
                      </h5>
                      <span style={{ color: isOpen ? '#C8F135' : '#6B7280', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-flex', alignItems: 'center' }}>
                        <FiChevronDown size={18} />
                      </span>
                    </div>
                    <div style={{
                      maxHeight: isOpen ? '200px' : '0',
                      opacity: isOpen ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'all 0.25s ease-in-out',
                      borderTop: isOpen ? '1px solid #1F2535' : 'none'
                    }}>
                      <div style={{ padding: '18px 24px', fontSize: '0.9rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
