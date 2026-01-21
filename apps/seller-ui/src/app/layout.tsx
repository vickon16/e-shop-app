import Providers from '@/components/providers';
import './global.css';
// import Header from '@/components/common/Header';
import { Poppins } from 'next/font/google';

export const metadata = {
  title: 'Welcome to E-Shop Seller Portal',
  description:
    'An e-commerce application built with microservices architecture.',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '600', '700', '900'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${poppins.className} min-h-screen bg-slate-900 text-slate-50 font-sans antialiased`}
      >
        <Providers>
          {/* <Header /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
