import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "커뮤니티 관리",
};

export default function AdminBoardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
