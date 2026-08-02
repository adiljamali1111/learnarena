export default function LoadingSkeleton() {
  return (
    <div className="flex-1 px-4 md:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
        {/* Column 1 — 30% */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg skeleton-pulse" />
              <div className="h-4 w-36 skeleton-pulse rounded" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full skeleton-pulse shrink-0" />
                  <div className="h-3 flex-1 skeleton-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg skeleton-pulse" />
              <div className="h-4 w-36 skeleton-pulse rounded" />
            </div>
            <div className="flex gap-3 overflow-hidden">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="min-w-[200px] h-28 skeleton-pulse rounded-xl shrink-0"
                />
              ))}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg skeleton-pulse" />
              <div className="h-4 w-28 skeleton-pulse rounded" />
            </div>
            <div className="h-32 skeleton-pulse rounded-lg" />
          </div>
        </div>

        {/* Column 2 — 40% */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg skeleton-pulse" />
              <div className="h-4 w-36 skeleton-pulse rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full skeleton-pulse rounded" />
              <div className="h-3 w-3/4 skeleton-pulse rounded" />
              <div className="h-3 w-full skeleton-pulse rounded" />
              <div className="h-3 w-5/6 skeleton-pulse rounded" />
              <div className="h-10 w-full skeleton-pulse rounded-xl mt-2" />
              <div className="h-10 w-full skeleton-pulse rounded-xl" />
              <div className="h-10 w-full skeleton-pulse rounded-xl" />
            </div>
          </div>
        </div>

        {/* Column 3 — 30% */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg skeleton-pulse" />
              <div className="h-4 w-32 skeleton-pulse rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-full skeleton-pulse rounded-xl" />
              ))}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg skeleton-pulse" />
              <div className="h-4 w-32 skeleton-pulse rounded" />
            </div>
            <div className="h-3 w-full skeleton-pulse rounded mb-2" />
            <div className="h-3 w-1/2 skeleton-pulse rounded" />
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg skeleton-pulse" />
              <div className="h-4 w-32 skeleton-pulse rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-full skeleton-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}