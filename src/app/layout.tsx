import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Cloudflare Zero Trust Remote",
  description: "Mobile remote control for Cloudflare Zero Trust",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="pb-16">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
