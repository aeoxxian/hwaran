import Link from "next/link";
import { mockClubs, mockClubMembers } from "@/lib/mock-data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mockClubs.map((c) => ({ id: c.id }));
}

export default async function ClubDetailPage({ params }: Props) {
  const { id } = await params;
  const club = mockClubs.find((c) => c.id === id);
  if (!club) notFound();

  const members = mockClubMembers.filter((m) => m.clubId === id);
  const leader = members.find((m) => m.role === "회장");
  const viceLeader = members.find((m) => m.role === "부회장");
  const regularMembers = members.filter((m) => m.role === "회원");

  return (
    <div className="container-page">
      <Link href="/clubs" className="inline-flex items-center gap-1 text-gray-text hover:text-primary transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        동아리 목록
      </Link>

      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shrink-0">
            {club.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-primary">{club.category}</span>
              <span className="text-sm text-gray-text">{club.memberCount}명</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-3">{club.name}</h1>
            <p className="text-gray-text leading-relaxed">{club.description}</p>

            {club.instagramUrl && (
              <a
                href={club.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                </svg>
                Instagram 방문하기
              </a>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title mb-6">구성원</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leader && (
            <div className="card border-l-4 !border-l-primary">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {leader.name[0]}
                </div>
                <div>
                  <span className="badge-primary text-xs">회장</span>
                  <h3 className="font-semibold text-dark mt-1">{leader.name}</h3>
                  {leader.introduction && <p className="text-sm text-gray-text">{leader.introduction}</p>}
                </div>
              </div>
            </div>
          )}
          {viceLeader && (
            <div className="card border-l-4 !border-l-primary-light">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-light text-white flex items-center justify-center font-bold text-lg">
                  {viceLeader.name[0]}
                </div>
                <div>
                  <span className="badge bg-primary-100 text-primary text-xs">부회장</span>
                  <h3 className="font-semibold text-dark mt-1">{viceLeader.name}</h3>
                  {viceLeader.introduction && <p className="text-sm text-gray-text">{viceLeader.introduction}</p>}
                </div>
              </div>
            </div>
          )}
          {regularMembers.map((member) => (
            <div key={member.id} className="card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-light text-gray-text flex items-center justify-center font-bold text-lg">
                  {member.name[0]}
                </div>
                <div>
                  <span className="badge bg-gray-light text-gray-text text-xs">회원</span>
                  <h3 className="font-semibold text-dark mt-1">{member.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
