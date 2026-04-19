// frontend/src/app/[locale]/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GroupProvider } from '@/context/GroupContext';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Navigation from '@/components/Navigation';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Heirloom Kitchen',
  description: 'Shared family recipe management',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const locale = params.locale;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${jakarta.className} bg-background min-h-screen text-foreground antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <GroupProvider>
              <Navigation />
              <div className="pt-16">
                {children}
              </div>
            </GroupProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
