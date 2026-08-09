export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-6 min-h-[200px]"
          style={{
            gridColumn:
              i === 0 ? '1 / -1' : i === 3 ? 'span 1' : undefined,
          }}
        >
          <div className="skeleton-pulse h-6 w-3/4 mb-4" />
          <div className="skeleton-pulse h-4 w-full mb-2" />
          <div className="skeleton-pulse h-4 w-5/6 mb-2" />
          <div className="skeleton-pulse h-4 w-2/3 mb-4" />
          <div className="flex gap-2">
            <div className="skeleton-pulse h-8 w-20 rounded-lg" />
            <div className="skeleton-pulse h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}