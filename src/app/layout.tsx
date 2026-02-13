import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaani — Talk to Any Document in Any Indian Language",
  description:
    "Upload a document, ask questions by speaking in any Indian language, and hear answers spoken back. Powered by 6 Sarvam AI APIs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain min-h-screen antialiased">{children}</body>
    </html>
  );
}
