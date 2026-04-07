import type { Metadata } from "next";
import AboutSection from "@/components/home/AboutSection";
import OrgChart from "@/components/about/OrgChart";
import MemberCards from "@/components/about/MemberCards";

export const metadata: Metadata = { title: "소개" };

export default function AboutPage() {
  return (
    <div className="pb-12">
      <AboutSection />

      <section className="container-page">
        <div className="space-y-10">
          <OrgChart />
          <MemberCards />
        </div>
      </section>
    </div>
  );
}
