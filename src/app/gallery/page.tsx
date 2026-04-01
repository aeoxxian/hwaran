"use client";

import { useState } from "react";
import { mockGalleryAlbums } from "@/lib/mock-data";

export default function GalleryPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const album = selectedAlbum ? mockGalleryAlbums.find((a) => a.id === selectedAlbum) : null;

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">갤러리</h1>
        <p className="section-subtitle">행사 기록과 활동 사진을 확인하세요</p>
      </div>

      {album ? (
        <div>
          <button
            onClick={() => setSelectedAlbum(null)}
            className="inline-flex items-center gap-1 text-gray-text hover:text-primary transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            앨범 목록
          </button>
          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-dark">{album.title}</h2>
            <div className="flex gap-3 mt-2 text-sm text-gray-text">
              <span>{album.date}</span>
              {album.clubName && <span>{album.clubName}</span>}
            </div>
            <p className="mt-3 text-gray-text">{album.description}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.images.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-xl bg-gray-light overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary/30">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGalleryAlbums.map((alb) => (
            <button
              key={alb.id}
              onClick={() => setSelectedAlbum(alb.id)}
              className="card !p-0 overflow-hidden text-left group"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary/30">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-dark group-hover:text-primary transition-colors">{alb.title}</h3>
                <div className="flex gap-3 mt-1 text-sm text-gray-text">
                  <span>{alb.date}</span>
                  {alb.clubName && <span>{alb.clubName}</span>}
                </div>
                <p className="text-sm text-gray-text mt-2 line-clamp-2">{alb.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
