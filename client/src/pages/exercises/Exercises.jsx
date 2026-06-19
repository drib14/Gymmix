import { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiStar, FiInfo, FiPlus, FiX, FiChevronDown } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ExerciseCardSkeleton } from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'core', 'abs', 'forearms', 'full_body', 'cardio'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const EQUIPMENT_LIST = ['bodyweight', 'barbell', 'dumbbell', 'machine', 'cable', 'resistance band', 'kettlebell', 'pull-up bar'];
const DIFF_COLORS = { beginner: '#22C55E', intermediate: '#F59E0B', advanced: '#EF4444' };

const ExerciseCard = ({ exercise, onViewDetails, isAdmin, onEdit, onDelete }) => {
  const muscleColor = {
    chest: '#EF4444', back: '#3B82F6', shoulders: '#A855F7', biceps: '#06B6D4',
    triceps: '#F97316', quads: '#22C55E', hamstrings: '#22C55E', glutes: '#22C55E',
    core: '#F59E0B', abs: '#F59E0B', cardio: '#EC4899',
  };

  return (
    <div className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'default' }}>
      {/* Exercise image */}
      <div style={{
        height: '140px', borderRadius: '10px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1A1F2C, #242A3A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {exercise.imageUrl ? (
          <img src={exercise.imageUrl} alt={exercise.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <GiMuscleUp size={48} style={{ color: '#2A3045', opacity: 0.6 }} />
        )}
        <span style={{
          position: 'absolute', top: '8px', right: '8px',
          background: `${DIFF_COLORS[exercise.difficulty] || '#6B7280'}22`,
          color: DIFF_COLORS[exercise.difficulty] || '#6B7280',
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: '100px', letterSpacing: '0.5px',
          border: `1px solid ${DIFF_COLORS[exercise.difficulty] || '#6B7280'}55`,
        }}>
          {exercise.difficulty}
        </span>
      </div>

      {/* Name + muscles */}
      <div>
        <h5 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '6px', fontSize: '0.95rem' }}>{exercise.name}</h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {[exercise.primaryMuscle, ...(exercise.secondaryMuscles || []).slice(0, 1)].filter(Boolean).map((m) => (
            <span key={m} style={{
              fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: '100px', textTransform: 'capitalize',
              background: `${muscleColor[m] || '#6B7280'}18`, color: muscleColor[m] || '#9CA3AF',
            }}>
              {m}
            </span>
          ))}
          {exercise.equipment && (
            <span style={{ fontSize: '0.65rem', fontWeight: 500, padding: '2px 7px', borderRadius: '100px', background: '#1A1F2C', color: '#6B7280', textTransform: 'capitalize' }}>
              {exercise.equipment}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onViewDetails(exercise)}>
          <FiInfo size={13} /> Details
        </button>
        {isAdmin && (
          <>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(exercise)} title="Edit"><FiPlus size={13} /></button>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onDelete(exercise._id)} style={{ color: '#EF4444' }} title="Delete"><FiX size={13} /></button>
          </>
        )}
      </div>
    </div>
  );
};

const Exercises = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({ search: '', muscle: '', difficulty: '', equipment: '', category: '' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchExercises = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await api.get('/exercises', { params });
      setExercises(res.data.data.exercises);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      toast.error('Failed to load exercises.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchExercises(1); }, 400);
    return () => clearTimeout(t);
  }, [filters]);

  const handleFilterChange = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exercise?')) return;
    try {
      await api.delete(`/exercises/${id}`);
      setExercises((prev) => prev.filter((e) => e._id !== id));
      toast.success('Exercise deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const FilterChip = ({ label, options, value, filterKey }) => (
    <div style={{ position: 'relative' }}>
      <select
        className="input"
        value={value}
        onChange={(e) => handleFilterChange(filterKey, e.target.value)}
        style={{ padding: '7px 36px 7px 12px', fontSize: '0.8rem', minWidth: '130px' }}
        id={`filter-${filterKey}`}
      >
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1).replace('_', ' ')}</option>)}
      </select>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Exercise Library</h2>
          <p>{total} exercises available</p>
        </div>
        {isAdmin && <button className="btn btn-primary"><FiPlus size={16} /> Add Exercise</button>}
      </div>

      {/* Search + Filters */}
      <div className="filter-bar">
        <div className="input-icon-wrapper" style={{ flex: 1, maxWidth: '360px' }}>
          <span className="input-icon"><FiSearch size={15} /></span>
          <input
            className="input"
            placeholder="Search exercises..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ padding: '9px 14px 9px 42px', fontSize: '0.875rem' }}
            id="exercise-search"
          />
        </div>

        <FilterChip label="All Muscles" options={MUSCLE_GROUPS} value={filters.muscle} filterKey="muscle" />
        <FilterChip label="Difficulty" options={DIFFICULTIES} value={filters.difficulty} filterKey="difficulty" />
        <FilterChip label="Equipment" options={EQUIPMENT_LIST} value={filters.equipment} filterKey="equipment" />

        {Object.values(filters).some(Boolean) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ search: '', muscle: '', difficulty: '', equipment: '', category: '' })}>
            <FiX size={14} /> Clear
          </button>
        )}
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 12 }).map((_, i) => <ExerciseCardSkeleton key={i} />)}
        </div>
      ) : exercises.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <h3>No exercises found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise._id}
              exercise={exercise}
              onViewDetails={(ex) => { setSelectedExercise(ex); setDetailOpen(true); }}
              isAdmin={isAdmin}
              onEdit={() => toast.info('Edit functionality in progress')}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); fetchExercises(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="btn"
              style={{
                padding: '6px 14px', fontSize: '0.85rem',
                background: p === page ? '#C8F135' : '#1A1F2C',
                color: p === page ? '#0D0F14' : '#9CA3AF',
                borderColor: p === page ? '#C8F135' : '#2A3045',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Exercise Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={selectedExercise?.name} size="md">
        {selectedExercise && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedExercise.imageUrl && (
              <img src={selectedExercise.imageUrl} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px' }} />
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{selectedExercise.primaryMuscle}</span>
              <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{selectedExercise.equipment}</span>
              <span className="badge" style={{ background: `${DIFF_COLORS[selectedExercise.difficulty]}22`, color: DIFF_COLORS[selectedExercise.difficulty], textTransform: 'capitalize' }}>
                {selectedExercise.difficulty}
              </span>
            </div>
            {selectedExercise.description && (
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{selectedExercise.description}</p>
            )}
            {selectedExercise.instructions?.length > 0 && (
              <div>
                <h5 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '10px' }}>Instructions</h5>
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedExercise.instructions.map((step, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.6 }}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            {selectedExercise.tips?.length > 0 && (
              <div style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '10px', padding: '14px' }}>
                <h6 style={{ color: '#C8F135', marginBottom: '8px' }}>💡 Pro Tips</h6>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedExercise.tips.map((tip, i) => (
                    <li key={i} style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Exercises;
