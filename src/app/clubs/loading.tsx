export default function ClubsLoading() {
  return (
    <div className="container-page animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-gray-light rounded w-40 mb-3" />
        <div className="h-4 bg-gray-light rounded w-72" />
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-light rounded-full w-16" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-gray-border overflow-hidden">
            <div className="h-40 bg-gray-light" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-light rounded w-24" />
              <div className="h-5 bg-gray-light rounded w-32" />
              <div className="h-4 bg-gray-light rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
