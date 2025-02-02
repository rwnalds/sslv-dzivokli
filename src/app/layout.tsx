import "./globals.css";

import { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";

const DMSans = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PetLove - Smart Pet Appointment Management",
    template: "%s | PetLove",
  },
  description:
    "Seamlessly manage your pet appointments and sync directly with veterinarians. Smart notifications, multiple pet profiles, and hassle-free scheduling.",
  keywords: [
    "pet appointments",
    "veterinary scheduling",
    "pet care",
    "vet notifications",
    "pet health management",
  ],
  authors: [{ name: "PetLove" }],
  creator: "PetLove",
  publisher: "PetLove",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://petlove-psi.vercel.app/",
    siteName: "PetLove",
    title: "PetLove - Smart Pet Appointment Management",
    description:
      "Seamlessly manage your pet appointments and sync directly with veterinarians",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PetLove Preview",
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
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="PetLove" />
      </head>
      <body
        data-theme="bumblebee"
        className={`${DMSans.className} min-h-screen`}
      >
        <div className="grid grid-rows-[auto_1fr]">
          <Navbar />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
