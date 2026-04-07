/**
 * 조직도 컴포넌트
 * 향후 Notion DB에서 데이터를 가져올 예정
 * 현재는 정적 구조 플레이스홀더
 */

const orgData = {
  회장단: [
    { title: "회장", name: "(미정)" },
    { title: "부회장", name: "(미정)" },
  ],
  departments: [
    {
      name: "기획국",
      lead: { title: "국장", name: "(미정)" },
      members: ["(미정)", "(미정)"],
    },
    {
      name: "홍보국",
      lead: { title: "국장", name: "(미정)" },
      members: ["(미정)", "(미정)"],
    },
    {
      name: "총무국",
      lead: { title: "국장", name: "(미정)" },
      members: ["(미정)", "(미정)"],
    },
    {
      name: "체육국",
      lead: { title: "국장", name: "(미정)" },
      members: ["(미정)"],
    },
  ],
};

export default function OrgChart() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-dark mb-6">조직도</h2>

      {/* 회장단 */}
      <div className="flex justify-center gap-6 mb-8">
        {orgData.회장단.map((person) => (
          <div key={person.title} className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-primary">
                {person.name === "(미정)" ? "?" : person.name[0]}
              </span>
            </div>
            <p className="font-semibold text-dark text-sm">{person.name}</p>
            <p className="text-xs text-gray-text">{person.title}</p>
          </div>
        ))}
      </div>

      {/* 연결선 */}
      <div className="flex justify-center mb-8">
        <div className="w-px h-8 bg-gray-border" />
      </div>

      {/* 부서 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {orgData.departments.map((dept) => (
          <div key={dept.name} className="rounded-xl border border-gray-border p-4">
            <div className="bg-primary/5 rounded-lg px-3 py-2 mb-3 text-center">
              <p className="font-bold text-primary text-sm">{dept.name}</p>
            </div>

            <div className="text-center mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg font-bold text-primary">
                  {dept.lead.name === "(미정)" ? "?" : dept.lead.name[0]}
                </span>
              </div>
              <p className="font-medium text-dark text-sm">{dept.lead.name}</p>
              <p className="text-xs text-gray-text">{dept.lead.title}</p>
            </div>

            <div className="border-t border-gray-border pt-2 space-y-1">
              {dept.members.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-text">
                  <div className="w-6 h-6 rounded-full bg-gray-light flex items-center justify-center text-xs font-medium">
                    {m === "(미정)" ? "?" : m[0]}
                  </div>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-text text-center mt-6">
        * 구성원 정보는 추후 업데이트될 예정입니다.
      </p>
    </div>
  );
}
