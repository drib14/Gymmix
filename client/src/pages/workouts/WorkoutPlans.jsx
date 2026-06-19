import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiChevronDown, FiChevronUp, FiPlay } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { WorkoutCardSkeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';
import useToast from '../../hooks/useToast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkoutPlans = () => {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', frequency: 3, difficulty: 'intermediate', goal: 'general_fitness' });

  useEffect(() => {
    document.title = 'Gymmix | Workout Plans';
    api.get('/workout-plans')
      .then((res) => setPlans(res.data.data.plans || []))
      .catch(() => toast.error('Failed to load plans.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Plan name is required.'); return; }
    setCreating(true);
    try {
      const res = await api.post('/workout-plans', form);
      setPlans((prev) => [res.data.data.plan, ...prev]);
      setCreateOpen(false);
      setForm({ name: '', description: '', frequency: 3, difficulty: 'intermediate', goal: 'general_fitness' });
      toast.success('Workout plan created!', '💪 Nice!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/workout-plans/${deleteConfirm.id}`);
      setPlans((prev) => prev.filter((p) => p._id !== deleteConfirm.id));
      toast.success('Plan deleted.');
    } catch { toast.error('Failed to delete plan.'); }
    finally {
      setDeleting(false);
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const handleClone = async (id) => {
    try {
      const res = await api.post(`/workout-plans/${id}/clone`);
      setPlans((prev) => [res.data.data.plan, ...prev]);
      toast.success('Plan cloned!');
    } catch { toast.error('Failed to clone plan.'); }
  };

  const GOAL_LABELS = { strength: '💪 Strength', muscle_gain: '🏋️ Muscle Gain', weight_loss: '🔥 Weight Loss', endurance: '🏃 Endurance', general_fitness: '⚡ General Fitness' };
  const DIFF_COLORS = { beginner: '#22C55E', intermediate: '#F59E0B', advanced: '#EF4444' };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Workout Plans</h2>
          <p>Build and manage your weekly training programs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)} id="create-plan-btn">
          <FiPlus size={16} /> New Plan
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 6 }).map((_, i) => <WorkoutCardSkeleton key={i} />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No workout plans yet</h3>
          <p>Create your first workout plan to get started</p>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>Create Plan</button>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {plans.map((plan) => (
            <div key={plan._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                onClick={() => setExpandedPlan(expandedPlan === plan._id ? null : plan._id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', margin: 0 }}>{plan.name}</h4>
                    <span className="badge" style={{ background: `${DIFF_COLORS[plan.difficulty]}22`, color: DIFF_COLORS[plan.difficulty], textTransform: 'capitalize' }}>{plan.difficulty}</span>
                    {plan.isPublic && <span className="badge badge-info">Public</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{GOAL_LABELS[plan.goal] || plan.goal}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>📅 {plan.frequency}x / week</span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>🗓 {plan.days?.length || 0} days defined</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); toast.info('Start workout session feature in progress'); }}>
                    <FiPlay size={13} /> Start
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); handleClone(plan._id); }} title="Clone">
                    <FiCopy size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, id: plan._id }); }}
                    style={{ color: '#EF4444' }}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                  {expandedPlan === plan._id ? <FiChevronUp size={18} style={{ color: '#6B7280' }} /> : <FiChevronDown size={18} style={{ color: '#6B7280' }} />}
                </div>
              </div>

              {/* Expanded plan days */}
              {expandedPlan === plan._id && plan.days?.length > 0 && (
                <div style={{ borderTop: '1px solid #1F2535', background: '#12151C' }} className="animate-fade-in">
                  {plan.days.map((day, di) => (
                    <div key={di} style={{ padding: '14px 24px', borderBottom: di < plan.days.length - 1 ? '1px solid #1F2535' : 'none' }}>
                      <p style={{ fontWeight: 700, color: '#C8F135', fontSize: '0.85rem', marginBottom: '8px' }}>
                        {day.name || `Day ${di + 1}`}
                        {day.isRestDay && <span className="badge badge-muted" style={{ marginLeft: '8px' }}>Rest</span>}
                      </p>
                      {!day.isRestDay && day.exercises?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {day.exercises.map((ex, ei) => (
                            <div key={ei} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#9CA3AF' }}>
                              <span style={{ color: '#6B7280', width: '20px' }}>{ei + 1}.</span>
                              <span style={{ fontWeight: 600, color: '#F0F2F8' }}>{ex.exercise?.name || ex.exerciseName}</span>
                              <span>{ex.sets}×{ex.reps}{ex.weight ? ` @ ${ex.weight}kg` : ''}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Workout Plan" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-wrapper">
            <label className="input-label">Plan Name *</label>
            <input className="input" placeholder="e.g., Push/Pull/Legs" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} id="plan-name-input" />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Description</label>
            <textarea className="input" placeholder="What's this plan for?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-wrapper">
              <label className="input-label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Freq. / Week</label>
              <input className="input" type="number" min={1} max={7} value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: parseInt(e.target.value) }))} />
            </div>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Goal</label>
            <select className="input" value={form.goal} onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}>
              <option value="strength">Strength</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="endurance">Endurance</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating} style={{ marginTop: '8px' }} id="create-plan-submit">
            {creating ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Creating...</> : <><FiPlus size={15} /> Create Plan</>}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Workout Plan"
        message="Are you sure you want to delete this plan? All associated data will be lost."
        confirmText="Delete Plan"
        isLoading={deleting}
      />
    </DashboardLayout>
  );
};

export default WorkoutPlans;
