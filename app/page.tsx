import type { Metadata } from "next";
import { HomeExperience } from "./components/HomeExperience";
import { HomeStructuredData } from "./components/HomeStructuredData";
import { createPageMetadata } from "./lib/seo";

export const metadata: Metadata = createPageMetadata("home");

export default function Home() {
  return (
    <>
      <HomeStructuredData />
      <HomeExperience />
    </>
  );
}
