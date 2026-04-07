import Link from "next/link";
import type { InventoryItem, BoardPost, Document } from "@/lib/types";

const shortcutTiles = [
  {
    href: "/notices",
    label: "공지사항",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    href: "/clubs",
    label: "동아리 소개",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/calendar",
    label: "캘린더",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/boards/qna",
    label: "문의 게시판",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
] as const;

interface HomeServiceLinksProps {
  inventory: InventoryItem[];
  lostFound: BoardPost[];
  documents: Document[];
}

export default function HomeServiceLinks({ inventory, lostFound, documents }: HomeServiceLinksProps) {
  const invTotal = inventory.length;
  const invAvailable = inventory.filter((i) => i.status === "사용가능").length;
  const invRented = inventory.filter((i) => i.status === "대여중").length;
  const invRepair = inventory.filter((i) => i.status === "수리중").length;

  const importantDocs = documents.filter(
    (d) => d.category === "회칙" || d.category === "양식"
  );

  return (
    <section className="py-16 bg-gray-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(240px,280px)] gap-10 lg:gap-12 items-start">
          <div className="space-y-10">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="section-title">물품 관리 현황</h2>
                <Link href="/inventory" className="text-sm text-primary hover:text-primary-dark shrink-0">
                  전체 보기
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl bg-surface border border-gray-border p-3 text-center">
                  <p className="text-2xl font-bold text-dark">{invTotal}</p>
                  <p className="text-xs text-gray-text mt-1">등록 물품</p>
                </div>
                <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{invAvailable}</p>
                  <p className="text-xs text-green-800/80 mt-1">사용가능</p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">{invRented}</p>
                  <p className="text-xs text-amber-800/80 mt-1">대여중</p>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{invRepair}</p>
                  <p className="text-xs text-red-800/80 mt-1">수리중</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-border bg-surface overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-light text-left text-xs text-gray-text uppercase">
                    <tr>
                      <th className="px-4 py-2 font-semibold">물품</th>
                      <th className="px-4 py-2 font-semibold hidden sm:table-cell">위치</th>
                      <th className="px-4 py-2 font-semibold">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-border">
                    {inventory.slice(0, 4).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-light/40">
                        <td className="px-4 py-2.5 font-medium text-dark">{item.name}</td>
                        <td className="px-4 py-2.5 text-gray-text hidden sm:table-cell">{item.location}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={
                              item.status === "사용가능"
                                ? "badge-success"
                                : item.status === "대여중"
                                  ? "badge-warning"
                                  : "badge-danger"
                            }
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="section-title">분실물 게시</h2>
                <Link href="/boards/lost-found" className="text-sm text-primary hover:text-primary-dark shrink-0">
                  게시판으로 이동
                </Link>
              </div>
              <div className="space-y-2">
                {lostFound.length === 0 ? (
                  <p className="text-sm text-gray-text">등록된 글이 없습니다.</p>
                ) : (
                  lostFound.slice(0, 4).map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-border bg-surface px-4 py-3"
                    >
                      <p className="font-medium text-dark text-sm truncate">{post.title}</p>
                      <span className="text-xs text-gray-text shrink-0">{post.createdAt}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="section-title">자료실 · 중요 양식</h2>
                <Link href="/documents" className="text-sm text-primary hover:text-primary-dark shrink-0">
                  자료실 전체
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {importantDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    className="flex items-center gap-3 rounded-lg border border-gray-border bg-surface p-4 hover:border-primary hover:bg-primary-50/30 transition-colors"
                  >
                    <span className="badge-primary shrink-0">{doc.category}</span>
                    <span className="text-sm font-medium text-dark line-clamp-2">{doc.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
            <p className="text-sm font-semibold text-dark mb-4 text-center lg:text-left">바로가기</p>
            <div className="grid grid-cols-2 gap-4">
              {shortcutTiles.map((tile) => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className="group flex flex-col items-center text-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span className="flex aspect-square w-full max-w-[132px] mx-auto items-center justify-center rounded-2xl border-2 border-gray-border bg-surface text-primary transition-colors group-hover:border-primary group-hover:bg-primary-50">
                    {tile.icon}
                  </span>
                  <span className="mt-3 text-sm font-semibold text-dark group-hover:text-primary transition-colors">
                    {tile.label}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
