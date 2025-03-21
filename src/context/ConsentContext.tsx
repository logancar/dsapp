import React, { createContext, useState, ReactNode } from 'react';

interface ConsentContextValue {
  consentGiven: boolean;
  setConsentGiven: (value: boolean) => void;
}

export const ConsentContext = createContext<ConsentContextValue>({
  consentGiven: false,
  setConsentGiven: () => {},
});

interface ConsentProviderProps {
  children: ReactNode;
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({ children }) => {
  const [consentGiven, setConsentGiven] = useState(false);

  return (
    <ConsentContext.Provider value={{ consentGiven, setConsentGiven }}>
      {children}
    </ConsentContext.Provider>
  );
};
