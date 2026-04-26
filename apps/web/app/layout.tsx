import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import { Header } from '@/features/header';
import { Footer } from '@/features/footer';
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
    title: {
        default: 'LUMIRIS — Product Transparency, Reimagined',
        template: '%s | LUMIRIS',
    },
    description:
        "LUMIRIS audits product data to give you an independent transparency score from A to E. Don't believe the label. See the truth.",
};

export const viewport: Viewport = {
    themeColor: '#f8fafc',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${geistMono.variable} bg-background`}>
            <body className="font-sans antialiased">
                <WebVitals />
                <Header />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}
