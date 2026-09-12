import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { StoreProvider } from "@/lib/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "NBA Team Manager", template: "%s · NBA Team Manager" },
  description: "Build teams from NBA players — Next.js + Redux Toolkit",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <StoreProvider>
          <Header />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
