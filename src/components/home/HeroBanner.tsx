"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Banner } from "@/lib/types";

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const activeBanners = banners.filter((b) => b.isActive);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, activeBanners.length]);

  if (activeBanners.length === 0) return null;

  return (
    <section className="relative w-full h-64 sm:h-80 md:h-96 bg-dark overflow-hidden">
      {activeBanners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100" : "opacity-0"}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-dark/40 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banner.imageUrl})`, backgroundColor: "#2D2D2D" }}
          />
          <div className="relative z-20 h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <span className="badge bg-primary/20 text-primary-light mb-3">동아리 소개</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">{banner.clubName}</h2>
              {banner.linkUrl && (
                <Link href={banner.linkUrl} className="inline-block mt-4 btn-primary">
                  자세히 보기
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {activeBanners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors" aria-label="이전">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors" aria-label="다음">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === current ? "bg-primary" : "bg-white/40"}`}
                aria-label={`슬라이드 ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
