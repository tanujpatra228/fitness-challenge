'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './ui/sonner';
import { AuthProvider } from './AuthProvider';

const queryClient = new QueryClient();

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    {children}
                    <Toaster />
                </AuthProvider>
            </QueryClientProvider>
        </>
    )
}