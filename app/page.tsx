import type { Metadata } from "next";
import { HomeExperience } from "./components/HomeExperience";

export const metadata: Metadata = {
  description:
    "Explore SAME STUDIO apps in a bright, synthetic lavender universe.",
};

export default function Home() {
  return <HomeExperience />;
}
