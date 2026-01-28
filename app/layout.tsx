import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import OnboardingWrapper from "@/components/onboarding-wrapper";
import { TooltipProvider } from "@/components/tooltip-provider";

export const metadata: Metadata = {
  title: "PULA - People's Universal Lexical Access",
  description: "Easy translation from any base language to any target language",
  authors: [{ name: "PULA", url: "https://github.com/agpb" }],
  keywords: ["translation", "language", "phrase book", "German", "African"],
  robots: "index, follow",
  openGraph: {
    title: "PULA - People's Universal Lexical Access",
    description:
      "Easy translation from any base language to any target language",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OnboardingWrapper>
          <TooltipProvider>{children}</TooltipProvider>
        </OnboardingWrapper>
      </body>
    </html>
  );
}
