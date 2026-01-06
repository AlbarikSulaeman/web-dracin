import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CiciDraci - Stream China Drama',
  description: 'Your favorite destination for streaming Chinese dramas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-amber-50 text-amber-950">
        {children}
      </body>
    </html>
  );
}