/**
 * 조직도 컴포넌트
 * Notion DB의 조직도 데이터를 동적으로 렌더링합니다.
 */

import Image from "next/image";
import { getOrgChartMembers } from "@/lib/data";
import type { OrgChartMember } from "@/lib/types";

function PersonAvatar({ name, title, size = "md" }: { name: string; title: string; size?: "lg" | "md" | "sm" }) {
  const sizeClasses = {
    lg: "w-20 h-20 text-2xl",
    md: "w-14 h-14 text-lg",
    sm: "w-8 h-8 text-xs",
  };
  return (
    <div className="text-center">
      <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5`}>
        <span className="font-bold text-primary">{name[0]}</span>
      </div>
      <p className="font-semibold text-dark text-sm">{name}</p>
      <p className="text-xs text-gray-text">{title}</p>
    </div>
  );
}

interface DepartmentView {
  name: string;
  lead?: OrgChartMember;
  teams: Array<{ name: string; lead?: OrgChartMember; members: OrgChartMember[] }>;
  generalMembers: OrgChartMember[];
}

function isLeadTitle(title: string): boolean {
  return title.includes("국장") || title.includes("회장");
}

function isTeamLeadTitle(title: string): boolean {
  return title.includes("팀장");
}

function buildDepartmentView(name: string, members: OrgChartMember[]): DepartmentView {
  const lead = members.find((m) => !m.team && isLeadTitle(m.title));
  const teamsMap = new Map<string, { lead?: OrgChartMember; members: OrgChartMember[] }>();
  const generalMembers: OrgChartMember[] = [];

  for (const m of members) {
    if (m === lead) continue;
    if (m.team) {
      const entry = teamsMap.get(m.team) || { members: [] };
      if (isTeamLeadTitle(m.title) && !entry.lead) entry.lead = m;
      else entry.members.push(m);
      teamsMap.set(m.team, entry);
    } else {
      generalMembers.push(m);
    }
  }

  const teams = Array.from(teamsMap.entries()).map(([teamName, t]) => ({
    name: teamName,
    lead: t.lead,
    members: t.members,
  }));

  return { name, lead, teams, generalMembers };
}

export default async function OrgChart() {
  const all = await getOrgChartMembers();

  const byDepartment = new Map<string, OrgChartMember[]>();
  for (const m of all) {
    if (!byDepartment.has(m.department)) byDepartment.set(m.department, []);
    byDepartment.get(m.department)!.push(m);
  }

  const leadership = byDepartment.get("회장단") ?? [];
  const otherDepartmentNames = Array.from(byDepartment.keys()).filter((d) => d !== "회장단");
  const departments = otherDepartmentNames.map((name) => buildDepartmentView(name, byDepartment.get(name) ?? []));

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-8">
        <Image src="/logo.png" alt="화란 로고" width={36} height={36} className="rounded-lg" />
        <h2 className="text-2xl font-bold text-dark">제4대 동아리연합회 화란 조직도</h2>
      </div>

      {/* 회장단 */}
      {leadership.length > 0 && (
        <div className="flex justify-center gap-10 mb-6 flex-wrap">
          {leadership.map((person) => (
            <PersonAvatar key={person.id} name={person.name} title={person.title} size="lg" />
          ))}
        </div>
      )}

      {/* 연결선 */}
      {departments.length > 0 && (
        <>
          <div className="flex justify-center mb-6">
            <div className="w-px h-8 bg-gray-border" />
          </div>
          <div className="relative flex justify-center mb-6">
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gray-border" />
            <div className="flex justify-between w-1/2">
              {departments.map((_, idx) => (
                <div key={idx} className="w-px h-4 bg-gray-border" />
              ))}
            </div>
          </div>
        </>
      )}

      {/* 부서 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => (
          <div key={dept.name} className="rounded-xl border border-gray-border overflow-hidden">
            <div className="bg-primary text-white px-4 py-2.5 text-center">
              <p className="font-bold text-sm">{dept.name}</p>
            </div>

            <div className="p-4">
              {dept.lead && (
                <div className="mb-4">
                  <PersonAvatar name={dept.lead.name} title={dept.lead.title} size="md" />
                </div>
              )}

              {dept.teams.length > 0 && (
                <div className="space-y-3 mb-3">
                  {dept.teams.map((team) => (
                    <div key={team.name} className="rounded-lg bg-primary-50/50 p-2.5">
                      <p className="text-xs font-semibold text-primary text-center mb-2">{team.name}</p>
                      {team.lead && (
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{team.lead.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-dark">{team.lead.name}</p>
                            <p className="text-[10px] text-gray-text">{team.lead.title}</p>
                          </div>
                        </div>
                      )}
                      {team.members.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-1.5">
                          {team.members.map((m) => (
                            <span key={m.id} className="inline-flex items-center gap-1 text-[11px] text-gray-text bg-white rounded-full px-2 py-0.5">
                              {m.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {dept.generalMembers.length > 0 && (
                <div className="border-t border-gray-border pt-2.5">
                  <p className="text-[10px] font-semibold text-gray-text uppercase tracking-wider mb-1.5">국원</p>
                  <div className="flex flex-wrap gap-1">
                    {dept.generalMembers.map((m) => (
                      <span key={m.id} className="inline-flex items-center gap-1 text-xs text-gray-text">
                        <span className="w-5 h-5 rounded-full bg-gray-light flex items-center justify-center text-[10px] font-medium text-dark">
                          {m.name[0]}
                        </span>
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
