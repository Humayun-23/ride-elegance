import { createContext, useContext, useState, ReactNode } from 'react';

interface WhatsAppContextType {
  dynamicNumber: string | null;
  setDynamicNumber: (number: string | null) => void;
  dynamicMessage: string | null;
  setDynamicMessage: (message: string | null) => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [dynamicNumber, setDynamicNumber] = useState<string | null>(null);
  const [dynamicMessage, setDynamicMessage] = useState<string | null>(null);

  return (
    <WhatsAppContext.Provider
      value={{
        dynamicNumber,
        setDynamicNumber,
        dynamicMessage,
        setDynamicMessage,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
}
