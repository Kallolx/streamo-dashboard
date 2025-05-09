'use client'
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getSettings } from '@/services/settingsService';

// Define the logo context shape
interface LogoContextType {
  logo: string;
  setLogo: (logo: string) => void;
  isLoading: boolean;
}

// Create the context with default values
const LogoContext = createContext<LogoContextType>({
  logo: '/images/logo.png',  // Default logo
  setLogo: () => {},
  isLoading: true
});

// Define props for the provider component
interface LogoProviderProps {
  children: ReactNode;
}

// Get the base URL for the backend
const getBackendBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://streamo-backend.onrender.com';
  }
  return 'http://localhost:5000';
};

// Create the provider component
export const LogoProvider: React.FC<LogoProviderProps> = ({ children }) => {
  const [logo, setLogo] = useState<string>('/images/logo.png');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the logo on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setIsLoading(true);
        const settings = await getSettings();
        console.log('Received settings:', settings);
        
        // If the logo is a full URL, use it directly
        if (settings.logo.startsWith('http')) {
          setLogo(settings.logo);
        } 
        // If the logo is from backend, prepend the backend URL
        else if (settings.logo.startsWith('/uploads/')) {
          const backendUrl = getBackendBaseUrl();
          const logoUrl = `${backendUrl}${settings.logo}`;
          console.log('Using backend logo URL:', logoUrl);
          setLogo(logoUrl);
        } 
        // Otherwise, use as is (likely a local path like /images/logo.png)
        else {
          console.log('Using provided logo path:', settings.logo);
          setLogo(settings.logo);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
        // Keep the default logo on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, []);

  // Provide the logo context to children
  return (
    <LogoContext.Provider value={{ logo, setLogo, isLoading }}>
      {children}
    </LogoContext.Provider>
  );
};

// Custom hook to use the logo context
export const useLogo = () => useContext(LogoContext);

export default LogoContext; 