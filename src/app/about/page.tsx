import type { Metadata } from "next";
import AboutSection from "@/components/home/AboutSection";

export const metadata: Metadata = { title: "소개" };

export default function AboutPage() {
  return (
    <div className="pb-12">
      <AboutSection />

      <section className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-dark mb-3">조직도</h2>
            <p className="text-gray-text mb-4">
              동아리연합회 조직도를 이 영역에 추가할 예정입니다.
            </p>
            <div className="rounded-lg border border-dashed border-gray-border p-8 text-center text-gray-text">
              조직도 컴포넌트 예정
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-dark mb-3">구성원</h2>
            <p className="text-gray-text mb-4">
              회장단/국장단/팀원 소개 섹션을 여기에 확장할 수 있습니다.
            </p>
            <div className="rounded-lg border border-dashed border-gray-border p-8 text-center text-gray-text">
              구성원 리스트 컴포넌트 예정
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
