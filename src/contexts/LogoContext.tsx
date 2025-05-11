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
  logo: '/logo.png',  // Default logo
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

// Sanitize S3 URLs by removing any '@' prefix
const sanitizeS3Url = (url: string): string => {
  if (!url) return '';
  // Remove any '@' prefix if present
  return url.startsWith('@') ? url.substring(1) : url;
};

// Check if a URL is accessible (returns 200 OK)
const isUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    // Skip checking for default logo or relative paths
    if (url === '/logo.png' || !url.startsWith('http')) {
      return true;
    }
    
    // Use fetch with HEAD method to check if URL is accessible
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // This allows checking cross-origin resources
    });
    
    // If we get here, the request didn't throw an error
    return true;
  } catch (error) {
    console.error('Error checking URL accessibility:', error);
    return false;
  }
};

// Create the provider component
export const LogoProvider: React.FC<LogoProviderProps> = ({ children }) => {
  const [logo, setLogo] = useState<string>('/logo.png');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the logo on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setIsLoading(true);
        const settings = await getSettings();
        console.log('Received settings:', settings);
        
        // Sanitize the logo URL
        const sanitizedLogo = sanitizeS3Url(settings.logo);
        
        // If the logo is from S3
        if (sanitizedLogo.includes('amazonaws.com')) {
          console.log('Using S3 logo URL:', sanitizedLogo);
          
          // Check if the S3 URL is accessible
          const isAccessible = await isUrlAccessible(sanitizedLogo);
          if (isAccessible) {
            setLogo(sanitizedLogo);
          } else {
            console.warn('S3 logo URL is not accessible, using default logo');
            setLogo('/logo.png');
          }
        }
        // If the logo is a full URL, use it directly
        else if (sanitizedLogo.startsWith('http')) {
          setLogo(sanitizedLogo);
          console.log('Using direct logo URL:', sanitizedLogo);
        } 
        // If the logo is from backend, prepend the backend URL
        else if (sanitizedLogo.startsWith('/uploads/')) {
          const backendUrl = getBackendBaseUrl();
          const logoUrl = `${backendUrl}${sanitizedLogo}`;
          console.log('Using backend logo URL:', logoUrl);
          setLogo(logoUrl);
        } 
        // Otherwise, use as is (likely a local path like /images/logo.png)
        else {
          console.log('Using provided logo path:', sanitizedLogo);
          setLogo(sanitizedLogo);
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