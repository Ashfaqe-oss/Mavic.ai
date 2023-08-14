import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { CrispProvider } from "@/components/providers/crisp-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { checkSubscription } from "@/lib/subscription";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mavic.ai",
  description: "Generates Ai",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const isPro = await checkSubscription();
  
  return (
    <ClerkProvider>
      <html lang="en">
        <CrispProvider />
        <body className={cn("bg-secondary", inter.className)}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {" "}
            {/* forcedTheme="dark" --> available */}
            <ToasterProvider />
            {
              !isPro && (
                <ModalProvider />
              )
            }
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
