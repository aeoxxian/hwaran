import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md mx-auto px-4">
        <Image src="/logo.png" alt="화란" width={64} height={64} className="mx-auto mb-6 rounded-lg opacity-30" />
        <div className="text-7xl font-bold text-primary/15 mb-4">404</div>
        <h1 className="text-2xl font-bold text-dark mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-gray-text mb-6">
          요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.
        </p>
        <Link href="/" className="btn-primary">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
