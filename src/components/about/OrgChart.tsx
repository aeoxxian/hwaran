/**
 * 조직도 컴포넌트
 * 제4대 동아리연합회 화란 조직 구성
 */

import Image from "next/image";

interface Person {
  name: string;
  title: string;
}

interface Team {
  name: string;
  lead: Person;
  members: string[];
}

interface Department {
  name: string;
  lead: Person;
  teams?: Team[];
  members: string[];
}

const orgData = {
  회장단: [
    { title: "동아리연합회장", name: "김서정" },
    { title: "동아리연합부회장", name: "박은규" },
  ] as Person[],
  departments: [
    {
      name: "행사기획국",
      lead: { title: "국장", name: "서민재" },
      members: ["송정후", "김윤서"],
    },
    {
      name: "사무국",
      lead: { title: "국장", name: "전은비" },
      members: ["이승훈", "김도유", "안정웅"],
    },
    {
      name: "홍보디자인국",
      lead: { title: "국장", name: "이서빈" },
      teams: [
        {
          name: "디자인팀",
          lead: { title: "팀장", name: "남은수" },
          members: ["장준형", "조윤서"],
        },
        {
          name: "웹사이트 개발팀",
          lead: { title: "팀장", name: "김승우" },
          members: ["고이삭", "김현우"],
        },
      ],
      members: ["최민"],
    },
    {
      name: "동아리관리국",
      lead: { title: "국장", name: "송현우" },
      teams: [
        {
          name: "대내업무팀",
          lead: { title: "팀장", name: "노윤서" },
          members: ["송은율", "황아진"],
        },
        {
          name: "대외업무팀",
          lead: { title: "팀장", name: "주예슬" },
          members: ["백시연", "이중헌"],
        },
      ],
      members: [],
    },
  ] as Department[],
};

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

export default function OrgChart() {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-8">
        <Image src="/logo.png" alt="화란 로고" width={36} height={36} className="rounded-lg" />
        <h2 className="text-2xl font-bold text-dark">제4대 동아리연합회 화란 조직도</h2>
      </div>

      {/* 회장단 */}
      <div className="flex justify-center gap-10 mb-6">
        {orgData.회장단.map((person) => (
          <PersonAvatar key={person.name} name={person.name} title={person.title} size="lg" />
        ))}
      </div>

      {/* 연결선 */}
      <div className="flex justify-center mb-6">
        <div className="w-px h-8 bg-gray-border" />
      </div>
      <div className="relative flex justify-center mb-6">
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gray-border" />
        <div className="flex justify-between w-1/2">
          {orgData.departments.map((_, idx) => (
            <div key={idx} className="w-px h-4 bg-gray-border" />
          ))}
        </div>
      </div>

      {/* 부서 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {orgData.departments.map((dept) => (
          <div key={dept.name} className="rounded-xl border border-gray-border overflow-hidden">
            {/* 부서 헤더 */}
            <div className="bg-primary text-white px-4 py-2.5 text-center">
              <p className="font-bold text-sm">{dept.name}</p>
            </div>

            <div className="p-4">
              {/* 국장 */}
              <div className="mb-4">
                <PersonAvatar name={dept.lead.name} title={dept.lead.title} size="md" />
              </div>

              {/* 팀 (있는 경우) */}
              {dept.teams && dept.teams.length > 0 && (
                <div className="space-y-3 mb-3">
                  {dept.teams.map((team) => (
                    <div key={team.name} className="rounded-lg bg-primary-50/50 p-2.5">
                      <p className="text-xs font-semibold text-primary text-center mb-2">{team.name}</p>
                      <div className="flex items-center gap-2 justify-center mb-1">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{team.lead.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-dark">{team.lead.name}</p>
                          <p className="text-[10px] text-gray-text">{team.lead.title}</p>
                        </div>
                      </div>
                      {team.members.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-1.5">
                          {team.members.map((m) => (
                            <span key={m} className="inline-flex items-center gap-1 text-[11px] text-gray-text bg-white rounded-full px-2 py-0.5">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 일반 국원 */}
              {dept.members.length > 0 && (
                <div className="border-t border-gray-border pt-2.5">
                  <p className="text-[10px] font-semibold text-gray-text uppercase tracking-wider mb-1.5">국원</p>
                  <div className="flex flex-wrap gap-1">
                    {dept.members.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1 text-xs text-gray-text">
                        <span className="w-5 h-5 rounded-full bg-gray-light flex items-center justify-center text-[10px] font-medium text-dark">
                          {m[0]}
                        </span>
                        {m}
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
