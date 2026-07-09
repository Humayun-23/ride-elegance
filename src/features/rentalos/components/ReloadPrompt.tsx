import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 m-0 p-4 border border-border bg-card shadow-lg rounded-xl flex flex-col gap-3 max-w-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm font-medium">
          {offlineReady ? (
            <span>App ready to work offline</span>
          ) : (
            <span>New content available, click on reload button to update.</span>
          )}
        </div>
        <button onClick={close} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2">
        {needRefresh && (
          <Button size="sm" onClick={() => updateServiceWorker(true)} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reload
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={close}>
          Close
        </Button>
      </div>
    </div>
  );
}
