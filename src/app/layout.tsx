import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "600",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Code Colleagues — Websites, mobile apps, and databases",
    template: "%s · Code Colleagues",
  },
  description:
    "Code Colleagues is a freelance studio team. We build websites, mobile apps, and databases, then maintain them. AI and machine learning are part of the skill set. Delivered work includes PSB Travels, Ksp Transports, Banking Wallet, Library Arrangements, and visitor management for a large industry.",
  icons: { icon: "/logo.jpg" },
  applicationName: "Code Colleagues",
};

export const viewport: Viewport = {
  themeColor: "#064e3b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Script id="start-at-top" strategy="beforeInteractive">
          {`try{history.scrollRestoration="manual";if(location.hash){history.replaceState(null,"",location.pathname+location.search);}scrollTo(0,0);addEventListener("load",function(){scrollTo(0,0);});}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
