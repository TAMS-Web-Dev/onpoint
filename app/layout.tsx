import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

const montserrat = localFont({
  src: [
    { path: "../public/fonts/Montserrat-Regular.ttf",       weight: "400", style: "normal" },
    { path: "../public/fonts/Montserrat-Italic.ttf",        weight: "400", style: "italic" },
    { path: "../public/fonts/Montserrat-SemiBold.ttf",      weight: "600", style: "normal" },
    { path: "../public/fonts/Montserrat-SemiBoldItalic.ttf",weight: "600", style: "italic" },
    { path: "../public/fonts/Montserrat-ExtraBold.ttf",     weight: "800", style: "normal" },
    { path: "../public/fonts/Montserrat-ExtraBoldItalic.ttf",weight: "800", style: "italic" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OnPoint Youth Portal",
  description: "OnPoint — connecting young people to opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
