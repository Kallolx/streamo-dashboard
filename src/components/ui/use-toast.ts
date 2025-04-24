// Simple toast hook for notifications
import { useState } from 'react';

type ToastType = 'default' | 'destructive';

interface ToastProps {
  title: string;
  description: string;
  variant?: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    const id = Date.now();
    setToasts((prev) => [...prev, props]);

    // Remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((_, i) => i !== 0));
    }, 3000);

    // Log to console for now until we build the actual toast UI
    console.log(`Toast [${props.variant || 'default'}]: ${props.title} - ${props.description}`);
  };

  return { toast, toasts };
} 