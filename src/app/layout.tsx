import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quigoo — A little joy, delivered",
  description: "Discover neighbourhood restaurants, order the things you love, and have good food delivered with a little Quigoo joy.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
