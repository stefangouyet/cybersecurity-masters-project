import { Providers } from "@/store/providers";
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";

export const metadata: Metadata = {
  title: "Firestore Security Rules Toolkit",
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
          <Header />
          <main style={{ padding: '2rem' }}>{children}</main>
        </body>
      </Providers>
    </html>
  );
}
