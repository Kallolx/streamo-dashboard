"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackUrl?: string;
}

const RoleGuard = ({ children, allowedRoles, fallbackUrl = '/dashboard' }: RoleGuardProps) => {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    console.log('RoleGuard - Checking access:', { 
      token: token ? (token === 'test-token-for-development' ? 'test-token' : 'valid-token') : 'no-token', 
      userRole, 
      allowedRoles 
    });

    if (!token) {
      console.log('RoleGuard - No token found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // For test token, we trust the userRole in localStorage
    // In production with real tokens, you would verify this server-side
    
    // Check if user role is allowed
    if (userRole && allowedRoles.includes(userRole)) {
      console.log('RoleGuard - Access granted for role:', userRole);
      setHasAccess(true);
    } else {
      // Redirect to fallback URL if role is not allowed
      console.log('RoleGuard - Access denied. User role:', userRole, 'Allowed roles:', allowedRoles);
      router.push(fallbackUrl);
    }

    setIsLoading(false);
  }, [router, allowedRoles, fallbackUrl]);

  // Show loading spinner while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F1215]">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Render children only if user has access
  return hasAccess ? <>{children}</> : null;
};

export default RoleGuard; 