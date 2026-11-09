import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أكاديمية النخبة | منصة إدارة الأكاديميات",
  description: "نموذج واجهة لإدارة أكاديميات كرة القدم ومتابعة تطور اللاعبين.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
