import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'

import { datadogRum } from '@datadog/browser-rum';

// Initialize Datadog RUM
datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APP_ID || 'YOUR_DATADOG_APP_ID',
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN || 'YOUR_DATADOG_CLIENT_TOKEN',
    site: 'us5.datadoghq.com',
    service: 'gopanda-frontend',
    env: import.meta.env.MODE,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
});

// Initialize the React Query Client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
)
