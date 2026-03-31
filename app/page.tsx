import { Suspense } from "react";
import { LandingPage } from "@/components/landing/landing-page";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LandingPage />
    </Suspense>
  );
}
