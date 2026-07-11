import { createContext, useContext, useState, ReactNode } from 'react';

interface WhatsAppContextType {
  dynamicNumber: string | null;
  setDynamicNumber: (number: string | null) => void;
  dynamicMessage: string | null;
  setDynamicMessage: (message: string | null) => void;
  shopContext: { id?: string | number, name?: string } | null;
  setShopContext: (shop: { id?: string | number, name?: string } | null) => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [dynamicNumber, setDynamicNumber] = useState<string | null>(null);
  const [dynamicMessage, setDynamicMessage] = useState<string | null>(null);
  const [shopContext, setShopContext] = useState<{ id?: string | number, name?: string } | null>(null);

  return (
    <WhatsAppContext.Provider
      value={{
        dynamicNumber,
        setDynamicNumber,
        dynamicMessage,
        setDynamicMessage,
        shopContext,
        setShopContext,
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
