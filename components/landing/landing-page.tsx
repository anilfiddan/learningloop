"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { GamesSection } from "./games-section";
import { FeaturesSection } from "./features-section";
import { PracticePreview } from "./practice-preview";
import { WhoItsFor } from "./who-its-for";
import { SettingsSection } from "./settings-section";
import { CTASection } from "./cta-section";
import { Footer } from "./footer";
import { LoginModal } from "@/components/auth/login-modal";

export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("login") === "1") {
      setIsLoginOpen(true);
    }
  }, [searchParams]);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  const goToRegister = () => router.push("/register");

  return (
    <div className="min-h-screen bg-white">
      <Navbar onLogin={openLogin} onGetStarted={goToRegister} />
      <Hero onGetStarted={goToRegister} onLogin={openLogin} />
      <HowItWorks />
      <GamesSection />
      <PracticePreview />
      <FeaturesSection />
      <WhoItsFor />
      <SettingsSection />
      <CTASection onGetStarted={goToRegister} onLogin={openLogin} />
      <Footer />
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
    </div>
  );
}
