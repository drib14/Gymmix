import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { ChartSkeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import useAuthStore from '../../store/authStore';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];

const Nutrition = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [logging, setLogging] = useState(false);
  const [form, setForm] = useState({ mealType: 'breakfast', items: [{ name: '', calories: '', protein: '', carbs: '', fats: '' }] });

  useEffect(() => {
    document.title = 'Gymmix | Nutrition';
    Promise.all([
      api.get('/nutrition/daily-summary'),
      api.get('/nutrition/weekly-trend'),
    ]).then(([summaryRes, trendRes]) => {
      setSummary(summaryRes.data.data);
      setTrend(trendRes.data.data.trend);
    }).catch(() => toast.error('Failed to load nutrition data.'))
      .finally(() => setLoading(false));
  }, []);

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { name: '', calories: '', protein: '', carbs: '', fats: '' }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, key, value) => setForm((f) => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [key]: value } : item) }));

  const handleLog = async () => {
    if (form.items.some((i) => !i.name)) { toast.error('All items need a name.'); return; }
    setLogging(true);
    try {
      const items = form.items.map((i) => ({
        name: i.name,
        calories: parseFloat(i.calories) || 0,
        protein: parseFloat(i.protein) || 0,
        carbs: parseFloat(i.carbs) || 0,
        fats: parseFloat(i.fats) || 0,
      }));
      await api.post('/nutrition', { mealType: form.mealType, items });
      toast.success('Meal logged!', '🥗 Great!');
      setLogOpen(false);
      // Refresh summary
      const res = await api.get('/nutrition/daily-summary');
      setSummary(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log meal.');
    } finally { setLogging(false); }
  };

  const getMacroGoals = () => {
    if (user?.gender === 'male') {
      return { calories: 2500, protein: 160, carbs: 300, fats: 85 };
    }
    if (user?.gender === 'female') {
      return { calories: 1800, protein: 120, carbs: 200, fats: 60 };
    }
    return { calories: 2200, protein: 140, carbs: 250, fats: 75 };
  };

  const macros = summary?.summary;
  const MACRO_GOALS = getMacroGoals();

  const MacroBar = ({ label, value, goal, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <span style={{ color: '#9CA3AF' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{Math.round(value || 0)}<span style={{ color: '#6B7280', fontWeight: 400 }}>/{goal}</span></span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${Math.min(100, ((value || 0) / goal) * 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Nutrition Tracker</h2>
          <p>Today's macros and meal history</p>
        </div>
        <button className="btn btn-primary" onClick={() => setLogOpen(true)} id="log-meal-btn">
          <FiPlus size={16} /> Log Meal
        </button>
      </div>

      {/* Today's Macro Summary */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Calories', value: macros?.calories, goal: MACRO_GOALS.calories, unit: 'kcal', color: '#C8F135', icon: '🔥' },
            { label: 'Protein', value: macros?.protein, goal: MACRO_GOALS.protein, unit: 'g', color: '#3B82F6', icon: '💪' },
            { label: 'Carbs', value: macros?.carbs, goal: MACRO_GOALS.carbs, unit: 'g', color: '#F59E0B', icon: '🌾' },
            { label: 'Fats', value: macros?.fats, goal: MACRO_GOALS.fats, unit: 'g', color: '#EF4444', icon: '🥑' },
          ].map((m) => (
            <div key={m.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${m.color}18`, color: m.color, fontSize: '1.4rem' }}>{m.icon}</div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: m.color, fontSize: '1.5rem' }}>{Math.round(m.value || 0)}<span style={{ fontSize: '0.9rem', color: '#6B7280' }}>{m.unit}</span></div>
                <div className="stat-label">{m.label} / {m.goal}{m.unit}</div>
                <div style={{ marginTop: '6px' }}>
                  <div className="progress-bar-track" style={{ height: '4px' }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, ((m.value || 0) / m.goal) * 100)}%`, background: m.color }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Trend Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>Weekly Calorie Trend</h4>
        {loading ? <div className="skeleton" style={{ height: '220px', borderRadius: '8px' }} /> : trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend}>
              <CartesianGrid stroke="#1F2535" strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(d) => format(parseISO(d), 'EEE, MMM d')} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1A1F2C', border: '1px solid #2A3045', borderRadius: '10px', color: '#F0F2F8' }} />
              <Bar dataKey="calories" fill="#C8F135" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="empty-icon">🥗</div>
            <p>Log meals to see your weekly trend</p>
          </div>
        )}
      </div>

      {/* Today's meals */}
      <div className="card">
        <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>Today's Meals</h4>
        {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '8px' }} />)}</div>
          : summary?.meals?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {summary.meals.map((meal) => (
                <div key={meal._id} style={{ padding: '12px 16px', background: '#1A1F2C', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#F0F2F8', fontSize: '0.875rem', margin: 0, textTransform: 'capitalize' }}>{meal.mealType?.replace('_', ' ')}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{meal.items?.map((i) => i.name).join(', ')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: '#C8F135', fontSize: '0.9rem', margin: 0 }}>{Math.round(meal.totalCalories)} kcal</p>
                    <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>P:{Math.round(meal.totalProtein)}g C:{Math.round(meal.totalCarbs)}g F:{Math.round(meal.totalFats)}g</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div className="empty-icon">🥗</div>
              <p style={{ fontSize: '0.85rem' }}>No meals logged today</p>
            </div>
          )}
      </div>

      {/* Log Meal Modal */}
      <Modal isOpen={logOpen} onClose={() => setLogOpen(false)} title="Log a Meal" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-wrapper">
            <label className="input-label">Meal Type</label>
            <select className="input" value={form.mealType} onChange={(e) => setForm((f) => ({ ...f, mealType: e.target.value }))} id="meal-type-select">
              {MEAL_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label className="input-label">Food Items</label>
              <button className="btn btn-ghost btn-sm" onClick={addItem}><FiPlus size={13} /> Add Item</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} style={{ background: '#1A1F2C', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input className="input" placeholder="Food name *" value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} style={{ flex: 1, fontSize: '0.85rem', padding: '7px 10px' }} />
                  {form.items.length > 1 && (
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(i)} style={{ color: '#EF4444', flexShrink: 0 }}>
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[['calories', 'Calories'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fats', 'Fats (g)']].map(([key, label]) => (
                    <input key={key} className="input" type="number" placeholder={label} value={item[key]} onChange={(e) => updateItem(i, key, e.target.value)} style={{ fontSize: '0.78rem', padding: '6px 8px' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={handleLog} disabled={logging} id="log-meal-submit">
            {logging ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Logging...</> : <><FiPlus size={15} /> Log Meal</>}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Nutrition;
