// Dynamic Skeleton Loader component
const Skeleton = ({ width, height, circle, className = '', style = {} }) => (
  <div
    className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`}
    style={{
      width: width || '100%',
      height: height || '16px',
      ...(circle ? { width: width || height || '40px', height: height || width || '40px' } : {}),
      ...style,
    }}
  />
);

// Pre-built skeleton compositions
export const ExerciseCardSkeleton = () => (
  <div className="skeleton-exercise-card">
    <Skeleton height="160px" className="skeleton-img" />
    <div style={{ display: 'flex', gap: '8px' }}>
      <Skeleton className="skeleton-badge" width="60px" height="22px" />
      <Skeleton className="skeleton-badge" width="80px" height="22px" />
    </div>
    <Skeleton className="skeleton-text-lg" width="70%" />
    <Skeleton className="skeleton-text" width="90%" />
    <Skeleton className="skeleton-text" width="60%" />
    <Skeleton className="skeleton-btn" height="36px" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="skeleton-stat-card">
    <Skeleton circle height="48px" width="48px" className="skeleton-stat-icon" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton className="skeleton-text-xl" width="50%" />
      <Skeleton className="skeleton-text" width="70%" />
    </div>
  </div>
);

export const WorkoutCardSkeleton = () => (
  <div className="skeleton-workout-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton className="skeleton-text-lg" width="60%" />
        <Skeleton className="skeleton-text" width="80%" />
      </div>
      <Skeleton width="36px" height="36px" circle />
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="skeleton-badge" width="70px" height="22px" />
      ))}
    </div>
    <Skeleton className="skeleton-btn" height="38px" />
  </div>
);

export const ListItemSkeleton = () => (
  <div className="skeleton-list-item">
    <Skeleton circle width="44px" height="44px" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton className="skeleton-text" width="50%" />
      <Skeleton className="skeleton-text" width="80%" />
    </div>
    <Skeleton width="70px" height="32px" style={{ borderRadius: '8px' }} />
  </div>
);

export const ChartSkeleton = ({ height = '250px' }) => (
  <div className="skeleton-chart" style={{ minHeight: height }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton className="skeleton-text-lg" width="40%" />
      <Skeleton className="skeleton-text" width="60%" />
      <div style={{ height: height, marginTop: '8px' }} className="skeleton" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="skeleton-table">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="skeleton-table-row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="skeleton-text" width={c === 0 ? '80%' : '60%'} />
        ))}
      </div>
    ))}
  </div>
);

export const PageHeaderSkeleton = () => (
  <div className="skeleton-page-header">
    <Skeleton className="skeleton-text-xl" width="35%" />
    <Skeleton className="skeleton-text" width="55%" />
  </div>
);

export default Skeleton;
