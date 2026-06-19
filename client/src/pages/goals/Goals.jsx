import { useState, useEffect } from 'react';
import { FiTarget, FiPlus, FiEdit2, FiTrash2, FiCheck, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import useToast from '../../hooks/useToast';

const GOAL_TYPES = ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'nutrition', 'body_fat', 'custom'];
const STATUS_COLORS = { active: '#C8F135', completed: '#22C55E', paused: '#F59E0B', abandoned: '#EF4444' };

const Goals = () => {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'custom', targetValue: '', currentValue: '', unit: '', deadline: '', status: 'active' });

  useEffect(() => {
    document.title = 'Gymmix | Goals';
    api.get('/goals')
      .then((res) => setGoals(res.data.data.goals || []))
      .catch(() => toast.error('Failed to load goals.'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditGoal(null); setForm({ title: '', description: '', type: 'custom', targetValue: '', currentValue: '', unit: '', deadline: '', status: 'active' }); setModalOpen(true); };
  const openEdit = (g) => { setEditGoal(g); setForm({ title: g.title, description: g.description || '', type: g.type, targetValue: g.targetValue || '', currentValue: g.currentValue || '', unit: g.unit || '', deadline: g.deadline ? format(new Date(g.deadline), 'yyyy-MM-dd') : '', status: g.status }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title) { toast.error('Goal title is required.'); return; }
    setSaving(true);
    try {
      if (editGoal) {
        const res = await api.put(`/goals/${editGoal._id}`, form);
        setGoals((prev) => prev.map((g) => g._id === editGoal._id ? res.data.data.goal : g));
        toast.success('Goal updated!');
      } else {
        const res = await api.post('/goals', form);
        setGoals((prev) => [res.data.data.goal, ...prev]);
        toast.success('Goal created!', '🎯 Let\'s go!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save goal.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/goals/${deleteConfirm.id}`);
      setGoals((prev) => prev.filter((g) => g._id !== deleteConfirm.id));
      toast.success('Goal deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(false); setDeleteConfirm({ open: false, id: null }); }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>My Goals</h2>
          <p>Set, track, and achieve your fitness goals</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-goal-btn"><FiPlus size={16} /> New Goal</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No goals yet</h3>
          <p>Set your first fitness goal to stay motivated</p>
          <button className="btn btn-primary" onClick={openCreate}>Create Goal</button>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map((goal) => (
            <div key={goal._id} className="card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  background: `${STATUS_COLORS[goal.status] || '#6B7280'}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                }}>
                  {goal.status === 'completed' ? '🏆' : '🎯'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <h5 style={{ fontFamily: 'Outfit, sans-serif', margin: '0 0 4px' }}>{goal.title}</h5>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{goal.type?.replace('_', ' ')}</span>
                        <span className="badge" style={{ background: `${STATUS_COLORS[goal.status] || '#6B7280'}18`, color: STATUS_COLORS[goal.status] || '#6B7280', textTransform: 'capitalize' }}>
                          {goal.status}
                        </span>
                        {goal.deadline && (
                          <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <FiCalendar size={10} /> {format(new Date(goal.deadline), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(goal)}><FiEdit2 size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteConfirm({ open: true, id: goal._id })} style={{ color: '#EF4444' }}><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                  {goal.targetValue && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '4px' }}>
                        <span>Progress: {goal.currentValue || 0} / {goal.targetValue} {goal.unit}</span>
                        <span style={{ color: '#C8F135', fontWeight: 700 }}>{goal.progressPercent || 0}%</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${goal.progressPercent || 0}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editGoal ? 'Edit Goal' : 'Create New Goal'} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="input-wrapper">
            <label className="input-label">Goal Title *</label>
            <input className="input" placeholder="e.g., Bench Press 100kg" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} id="goal-title-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-wrapper">
              <label className="input-label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {GOAL_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {['active', 'paused', 'completed', 'abandoned'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="input-wrapper">
              <label className="input-label">Current</label>
              <input className="input" type="number" placeholder="0" value={form.currentValue} onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))} />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Target</label>
              <input className="input" type="number" placeholder="100" value={form.targetValue} onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))} />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Unit</label>
              <input className="input" placeholder="kg, lbs, %" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
            </div>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-goal-btn">
            {saving ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Saving...</> : <>{editGoal ? 'Update Goal' : 'Create Goal'}</>}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="This goal and its progress will be permanently deleted."
        isLoading={deleting}
      />
    </DashboardLayout>
  );
};

export default Goals;
