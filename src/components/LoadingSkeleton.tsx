export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-nebula p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-72" />
        </div>
        <div className="skeleton h-10 w-40 rounded-lg" />
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-10 w-28 rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="dark-glass rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
            <div className="skeleton h-3 w-4/6" />
            <div className="skeleton h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="skeleton h-4 w-64 mx-auto mt-8" />
    </div>
  );
}
