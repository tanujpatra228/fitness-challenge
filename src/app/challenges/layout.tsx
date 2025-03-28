
import type { Metadata } from 'next';
import { ProtectedRoute } from './_components/ProtectedRoute';
import Header from '@/src/components/Header';

export const metadata: Metadata = {
  title: 'Active Challenges',
  description: 'Participate in active FitChallenges',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ProtectedRoute>
        <Header />
        {children}
      </ProtectedRoute>
    </>
  )
}
