import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SiteNav } from "@/components/layout/site-nav/SiteNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Blog de publicaciones",
    template: "%s | Blog de publicaciones",
  },
  description: "Blog de publicaciones de ejemplo con listado y categorías.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Script id="scripting-available-flag" strategy="beforeInteractive">
          {`document.documentElement.classList.add("scripting-available")`}
        </Script>
        <SiteNav />
        <div className="site-shell">{children}</div>
      </body>
    </html>
  );
}
