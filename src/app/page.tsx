import HomeServiceLinks from "@/components/home/HomeServiceLinks";
import MiniCalendar from "@/components/home/MiniCalendar";
import ExternalLinks from "@/components/home/ExternalLinks";
import Link from "next/link";
import { mockNotices, mockEvents, mockExternalChannels } from "@/lib/mock-data";

export default function HomePage() {
  const pinnedNotices = mockNotices.filter((n) => n.isPinned).slice(0, 3);
  return (
    <>
      <section className="py-12 bg-white border-b border-gray-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-dark">중요 공지사항</h2>
                <Link href="/notices" className="text-sm text-primary hover:text-primary-dark">
                  전체보기
                </Link>
              </div>
              <div className="space-y-3">
                {pinnedNotices.map((notice) => (
                  <Link key={notice.id} href={`/notices/${notice.id}`} className="block rounded-lg border border-gray-border p-3 hover:bg-gray-light/50">
                    <div className="flex items-start gap-2">
                      <span className="badge-primary">중요</span>
                      <div className="min-w-0">
                        <p className="font-medium text-dark truncate">{notice.title}</p>
                        <p className="text-xs text-gray-text mt-1">{notice.createdAt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <MiniCalendar events={mockEvents} />
          </div>
        </div>
      </section>
      <HomeServiceLinks />
      <ExternalLinks channels={mockExternalChannels} />
    </>
  );
}
