import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import { WebVitals } from './web-vitals';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

export const metadata: Metadata = {
    title: 'Lumiris Vision',
    description: 'The X-Ray Transparency App for Consumers. Scan, reveal, and understand what you wear.',
};

export const viewport: Viewport = {
    themeColor: '#ffffff',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="bg-background">
            <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
                <WebVitals />
                {children}
            </body>
        </html>
    );
}
