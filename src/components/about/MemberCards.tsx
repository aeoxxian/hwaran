/**
 * 구성원 카드 컴포넌트
 * Notion DB의 조직도 데이터를 기반으로 동적으로 렌더링합니다.
 */

import { getOrgChartMembers } from "@/lib/data";
import type { OrgChartMember } from "@/lib/types";

const deptColors: Record<string, string> = {
  "회장단": "bg-primary/10 text-primary border-primary/20",
  "행사기획국": "bg-amber-50 text-amber-700 border-amber-200",
  "사무국": "bg-blue-50 text-blue-700 border-blue-200",
  "홍보디자인국": "bg-purple-50 text-purple-700 border-purple-200",
  "동아리관리국": "bg-green-50 text-green-700 border-green-200",
};

const DEFAULT_DEPT_COLOR = "bg-gray-100 text-gray-700 border-gray-200";

const roleStyle = (title: string) => {
  if (title.includes("회장")) return "bg-primary text-white";
  if (title === "국장") return "bg-gray-800 text-white";
  if (title.includes("팀장")) return "bg-gray-600 text-white";
  return "bg-gray-light text-gray-text";
};

export default async function MemberCards() {
  const allMembers = await getOrgChartMembers();

  const orderedDepartments: string[] = [];
  for (const m of allMembers) {
    if (!orderedDepartments.includes(m.department)) orderedDepartments.push(m.department);
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-dark mb-2">구성원</h2>
      <p className="text-gray-text mb-6">제4대 동아리연합회 화란 — 총 {allMembers.length}명</p>

      <div className="space-y-6">
        {orderedDepartments.map((dept) => {
          const members = allMembers.filter((m) => m.department === dept);
          const teams = new Map<string, OrgChartMember[]>();
          const noTeam: OrgChartMember[] = [];
          members.forEach((m) => {
            if (m.team) {
              if (!teams.has(m.team)) teams.set(m.team, []);
              teams.get(m.team)!.push(m);
            } else {
              noTeam.push(m);
            }
          });

          return (
            <div key={dept}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${deptColors[dept] || DEFAULT_DEPT_COLOR}`}>
                  {dept}
                </span>
                <span className="text-xs text-gray-text">{members.length}명</span>
              </div>

              {noTeam.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-3">
                  {noTeam.map((member) => (
                    <div key={member.id} className="rounded-xl border border-gray-border p-3 text-center hover:border-primary/30 hover:shadow-sm transition-all">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg font-bold text-primary">{member.name[0]}</span>
                      </div>
                      <p className="text-sm font-semibold text-dark">{member.name}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${roleStyle(member.title)}`}>
                        {member.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {teams.size > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from(teams.entries()).map(([teamName, teamMembers]) => (
                    <div key={teamName} className="rounded-xl border border-gray-border p-4">
                      <p className="text-xs font-semibold text-primary mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {teamName}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="text-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                              <span className="text-sm font-bold text-primary">{member.name[0]}</span>
                            </div>
                            <p className="text-xs font-semibold text-dark">{member.name}</p>
                            <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${roleStyle(member.title)}`}>
                              {member.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
