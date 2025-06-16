import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import Navbar from "./Navbar";
import "./globals.css";

// Font: Newsreader
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtese Restaurant",
  description: "Eleganza e tradizione sul mare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={newsreader.variable}>
      <body className="font-sans antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
