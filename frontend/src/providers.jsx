'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { CatalogProvider } from '@/hooks/useCatalog';
import { ToastProvider } from '@/hooks/useToast';
import { AuthProvider } from '@/hooks/useAuth';
import { StudentAuthProvider } from '@/auth/student/StudentAuthProvider';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <StudentAuthProvider>
            <CatalogProvider>{children}</CatalogProvider>
          </StudentAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
