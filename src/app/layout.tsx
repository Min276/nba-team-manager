import type { Metadata } from "next";
import { StoreProvider } from "@/lib/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBA Team Manager",
  description: "Build teams from NBA players — Next.js + Redux Toolkit",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
