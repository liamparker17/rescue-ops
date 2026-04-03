import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomTabBar } from "@rescue-ops/shared";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Operations Stabiliser — rescue-ops",
  description: "Operational task management for business rescue proceedings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="pb-16 md:pb-0">{children}</div>
        <BottomTabBar
          activeApp="operations"
          triageUrl={process.env.NEXT_PUBLIC_TRIAGE_URL}
          opsUrl={process.env.NEXT_PUBLIC_OPS_URL}
          pipelineUrl={process.env.NEXT_PUBLIC_PIPELINE_URL}
        />
      </body>
    </html>
  );
}
