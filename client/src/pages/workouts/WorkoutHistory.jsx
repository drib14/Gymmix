import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiActivity, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';
import useToast from '../../hooks/useToast';

const WorkoutHistory = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    document.title = 'Gymmix | Workout History';
  }, []);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = async (p) => {
    setLoading(true);
    try {
      const res = await api.get('/workout-logs', { params: { page: p, limit: 15 } });
      setLogs(res.data.data.logs || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch { toast.error('Failed to load workout history.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/workout-logs/${deleteConfirm.id}`);
      setLogs((prev) => prev.filter((l) => l._id !== deleteConfirm.id));
      toast.success('Workout log deleted.');
    } catch { toast.error('Failed to delete log.'); }
    finally { setDeleting(false); setDeleteConfirm({ open: false, id: null }); }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Workout History</h2>
          <p>Track your completed training sessions</p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No workout logs yet</h3>
          <p>Complete a workout to see your history here</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1F2535', background: '#12151C' }}>
                  {['Date', 'Session Name', 'Duration', 'Volume', 'Sets', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr
                    key={log._id}
                    style={{ borderBottom: '1px solid #1F2535', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#12151C')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => { setSelectedLog(log); setDetailOpen(true); }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#9CA3AF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiCalendar size={13} style={{ color: '#C8F135' }} />
                        {format(new Date(log.startTime), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F0F2F8', margin: 0 }}>
                        {log.workoutPlanName || log.dayName || 'Custom Workout'}
                      </p>
                      {log.musclesWorked?.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {log.musclesWorked.slice(0, 3).map((m) => (
                            <span key={m} style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'capitalize' }}>{m}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#9CA3AF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={13} />
                        {log.durationMinutes ? `${log.durationMinutes}m` : '-'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#C8F135', fontWeight: 600 }}>
                      {log.totalVolume ? `${(log.totalVolume / 1000).toFixed(1)}t` : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#9CA3AF' }}>
                      {log.totalSets || 0} sets / {log.totalReps || 0} reps
                    </td>
                    <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setDeleteConfirm({ open: true, id: log._id })}
                        style={{ color: '#EF4444' }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #1F2535', display: 'flex', justifyContent: 'center', gap: '6px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className="btn btn-sm"
                  style={{ padding: '4px 12px', background: p === page ? '#C8F135' : '#1A1F2C', color: p === page ? '#0D0F14' : '#9CA3AF', borderColor: p === page ? '#C8F135' : '#2A3045' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Workout Session Details" size="md">
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: 'Duration', value: `${selectedLog.durationMinutes || '-'} min` },
                { label: 'Total Sets', value: selectedLog.totalSets || 0 },
                { label: 'Volume', value: selectedLog.totalVolume ? `${(selectedLog.totalVolume / 1000).toFixed(1)}t` : '-' },
              ].map((s) => (
                <div key={s.label} style={{ background: '#1A1F2C', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#C8F135', margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
            {selectedLog.notes && (
              <div style={{ background: '#1A1F2C', borderRadius: '10px', padding: '14px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '4px' }}>Notes</p>
                <p style={{ fontSize: '0.875rem', color: '#F0F2F8', margin: 0 }}>{selectedLog.notes}</p>
              </div>
            )}
            {selectedLog.exercises?.map((ex, i) => (
              <div key={i} style={{ background: '#1A1F2C', borderRadius: '10px', padding: '14px' }}>
                <p style={{ fontWeight: 700, color: '#F0F2F8', marginBottom: '8px', fontSize: '0.9rem' }}>
                  {ex.exercise?.name || ex.exerciseName}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {ex.sets?.filter((s) => s.isCompleted).map((set, si) => (
                    <span key={si} style={{ background: '#12151C', border: '1px solid #2A3045', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', color: '#9CA3AF' }}>
                      Set {si + 1}: {set.reps} reps {set.weight ? `× ${set.weight}kg` : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Workout Log"
        message="This will permanently delete this workout session."
        confirmText="Delete"
        isLoading={deleting}
      />
    </DashboardLayout>
  );
};

export default WorkoutHistory;
