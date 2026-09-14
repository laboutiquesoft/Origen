import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './core/config/axiosConfig.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './modules/auth/context/AuthContext.tsx';

import App from './App.tsx'
import { ToastProvider } from './shared/components/toastContext/ToastContext.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>        
      </AuthProvider> 
    </QueryClientProvider>      
  </StrictMode>,
)
