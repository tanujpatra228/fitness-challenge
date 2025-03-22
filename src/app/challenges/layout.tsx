
import type { Metadata } from 'next';
import { ProtectedRoute } from './_components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Active Challenges',
  description: 'Participate in active fitness challenges',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </>
  )
}
