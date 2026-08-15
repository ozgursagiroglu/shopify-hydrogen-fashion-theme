import {useEffect, useRef, useState} from 'react';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {SpinnerIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';
import {ScreenReaderAnnouncement} from '~/components/ui/ScreenReaderAnnouncement';
import {Button} from '~/components/ui/Button';

export interface AddToCartButtonProps {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
  onAddComplete?: () => void;
}

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
  onAddComplete,
}: AddToCartButtonProps) {
  const {t} = useTranslation();

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartButtonWrapper
          fetcher={fetcher}
          analytics={analytics}
          disabled={disabled}
          onClick={onClick}
          addingText={t('product.adding')}
          className={className}
          onAddComplete={onAddComplete}
        >
          {children}
        </AddToCartButtonWrapper>
      )}
    </CartForm>
  );
}

// Wrapper component to handle state tracking with hooks
function AddToCartButtonWrapper({
  fetcher,
  analytics,
  disabled,
  onClick,
  addingText,
  children,
  className,
  onAddComplete,
}: {
  fetcher: FetcherWithComponents<any>;
  analytics?: unknown;
  disabled?: boolean;
  onClick?: () => void;
  addingText: string;
  children: React.ReactNode;
  className?: string;
  onAddComplete?: () => void;
}) {
  const {t} = useTranslation();
  const isLoading = fetcher.state !== 'idle';
  const prevStateRef = useRef(fetcher.state);
  const [announcement, setAnnouncement] = useState('');
  // Track if onAddComplete was already called for this submission
  const addCompleteCalledRef = useRef(false);

  // Reset the flag when a new submission starts
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      addCompleteCalledRef.current = false;
    }
  }, [fetcher.state]);

  // Track state transitions and update announcement in effect
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate state update for accessibility announcement on fetcher state transitions */
  useEffect(() => {
    if (fetcher.state !== 'loading') {
      if (fetcher.state === 'submitting') {
        setAnnouncement(addingText);
      } else if (
        prevStateRef.current === 'submitting' &&
        fetcher.state === 'idle' &&
        !fetcher.data?.errors
      ) {
        setAnnouncement(t('product.addedToCart'));
      }
      prevStateRef.current = fetcher.state;
    }
  }, [fetcher.state, fetcher.data?.errors, addingText, t]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Handle onAddComplete callback - only call once per submission
  useEffect(() => {
    if (
      fetcher.state === 'idle' &&
      fetcher.data &&
      !fetcher.data?.errors &&
      onAddComplete &&
      !addCompleteCalledRef.current
    ) {
      addCompleteCalledRef.current = true;
      onAddComplete();
    }
  }, [fetcher.state, fetcher.data, onAddComplete]);

  return (
    <>
      <input name="analytics" type="hidden" value={JSON.stringify(analytics)} />
      <Button
        type="submit"
        onClick={onClick}
        disabled={disabled ?? isLoading}
        leftIcon={
          isLoading ? (
            <SpinnerIcon className="w-5 h-5 animate-spin" />
          ) : undefined
        }
        className={className}
      >
        {children}
      </Button>
      {announcement && (
        <ScreenReaderAnnouncement message={announcement} politeness="polite" />
      )}
    </>
  );
}
