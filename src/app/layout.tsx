import "./globals.css";

import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";

const DMSans = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SSpots - Atrodi Savu Sapņu Dzīvokli",
    template: "%s | SSpots",
  },
  description:
    "Saņem tūlītējus paziņojumus par jauniem dzīvokļu sludinājumiem SS.lv, kas atbilst taviem kritērijiem. Nekad vairs nepalaid garām savu sapņu dzīvokli.",
  keywords: [
    "dzīvokļu meklēšana",
    "ss.lv paziņojumi",
    "dzīvokļi latvijā",
    "nekustamais īpašums",
    "dzīvokļu sludinājumi",
  ],
  authors: [{ name: "SSpots" }],
  creator: "SSpots",
  publisher: "SSpots",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "lv_LV",
    url: "https://sspots.lv/",
    siteName: "SSpots",
    title: "SSpots - Atrodi Savu Sapņu Dzīvokli",
    description:
      "Saņem tūlītējus paziņojumus par jauniem dzīvokļu sludinājumiem SS.lv",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SSpots Preview",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lv" data-theme="light">
      <head>
        <meta name="apple-mobile-web-app-title" content="SSpots" />
      </head>
      <body
        className={`${DMSans.className} min-h-screen ${GeistSans.className}`}
      >
        <Toaster />
        <div className="grid grid-rows-[auto_1fr] min-h-screen">
          <Navbar />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
