import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Run Inspector",
  description:
    "Inspect, review, and steer multi-step agent runs with a run-level observability layer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
