import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Virtese Restaurant",
  description: "An example of a restaurant website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-zinc-50">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}