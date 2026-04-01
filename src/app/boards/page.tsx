import Link from "next/link";
import { mockBoardPosts } from "@/lib/mock-data";

type BoardCard = {
  key: "qna" | "complaints" | "lost-found" | "promotions";
  title: string;
  subtitle: string;
  href: string;
};

const BOARD_CARDS: BoardCard[] = [
  { key: "qna", title: "문의 게시판", subtitle: "궁금한 사항을 질문하고 답변받으세요.", href: "/boards/qna" },
  { key: "complaints", title: "민원 게시판", subtitle: "민원/건의사항을 접수하고 처리 상태를 확인하세요.", href: "/boards/complaints" },
  { key: "lost-found", title: "분실물 게시판", subtitle: "분실물·습득물을 등록하고 찾을 수 있어요.", href: "/boards/lost-found" },
  { key: "promotions", title: "동아리 홍보글", subtitle: "동아리 소식과 모집 공고를 확인해보세요.", href: "/boards/promotions" },
];

export const metadata = { title: "커뮤니티" };

export default function BoardsHubPage() {
  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">커뮤니티</h1>
        <p className="section-subtitle">소통과 공유를 위한 게시판 허브</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BOARD_CARDS.map((board) => {
          const latest = mockBoardPosts.filter((p) => p.category === board.key).slice(0, 3);
          return (
            <section key={board.key} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-dark">{board.title}</h2>
                  <p className="text-sm text-gray-text mt-1">{board.subtitle}</p>
                </div>
                <Link href={board.href} className="btn-primary !px-3 !py-1.5 text-sm">
                  바로가기
                </Link>
              </div>
              <ul className="space-y-2">
                {latest.length === 0 ? (
                  <li className="text-sm text-gray-text">아직 등록된 글이 없습니다.</li>
                ) : (
                  latest.map((post) => (
                    <li key={post.id}>
                      <Link href={board.href} className="text-sm text-dark hover:text-primary line-clamp-1">
                        {post.title}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
