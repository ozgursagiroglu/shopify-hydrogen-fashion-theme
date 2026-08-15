import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Accordion} from '~/components/ui';
import type {FAQCategory} from '~/graphql/storefront';
import {cn} from '~/lib/cn';

export interface FAQListProps {
  categories: FAQCategory[];
  searchTerm?: string;
  className?: string;
}

export function FAQList({categories, searchTerm = '', className}: FAQListProps) {
  const {t} = useTranslation();

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const lowerSearch = searchTerm.toLowerCase();

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(lowerSearch) ||
            item.answer.toLowerCase().includes(lowerSearch),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, searchTerm]);

  if (filteredCategories.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-text-muted">{t('faq.noResults')}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-10', className)}>
      {filteredCategories.map((category) => {
        // Try to get translated category name, fallback to raw name
        const categoryName =
          t(`faq.categories.${category.key}`, {defaultValue: ''}) ||
          category.name;

        return (
          <section key={category.key} aria-labelledby={`faq-category-${category.key}`}>
            <h2
              id={`faq-category-${category.key}`}
              className="font-display text-h3 text-primary mb-6"
            >
              {categoryName}
            </h2>
            <Accordion.Root allowMultiple className="divide-y divide-border">
              {category.items.map((item) => (
                <Accordion.Item key={item.id} id={item.id}>
                  <Accordion.Trigger className="text-left font-medium">
                    {item.question}
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <div className="text-text-secondary whitespace-pre-wrap">
                      {item.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </section>
        );
      })}
    </div>
  );
}
