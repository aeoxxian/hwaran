/**
 * 구성원 카드 컴포넌트
 * 제4대 동아리연합회 화란 전체 구성원
 */

const allMembers = [
  { name: "김서정", role: "동아리연합회장", dept: "회장단" },
  { name: "박은규", role: "동아리연합부회장", dept: "회장단" },
  { name: "서민재", role: "국장", dept: "행사기획국" },
  { name: "송정후", role: "국원", dept: "행사기획국" },
  { name: "김윤서", role: "국원", dept: "행사기획국" },
  { name: "전은비", role: "국장", dept: "사무국" },
  { name: "이승훈", role: "국원", dept: "사무국" },
  { name: "김도유", role: "국원", dept: "사무국" },
  { name: "안정웅", role: "국원", dept: "사무국" },
  { name: "이서빈", role: "국장", dept: "홍보디자인국" },
  { name: "김현우", role: "국원", dept: "홍보디자인국" },
  { name: "장준형", role: "국원", dept: "홍보디자인국" },
  { name: "남은수", role: "디자인팀 팀장", dept: "홍보디자인국" },
  { name: "최민", role: "국원", dept: "홍보디자인국" },
  { name: "고이삭", role: "국원", dept: "홍보디자인국" },
  { name: "김승우", role: "사이트개발팀 팀장", dept: "홍보디자인국" },
  { name: "조윤서", role: "국원", dept: "홍보디자인국" },
  { name: "송현우", role: "국장", dept: "동아리관리국" },
  { name: "이중헌", role: "국원", dept: "동아리관리국" },
  { name: "황아진", role: "국원", dept: "동아리관리국" },
  { name: "백시연", role: "국원", dept: "동아리관리국" },
  { name: "송은율", role: "국원", dept: "동아리관리국" },
  { name: "노윤서", role: "대외업무팀 팀장", dept: "동아리관리국" },
  { name: "주예슬", role: "대내업무팀 팀장", dept: "동아리관리국" },
];

const deptColors: Record<string, string> = {
  "회장단": "bg-primary/10 text-primary border-primary/20",
  "행사기획국": "bg-amber-50 text-amber-700 border-amber-200",
  "사무국": "bg-blue-50 text-blue-700 border-blue-200",
  "홍보디자인국": "bg-purple-50 text-purple-700 border-purple-200",
  "동아리관리국": "bg-green-50 text-green-700 border-green-200",
};

const roleStyle = (role: string) => {
  if (role.includes("회장")) return "bg-primary text-white";
  if (role === "국장") return "bg-gray-800 text-white";
  if (role.includes("팀장")) return "bg-gray-600 text-white";
  return "bg-gray-light text-gray-text";
};

export default function MemberCards() {
  const departments = ["회장단", "행사기획국", "사무국", "홍보디자인국", "동아리관리국"];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-dark mb-2">구성원</h2>
      <p className="text-gray-text mb-6">제4대 동아리연합회 화란 — 총 {allMembers.length}명</p>

      <div className="space-y-6">
        {departments.map((dept) => {
          const members = allMembers.filter((m) => m.dept === dept);
          return (
            <div key={dept}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${deptColors[dept]}`}>
                  {dept}
                </span>
                <span className="text-xs text-gray-text">{members.length}명</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {members.map((member) => (
                  <div key={member.name} className="rounded-xl border border-gray-border p-3 text-center hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-primary">{member.name[0]}</span>
                    </div>
                    <p className="text-sm font-semibold text-dark">{member.name}</p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${roleStyle(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
