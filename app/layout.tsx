import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BurgerMenu from "@/components/BurgerMenu";
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
  title: "Prototype Timer",
  description: "A simple cube timer prototype.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BurgerMenu />
        {children}
      </body>
    </html>
  );
}
