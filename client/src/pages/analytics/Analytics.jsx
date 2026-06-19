import { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ChartSkeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';
import useToast from '../../hooks/useToast';

const Analytics = () => {
  const toast = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [frequency, setFrequency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freqDays, setFreqDays] = useState(90);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/workout-frequency', { params: { days: freqDays } }),
    ]).then(([dashRes, freqRes]) => {
      setDashboard(dashRes.data.data);
      setFrequency(freqRes.data.data.frequency);
    }).catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [freqDays]);

  const tooltipStyle = { contentStyle: { background: '#1A1F2C', border: '1px solid #2A3045', borderRadius: '10px', color: '#F0F2F8', fontSize: '12px' } };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Analytics</h2>
          <p>Deep insights into your training performance</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setFreqDays(d)}
              className="btn btn-sm"
              style={{ background: freqDays === d ? '#C8F135' : '#1A1F2C', color: freqDays === d ? '#0D0F14' : '#9CA3AF', borderColor: freqDays === d ? '#C8F135' : '#2A3045' }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }} />) : [
          { label: 'Total Workouts', value: dashboard?.user?.totalWorkouts || 0, icon: '🏋️', color: '#C8F135' },
          { label: 'Best Streak', value: `${dashboard?.user?.longestStreak || 0} days`, icon: '🔥', color: '#F59E0B' },
          { label: 'Weekly Avg.', value: `${(frequency.reduce((s, d) => s + d.count, 0) / Math.max(frequency.length / 7, 1)).toFixed(1)} sessions`, icon: '📅', color: '#3B82F6' },
          { label: 'Total Volume', value: `${((dashboard?.monthlyVolume?.reduce((s, d) => s + d.volume, 0) || 0) / 1000).toFixed(0)}t`, icon: '⚡', color: '#A855F7' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}18`, fontSize: '1.4rem' }}>{s.icon}</div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Workout frequency */}
        <div className="card">
          <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>Workout Frequency ({freqDays} days)</h4>
          {loading ? <div className="skeleton" style={{ height: '200px', borderRadius: '8px' }} /> : frequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={frequency}>
                <CartesianGrid stroke="#1F2535" strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(d) => format(parseISO(d), 'MMM d')} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#C8F135" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: '40px' }}><div className="empty-icon">📊</div><p>No workout data for this period</p></div>}
        </div>

        {/* Volume trend */}
        <div className="card">
          <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>Monthly Volume Trend (kg)</h4>
          {loading ? <div className="skeleton" style={{ height: '200px', borderRadius: '8px' }} /> : dashboard?.monthlyVolume?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dashboard.monthlyVolume}>
                <defs>
                  <linearGradient id="volGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1F2535" strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(d) => format(parseISO(d), 'MMM d')} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="volume" stroke="#3B82F6" fill="url(#volGrad2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: '40px' }}><div className="empty-icon">📈</div><p>No volume data yet</p></div>}
        </div>

        {/* Weekly calories */}
        <div className="card">
          <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>Weekly Calorie Intake</h4>
          {loading ? <div className="skeleton" style={{ height: '200px', borderRadius: '8px' }} /> : dashboard?.weeklyCalories?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dashboard.weeklyCalories}>
                <CartesianGrid stroke="#1F2535" strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(d) => format(parseISO(d), 'EEE')} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="calories" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: '40px' }}><div className="empty-icon">🥗</div><p>No nutrition data yet</p></div>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
