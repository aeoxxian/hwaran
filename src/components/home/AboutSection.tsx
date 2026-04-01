import Image from "next/image";
import { SITE_NAME, SITE_FULL_NAME, SITE_GENERATION } from "@/lib/constants";

export default function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <Image
                src="/logo.png"
                alt="화란 로고"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div>
            <span className="badge-primary mb-4">{SITE_GENERATION}</span>
            <h2 className="text-3xl font-bold text-dark mt-3 mb-4">
              {SITE_FULL_NAME}
              <br />
              <span className="text-primary">&lsquo;{SITE_NAME}&rsquo;</span>
            </h2>
            <p className="text-gray-text leading-relaxed mb-6">
              &lsquo;화란&rsquo;은 &lsquo;꽃이 활짝 피다&rsquo;라는 뜻을 담고 있습니다.
              한국에너지공과대학교 학우들의 동아리 활동이 아름답게 꽃피길 바라는 마음으로,
              동아리 활동 지원, 행사 주최, 복지 향상을 위해 최선을 다하겠습니다.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary-50">
                <div className="text-2xl font-bold text-primary">6</div>
                <div className="text-sm text-gray-text mt-1">등록 동아리</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary-50">
                <div className="text-2xl font-bold text-primary">130+</div>
                <div className="text-sm text-gray-text mt-1">동아리 회원</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary-50">
                <div className="text-2xl font-bold text-primary">5+</div>
                <div className="text-sm text-gray-text mt-1">분과</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
