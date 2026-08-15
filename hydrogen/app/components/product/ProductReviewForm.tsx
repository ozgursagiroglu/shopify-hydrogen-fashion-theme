import {useState} from 'react';
import {useFetcher} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Modal, Button, Input, Textarea, StarRating} from '~/components/ui';
import {CheckCircleIcon} from '~/components/icons';

export interface ProductReviewFormProps {
  productId: string;
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  rating?: string;
  title?: string;
  review?: string;
  name?: string;
  email?: string;
}

export function ProductReviewForm({
  productId,
  productTitle,
  isOpen,
  onClose,
}: ProductReviewFormProps) {
  const {t} = useTranslation();
  const fetcher = useFetcher();
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success === true;

  const validateForm = (formData: FormData): boolean => {
    const newErrors: FormErrors = {};

    if (rating === 0) {
      newErrors.rating = t('reviews.errors.ratingRequired');
    }

    const title = formData.get('title') as string;
    if (!title?.trim()) {
      newErrors.title = t('reviews.errors.titleRequired');
    }

    const review = formData.get('review') as string;
    if (!review?.trim()) {
      newErrors.review = t('reviews.errors.reviewRequired');
    }

    const name = formData.get('name') as string;
    if (!name?.trim()) {
      newErrors.name = t('reviews.errors.nameRequired');
    }

    const email = formData.get('email') as string;
    if (!email?.trim()) {
      newErrors.email = t('reviews.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('reviews.errors.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) {
      e.preventDefault();
    }
  };

  const handleClose = () => {
    // Reset form state
    setRating(0);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('reviews.form.title')}>
      {isSuccess ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-6">
            <CheckCircleIcon className="w-8 h-8" />
          </div>
          <h3 className="font-display text-h4 text-primary mb-2">
            {t('reviews.form.success')}
          </h3>
          <p className="text-text-secondary mb-6">
            {t('reviews.form.successMessage')}
          </p>
          <Button variant="primary" onClick={handleClose}>
            {t('common.close')}
          </Button>
        </div>
      ) : (
        <fetcher.Form
          method="POST"
          action="/api/reviews"
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Hidden fields */}
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="rating" value={rating} />

          {/* Honeypot field */}
          <input
            type="text"
            name="website"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* Product info */}
          <p className="text-sm text-text-muted">
            {t('misc.purchasedItem')}: <span className="text-text">{productTitle}</span>
          </p>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              {t('reviews.form.rating')} *
            </label>
            <StarRating
              rating={rating}
              interactive
              onChange={setRating}
              size="lg"
            />
            {errors.rating && (
              <p className="mt-1.5 text-sm text-error">{errors.rating}</p>
            )}
          </div>

          {/* Review Title */}
          <Input
            label={`${t('reviews.form.reviewTitle')} *`}
            name="title"
            placeholder={t('reviews.form.reviewTitlePlaceholder')}
            error={errors.title}
            required
          />

          {/* Review Content */}
          <Textarea
            label={`${t('reviews.form.yourReview')} *`}
            name="review"
            placeholder={t('reviews.form.yourReviewPlaceholder')}
            rows={5}
            error={errors.review}
            required
          />

          {/* Name */}
          <Input
            label={`${t('reviews.form.name')} *`}
            name="name"
            placeholder={t('reviews.form.namePlaceholder')}
            error={errors.name}
            required
          />

          {/* Email */}
          <Input
            label={`${t('reviews.form.email')} *`}
            name="email"
            type="email"
            placeholder={t('reviews.form.emailPlaceholder')}
            error={errors.email}
            helperText={t('reviews.form.emailPlaceholder')}
            required
          />

          {fetcher.data?.success === false && (
            <p className="text-sm text-error">{t('reviews.form.error')}</p>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? t('reviews.form.submitting')
                : t('reviews.form.submit')}
            </Button>
          </div>
        </fetcher.Form>
      )}
    </Modal>
  );
}
