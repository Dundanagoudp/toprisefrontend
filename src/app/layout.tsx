import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/provider";
import { ToastProvider } from "@/components/ui/toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Toprise",
  description: "TOPRISE VENTURES",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${poppins.variable} antialiased`}
      >
        <ToastProvider>
          <Providers>{children}</Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
