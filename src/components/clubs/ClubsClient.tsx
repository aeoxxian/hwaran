"use client";

import { useState } from "react";
import Link from "next/link";
import type { Club } from "@/lib/types";

interface ClubsClientProps {
  clubs: Club[];
  categories: string[];
}

export default function ClubsClient({ clubs, categories }: ClubsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filtered = selectedCategory === "전체"
    ? clubs
    : clubs.filter((c) => c.category === selectedCategory);

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">동아리 소개</h1>
        <p className="section-subtitle">KENTECH의 다양한 동아리를 만나보세요</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-white"
                : "bg-gray-light text-gray-text hover:bg-primary-50 hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((club) => (
          <Link key={club.id} href={`/clubs/${club.id}`} className="card group !p-0 overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {club.name[0]}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-primary">{club.category}</span>
                <span className="text-xs text-gray-text">{club.memberCount}명</span>
              </div>
              <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors">
                {club.name}
              </h3>
              <p className="text-sm text-gray-text mt-1 line-clamp-2">{club.description}</p>
              {club.instagramUrl && (
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-text">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                  </svg>
                  Instagram
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
