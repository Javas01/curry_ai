import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Curry Predictor - AI-powered Stephen Curry Performance Predictions",
  description: "Predict Stephen Curry's performance using advanced AI models",
  icons: {
    icon: "/images/image2.png",
    shortcut: "/images/image2.png",
    apple: "/images/image2.png"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
