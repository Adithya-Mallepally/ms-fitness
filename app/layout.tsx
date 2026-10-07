import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M S FITNESS | Next Level Luxury Gym & Wellness",
  description:
    "Where raw strength meets high-end luxury. Experience high-intensity boutique training, hyper-recovery suites, and premier membership programs.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('msf_theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-void text-foreground antialiased selection:bg-gold-500 selection:text-black transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
