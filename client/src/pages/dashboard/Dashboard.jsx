import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiTarget, FiTrendingUp, FiZap, FiArrowRight, FiCalendar, FiClock } from 'react-icons/fi';
import { GiMuscleUp, GiFlame } from 'react-icons/gi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { format, parseISO } from 'date-fns';

const MUSCLE_COLORS = {
  chest: '#EF4444', back: '#3B82F6', shoulders: '#A855F7',
  quads: '#22C55E', glutes: '#22C55E', hamstrings: '#22C55E',
  biceps: '#06B6D4', triceps: '#F97316', core: '#F59E0B', cardio: '#EC4899',
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>
              {greeting()}, <span style={{ color: '#C8F135' }}>{user?.firstName}</span>! 💪
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              {data?.user?.lastWorkoutDate
                ? `Last workout: ${format(new Date(data.user.lastWorkoutDate), 'MMM d, yyyy')}`
                : 'Start your first workout today!'}
            </p>
          </div>
          <Link to="/workouts" className="btn btn-primary btn-sm">
            Start Workout <FiArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          [
            { icon: '🏋️', label: 'Total Workouts', value: data?.user?.totalWorkouts || 0, color: 'rgba(200,241,53,0.1)', iconColor: '#C8F135' },
            { icon: '🔥', label: 'Current Streak', value: `${data?.user?.currentStreak || 0} days`, color: 'rgba(245,158,11,0.1)', iconColor: '#F59E0B' },
            { icon: '⚡', label: 'This Week', value: `${data?.weeklyWorkoutCount || 0} workouts`, color: 'rgba(59,130,246,0.1)', iconColor: '#3B82F6' },
            { icon: '💪', label: 'Weekly Volume', value: `${((data?.weeklyVolume || 0) / 1000).toFixed(1)}t`, color: 'rgba(168,85,247,0.1)', iconColor: '#A855F7' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card hover-lift">
              <div className="stat-icon" style={{ background: stat.color, color: stat.iconColor, fontSize: '1.5rem' }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: stat.iconColor }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginBottom: '32px' }}>
        {loading ? (
          <>
            <ChartSkeleton height="260px" />
            <ChartSkeleton height="260px" />
          </>
        ) : (
          <>
            {/* Volume Chart */}
            <div className="card">
              <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>Volume Trend (30 days)</h4>
              {data?.monthlyVolume?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.monthlyVolume}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C8F135" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#C8F135" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1F2535" strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(d) => format(parseISO(d), 'MMM d')} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1A1F2C', border: '1px solid #2A3045', borderRadius: '10px', color: '#F0F2F8' }} />
                    <Area type="monotone" dataKey="volume" stroke="#C8F135" fill="url(#volGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div className="empty-icon">📊</div>
                  <p>Log workouts to see your volume trend</p>
                </div>
              )}
            </div>

            {/* Muscles Worked Pie */}
            <div className="card">
              <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '20px' }}>Muscles Worked (30d)</h4>
              {data?.workoutsByMuscle?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={data.workoutsByMuscle.slice(0, 6)} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                        {data.workoutsByMuscle.slice(0, 6).map((entry) => (
                          <Cell key={entry._id} fill={MUSCLE_COLORS[entry._id] || '#6B7280'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1A1F2C', border: '1px solid #2A3045', borderRadius: '8px', color: '#F0F2F8', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                    {data.workoutsByMuscle.slice(0, 6).map((m) => (
                      <span key={m._id} className="badge badge-muted" style={{ textTransform: 'capitalize', fontSize: '0.65rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: MUSCLE_COLORS[m._id] || '#6B7280', display: 'inline-block', marginRight: '4px' }} />
                        {m._id} ({m.count})
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div className="empty-icon">💪</div>
                  <p>No muscle data yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Active Goals + Recent Workouts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Active Goals */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontFamily: 'Outfit, sans-serif' }}>Active Goals</h4>
            <Link to="/goals" style={{ fontSize: '0.8rem', color: '#C8F135', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              All goals <FiArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '8px' }} />)}
            </div>
          ) : data?.activeGoals?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.activeGoals.map((goal) => (
                <div key={goal._id} style={{ padding: '12px', background: '#1A1F2C', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F0F2F8' }}>{goal.title}</span>
                    <span style={{ fontSize: '0.75rem', color: '#C8F135', fontWeight: 700 }}>{goal.progressPercent}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${goal.progressPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div className="empty-icon">🎯</div>
              <p style={{ fontSize: '0.8rem' }}>No active goals</p>
              <Link to="/goals" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>Set a Goal</Link>
            </div>
          )}
        </div>

        {/* Recent Workouts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Workouts</h4>
            <Link to="/workout-history" style={{ fontSize: '0.8rem', color: '#C8F135', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <FiArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '8px' }} />)}
            </div>
          ) : data?.recentWorkouts?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.recentWorkouts.map((log) => (
                <div key={log._id} style={{ padding: '10px 12px', background: '#1A1F2C', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(200,241,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8F135', flexShrink: 0 }}>
                    <FiActivity size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.83rem', fontWeight: 600, color: '#F0F2F8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.workoutPlanName || log.dayName || 'Workout Session'}
                    </p>
                    <p style={{ fontSize: '0.73rem', color: '#6B7280', margin: 0 }}>
                      {format(new Date(log.startTime), 'MMM d')} · {log.durationMinutes || '-'} min · {log.totalSets || 0} sets
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div className="empty-icon">🏋️</div>
              <p style={{ fontSize: '0.8rem' }}>No workouts logged yet</p>
              <Link to="/workouts" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>Start Workout</Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
