import './globals.css';
import Link from 'next/link';
import { DM_Sans } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import { SITE } from '@/lib/site';
import Header from '@/components/Header';

const font = DM_Sans({ subsets: ['latin'], variable: '--font' });

export const metadata = { title: `${SITE.name} | Nigerian Fashion`, description: SITE.tagline };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={font.variable}>
      <body>
        <CartProvider>
          <div className="shell">
            <Header />
            <main>{children}</main>
            <footer className="footer">
              <span>© {new Date().getFullYear()} {SITE.name}</span>
              <Link href="/privacy">Privacy Policy</Link>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
