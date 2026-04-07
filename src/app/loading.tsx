import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
          <Image src="/logo.png" alt="화란" width={48} height={48} className="rounded-lg animate-pulse" />
        </div>
        <p className="text-sm text-gray-text">로딩 중...</p>
      </div>
    </div>
  );
}
