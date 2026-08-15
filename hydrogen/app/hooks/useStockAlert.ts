import {useState, useCallback} from 'react';

export interface StockAlertData {
  email: string;
  productTitle: string;
  variantTitle?: string;
  productHandle: string;
  variantId?: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Stock Alert Hook
 * Manages stock alert subscription via native Shopify metaobjects
 * Alerts are stored in Shopify Admin > Content > Metaobjects > Stock Alert
 */
export function useStockAlert() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const subscribe = useCallback(
    async (data: Omit<StockAlertData, 'email'>) => {
      if (!email) return;

      setStatus('loading');
      setErrorMessage('');

      try {
        // Submit to Shopify metaobjects via Admin API
        const formData = new FormData();
        formData.append('email', email);
        formData.append('productTitle', data.productTitle);
        formData.append('productHandle', data.productHandle);

        if (data.variantTitle) {
          formData.append('variantTitle', data.variantTitle);
        }

        if (data.variantId) {
          formData.append('variantId', data.variantId);
        }

        const response = await fetch('/api/stock-alerts', {
          method: 'POST',
          body: formData,
        });

        const result = (await response.json()) as {
          success: boolean;
          error?: string;
        };

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to subscribe to stock alerts');
        }

        setStatus('success');
        setEmail('');
      } catch (error) {
        setStatus('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to subscribe to stock alerts',
        );
      }
    },
    [email],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setEmail('');
    setErrorMessage('');
  }, []);

  return {
    email,
    setEmail,
    status,
    errorMessage,
    subscribe,
    reset,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
