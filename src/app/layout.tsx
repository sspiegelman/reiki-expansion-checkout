import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reiki Expansion & Reactivation",
  description: "Go Beyond Traditional Reiki—Integrate Chakra Alignment & the Pendulum into Your Practice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
