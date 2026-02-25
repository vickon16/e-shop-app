import Providers from '@/components/providers';
import './global.css';
import Header from '@/components/common/Header';
import { Oregano, Poppins, Roboto } from 'next/font/google';

export const metadata = {
  title: 'Welcome to E-Shop App',
  description:
    'An e-commerce application built with microservices architecture.',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '600', '700', '900'],
  variable: '--font-poppins',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '600', '700', '900'],
  variable: '--font-roboto',
});

const oregano = Oregano({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-oregano',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${poppins.className} ${roboto.variable} ${oregano.variable} antialiased`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
