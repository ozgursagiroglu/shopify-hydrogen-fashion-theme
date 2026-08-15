import {useState, useCallback} from 'react';
import {useSearchParams} from 'react-router';
import {cn} from '~/lib/cn';
import {Button, PriceRangeSlider, Modal, Accordion} from '~/components/ui';
import {FilterIcon, CloseIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';

export interface FilterValue {
  id: string;
  label: string;
  count?: number;
  input: string;
}

export interface Filter {
  id: string;
  label: string;
  type: 'LIST' | 'PRICE_RANGE' | 'BOOLEAN';
  values: FilterValue[];
}

interface FilterDrawerProps {
  filters: Filter[];
  appliedFilters: AppliedFilter[];
  className?: string;
  /**
   * 'mobile' - Only shows the filter toggle button + mobile drawer
   * 'desktop' - Only shows the desktop sidebar
   * 'both' - Shows both (default, for backwards compatibility)
   */
  mode?: 'mobile' | 'desktop' | 'both';
}

export interface AppliedFilter {
  label: string;
  filter: string;
}

function parseFiltersFromUrl(searchParams: URLSearchParams): string[] {
  const filtersParam = searchParams.get('filters');
  if (!filtersParam) return [];
  try {
    return JSON.parse(filtersParam) as string[];
  } catch {
    return [];
  }
}

function serializeFiltersToUrl(filters: string[]): string {
  return JSON.stringify(filters);
}

export function FilterDrawer({
  filters,
  appliedFilters,
  className,
  mode = 'both',
}: FilterDrawerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [priceInputs, setPriceInputs] = useState<{min: string; max: string}>({
    min: '',
    max: '',
  });
  const {t} = useTranslation();

  const activeFilters = parseFiltersFromUrl(searchParams);
  const showMobile = mode === 'mobile' || mode === 'both';
  const showDesktop = mode === 'desktop' || mode === 'both';

  const toggleFilter = useCallback(
    (filterInput: string) => {
      const newParams = new URLSearchParams(searchParams);
      const currentFilters = parseFiltersFromUrl(searchParams);

      const filterIndex = currentFilters.indexOf(filterInput);
      if (filterIndex > -1) {
        currentFilters.splice(filterIndex, 1);
      } else {
        currentFilters.push(filterInput);
      }

      if (currentFilters.length > 0) {
        newParams.set('filters', serializeFiltersToUrl(currentFilters));
      } else {
        newParams.delete('filters');
      }

      // Reset pagination when filtering
      newParams.delete('cursor');
      newParams.delete('direction');

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const applyPriceFilter = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    let currentFilters = parseFiltersFromUrl(searchParams);

    // Remove any existing price filter
    currentFilters = currentFilters.filter((f) => !f.includes('"price"'));

    // Add new price filter
    const [min, max] = priceRange;
    if (min > 0 || max < 1000) {
      const priceFilter = JSON.stringify({
        price: {
          min: min > 0 ? min : 0,
          max: max < 1000 ? max : undefined,
        },
      });
      currentFilters.push(priceFilter);
    }

    if (currentFilters.length > 0) {
      newParams.set('filters', serializeFiltersToUrl(currentFilters));
    } else {
      newParams.delete('filters');
    }

    newParams.delete('cursor');
    newParams.delete('direction');

    setSearchParams(newParams);
  }, [searchParams, setSearchParams, priceRange]);

  const clearAllFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('filters');
    newParams.delete('cursor');
    newParams.delete('direction');
    setSearchParams(newParams);
    setPriceRange([0, 1000]);
    setPriceInputs({min: '', max: ''});
  }, [searchParams, setSearchParams]);

  const isFilterActive = (filterInput: string) => {
    return activeFilters.includes(filterInput);
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      {showMobile && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="lg:hidden flex items-center gap-2"
        >
          <FilterIcon className="w-4 h-4" strokeWidth={1.5} />
          {t('collection.filters')}
          {appliedFilters.length > 0 && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {appliedFilters.length}
            </span>
          )}
        </Button>
      )}

      {/* Desktop Filter Sidebar */}
      {showDesktop && (
        <aside className={cn('hidden lg:block w-64 shrink-0', className)}>
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium">
                {t('collection.filters')}
              </h2>
              {appliedFilters.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-text-muted hover:text-primary transition-colors"
                >
                  {t('collection.clearAll')}
                </button>
              )}
            </div>

            <div className="md:space-y-6">
              {filters.map((filter) => (
                <FilterSection
                  key={filter.id}
                  filter={filter}
                  isFilterActive={isFilterActive}
                  toggleFilter={toggleFilter}
                  priceRange={priceRange}
                  priceInputs={priceInputs}
                  setPriceRange={setPriceRange}
                  setPriceInputs={setPriceInputs}
                  applyPriceFilter={applyPriceFilter}
                />
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Filter Modal */}
      {showMobile && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          size="full"
          title={t('collection.filters')}
          className="lg:hidden"
        >
          <div className="h-full flex flex-col">
            <div className="space-y-6 h-full">
              {filters.map((filter) => (
                <FilterSection
                  key={filter.id}
                  filter={filter}
                  isFilterActive={isFilterActive}
                  toggleFilter={toggleFilter}
                  priceRange={priceRange}
                  priceInputs={priceInputs}
                  setPriceRange={setPriceRange}
                  setPriceInputs={setPriceInputs}
                  applyPriceFilter={applyPriceFilter}
                />
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 mt-6 pt-6 pb-6 border-t border-border shrink-0">
              <Button
                variant="secondary"
                onClick={clearAllFilters}
                className="flex-1"
              >
                {t('collection.clearAll')}
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                {t('collection.apply')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

interface FilterSectionProps {
  filter: Filter;
  isFilterActive: (input: string) => boolean;
  toggleFilter: (input: string) => void;
  priceRange: [number, number];
  priceInputs: {min: string; max: string};
  setPriceRange: (range: [number, number]) => void;
  setPriceInputs: (inputs: {min: string; max: string}) => void;
  applyPriceFilter: () => void;
}

function FilterSection({
  filter,
  isFilterActive,
  toggleFilter,
  priceRange,
  priceInputs,
  setPriceRange,
  setPriceInputs,
  applyPriceFilter,
}: FilterSectionProps) {
  const {t} = useTranslation();

  if (filter.type === 'PRICE_RANGE') {
    return (
      <Accordion.Root defaultOpen={[filter.id]}>
        <Accordion.Item id={filter.id}>
          <Accordion.Trigger>{filter.label}</Accordion.Trigger>
          <Accordion.Content>
            <div className="space-y-4">
              {/* Price Range Slider */}
              <PriceRangeSlider
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onChange={(range) => {
                  setPriceRange(range);
                  setPriceInputs({
                    min: range[0].toString(),
                    max: range[1].toString(),
                  });
                }}
                currency="$"
              />

              {/* Input Fields */}
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder={t('collection.filterBy.min')}
                  value={priceInputs.min}
                  onChange={(e) => {
                    setPriceInputs({...priceInputs, min: e.target.value});
                    const val = parseFloat(e.target.value) || 0;
                    setPriceRange([val, priceRange[1]]);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="number"
                  placeholder={t('collection.filterBy.max')}
                  value={priceInputs.max}
                  onChange={(e) => {
                    setPriceInputs({...priceInputs, max: e.target.value});
                    const val = parseFloat(e.target.value) || 1000;
                    setPriceRange([priceRange[0], val]);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <Button size="sm" onClick={applyPriceFilter} className="w-full">
                {t('collection.apply')}
              </Button>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );
  }

  return (
    <Accordion.Root defaultOpen={[filter.id]}>
      <Accordion.Item id={filter.id}>
        <Accordion.Trigger>{filter.label}</Accordion.Trigger>
        <Accordion.Content>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filter.values.map((value) => (
              <label
                key={value.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isFilterActive(value.input)}
                  onChange={() => toggleFilter(value.input)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-accent"
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  {value.label}
                </span>
                {value.count !== undefined && (
                  <span className="text-xs text-text-muted ml-auto">
                    ({value.count})
                  </span>
                )}
              </label>
            ))}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

export function AppliedFilters({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: AppliedFilter[];
  onRemove: (filter: string) => void;
  onClearAll: () => void;
}) {
  const {t} = useTranslation();

  if (filters.length === 0) return null;

  // Translate special labels that come as keys from the loader
  const getDisplayLabel = (label: string) => {
    if (label === 'inStock') return t('collection.filterBy.inStock');
    if (label === 'outOfStock') return t('collection.filterBy.outOfStock');
    return label;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {filters.map((filter) => (
        <button
          key={filter.filter}
          onClick={() => onRemove(filter.filter)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-alt rounded-full text-sm hover:bg-surface-hover transition-colors"
        >
          {getDisplayLabel(filter.label)}
          <CloseIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-text-muted hover:text-primary transition-colors underline"
      >
        {t('collection.clearAll')}
      </button>
    </div>
  );
}
