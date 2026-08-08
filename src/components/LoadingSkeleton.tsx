export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 animate-fade-in">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <div className="skeleton-pulse h-4 w-3/4" />
          <div className="skeleton-pulse h-3 w-full" />
          <div className="skeleton-pulse h-3 w-5/6" />
          <div className="skeleton-pulse h-3 w-2/3" />
          <div className="skeleton-pulse h-8 w-24 mt-2" />
        </div>
      ))}
    </div>
  );
}