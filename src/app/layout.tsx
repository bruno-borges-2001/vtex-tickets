import Logo from "@/components/Logo";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { vtexTrust } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "VTEX Ticket Creation",
  description: "Application to submit tickets to Zendesk",
};

export default function RootLayout({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={cn(vtexTrust.className, 'w-screen h-svh flex flex-col')}>
        <main className="grow grid place-items-center">{children}</main>
        <Toaster />
        <Logo className="absolute top-[22.5px] left-[22.5px]" />
      </body>
    </html>
  );
}
