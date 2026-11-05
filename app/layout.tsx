import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: "Claudet — מרחב לרעיונות שלך",
  description: "מרחב יצירתי בעברית לשיחה, כתיבה, תכנון וחשיבה עם AI.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
