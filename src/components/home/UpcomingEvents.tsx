import Link from "next/link";
import { CalendarEvent } from "@/lib/types";

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const upcoming = events
    .filter((e) => new Date(e.startDate) >= new Date("2026-03-15"))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4);

  return (
    <section className="py-16 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">다가오는 일정</h2>
            <p className="section-subtitle">놓치지 마세요!</p>
          </div>
          <Link href="/calendar" className="btn-ghost text-primary hover:text-primary-dark">
            전체 일정 &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcoming.map((event) => {
            const date = new Date(event.startDate);
            const month = date.toLocaleDateString("ko-KR", { month: "short" });
            const day = date.getDate();

            return (
              <div key={event.id} className="card !p-0 overflow-hidden">
                <div className="flex">
                  <div
                    className="w-20 flex flex-col items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: event.color || "#E05252" }}
                  >
                    <span className="text-xs font-medium opacity-80">{month}</span>
                    <span className="text-2xl font-bold">{day}</span>
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <h3 className="font-semibold text-dark text-sm truncate">{event.title}</h3>
                    {event.clubName && (
                      <span className="text-xs text-gray-text">{event.clubName}</span>
                    )}
                    {event.location && (
                      <p className="text-xs text-gray-text mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
