import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "HeySuchi — Get things done", description: "A calm operating system for getting things done." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }