export default function NoticesLoading() {
  return (
    <div className="container-page animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-gray-light rounded w-40 mb-3" />
        <div className="h-4 bg-gray-light rounded w-72" />
      </div>
      <div className="bg-surface rounded-xl border border-gray-border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-border last:border-0">
            <div className="h-4 bg-gray-light rounded w-8" />
            <div className="h-4 bg-gray-light rounded flex-1" />
            <div className="h-4 bg-gray-light rounded w-20 hidden sm:block" />
            <div className="h-4 bg-gray-light rounded w-24 hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
