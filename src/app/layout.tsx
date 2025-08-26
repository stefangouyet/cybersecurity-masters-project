import { Providers } from "@/store/providers";
import type { Metadata } from "next";
import Navbar from "@/app/components/navBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Firestore Rules Toolkit",
  description: "Created by Stefan Gouyet, University of Greenwich student",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body>
          <Navbar />
          <main style={{ padding: '2rem' }}>{children}</main>
        </body>
      </Providers>
    </html>
  );
}
