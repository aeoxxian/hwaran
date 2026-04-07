export default function CalendarLoading() {
  return (
    <div className="container-page animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-gray-light rounded w-32 mb-3" />
        <div className="h-4 bg-gray-light rounded w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl border border-gray-border overflow-hidden">
            <div className="h-14 bg-primary/20" />
            <div className="grid grid-cols-7 gap-px bg-gray-border">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-surface" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-gray-border p-5 h-64" />
      </div>
    </div>
  );
}
