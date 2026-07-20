import type { Metadata } from "next";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ToastContainer } from "@/components/ToastContainer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vayan ERP",
    template: "%s | Vayan ERP",
  },
  description:
    "Enterprise Resource Planning for traditional handloom textile cooperatives and solo artisans. Capacity planning, demand sensing, and financial tracking.",
  keywords: ["handloom", "saree", "weaving", "capacity planning", "Kanjivaram", "cooperative", "ERP"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <OfflineBanner />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
