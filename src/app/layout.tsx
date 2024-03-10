import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VTEX Ticket Creation",
  description: "Application to submit tickets to Zendesk",
};

export default function RootLayout({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={cn(inter.className, 'w-screen h-svh flex flex-col')}>
        <main className="grow grid place-items-center">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
