'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { CatalogProvider } from '@/hooks/useCatalog';
import { ToastProvider } from '@/hooks/useToast';

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
        <CatalogProvider>{children}</CatalogProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
