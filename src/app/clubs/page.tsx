import { getClubs } from "@/lib/data";
import { clubCategories } from "@/lib/mock-data";
import type { Metadata } from "next";
import ClubsClient from "@/components/clubs/ClubsClient";

export const metadata: Metadata = { title: "동아리 소개" };

export default async function ClubsPage() {
  const clubs = await getClubs();
  return <ClubsClient clubs={clubs} categories={clubCategories} />;
}
