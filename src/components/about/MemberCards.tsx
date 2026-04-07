/**
 * 구성원 카드 컴포넌트
 * 향후 Notion DB(Members)에서 데이터를 가져올 예정
 * 현재는 플레이스홀더
 */

export default function MemberCards() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-dark mb-4">구성원</h2>
      <p className="text-gray-text mb-6">
        회장단, 국장단, 국원 소개 섹션입니다. Notion DB 연동 후 자동으로 표시됩니다.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border border-dashed border-gray-border p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-light flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-text">데이터 준비 중</p>
            <p className="text-xs text-gray-text/60 mt-1">역할</p>
          </div>
        ))}
      </div>
    </div>
  );
}
