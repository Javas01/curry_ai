import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Chef Curry",
  description: "Predict Stephen Curry's performance using advanced AI models",
  keywords:
    "Stephen Curry, NBA, Golden State Warriors, AI predictions, basketball analytics, LSTM neural network",
  authors: [{ name: "Jawwaad Sabree" }],
  creator: "Jawwaad Sabree",
  publisher: "Jawwaad Sabree",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL("https://www.chefcurry.ai/"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.chefcurry.ai/",
    title: "AI Chef Curry",
    description: "Predict Stephen Curry's performance using advanced AI models",
    siteName: "AI Chef Curry",
    images: [
      {
        url: "/images/image2.png",
        width: 800,
        height: 600,
        alt: "Curry Predictor Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chef Curry",
    description: "Predict Stephen Curry's performance using advanced AI models",
    images: ["/images/image2.png"],
    creator: "@JawwaadSabree"
  },
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
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">{children}</main>
          <footer className="py-6 text-center text-sm text-blue-100">
            <p>
              © {new Date().getFullYear()} AI Chef Curry. Built by{" "}
              <Link
                href="https://unhired.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-400 transition-colors duration-200"
              >
                Jawwaad Sabree
              </Link>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
