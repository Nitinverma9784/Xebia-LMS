import './globals.css';
import { Providers } from './providers';
import AppLayout from '@/components/layout/AppLayout';

export const metadata = {
  title: 'Xebia LMS — Course Catalog',
  description: 'Enterprise Learning Management System — Course Catalog Module',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
