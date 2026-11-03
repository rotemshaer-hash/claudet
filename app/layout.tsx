import React from 'react';

export const metadata = {
  title: 'Claudet - AI & Code Studio',
  description: 'Interactive Generative Micro-UI Engine for Women in Tech & Business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#070611] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
