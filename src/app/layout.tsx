import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/styles/globals.css"
import ToastProvider from "./providers/ToastProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Quản lý dự án",
  description: "Quản lý nhóm với ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/window.svg" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-[var(--foreground)]`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div id="root" className="min-h-screen theme-transition-wrapper">
            {children}
            <ToastProvider />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
