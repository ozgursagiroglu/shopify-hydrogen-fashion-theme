import {useState} from 'react';
import {Modal} from '~/components/ui';
import {cn} from '~/lib/cn';
import {TipIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';

export interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  productType?: 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories';
}

type Unit = 'cm' | 'in';

const SIZE_CHARTS = {
  tops: {
    titleKey: 'product.sizeGuideModal.categories.tops',
    headerKeys: [
      'product.sizeGuideModal.headers.size',
      'product.sizeGuideModal.headers.chest',
      'product.sizeGuideModal.headers.waist',
      'product.sizeGuideModal.headers.hips',
      'product.sizeGuideModal.headers.length',
    ],
    rows: [
      {
        size: 'XS',
        cm: ['82-86', '62-66', '88-92', '62'],
        in: ['32-34', '24-26', '35-36', '24.5'],
      },
      {
        size: 'S',
        cm: ['86-90', '66-70', '92-96', '64'],
        in: ['34-35', '26-28', '36-38', '25'],
      },
      {
        size: 'M',
        cm: ['90-94', '70-74', '96-100', '66'],
        in: ['35-37', '28-29', '38-39', '26'],
      },
      {
        size: 'L',
        cm: ['94-98', '74-78', '100-104', '68'],
        in: ['37-39', '29-31', '39-41', '27'],
      },
      {
        size: 'XL',
        cm: ['98-102', '78-82', '104-108', '70'],
        in: ['39-40', '31-32', '41-43', '27.5'],
      },
    ],
  },
  bottoms: {
    titleKey: 'product.sizeGuideModal.categories.bottoms',
    headerKeys: [
      'product.sizeGuideModal.headers.size',
      'product.sizeGuideModal.headers.waist',
      'product.sizeGuideModal.headers.hips',
      'product.sizeGuideModal.headers.inseam',
      'product.sizeGuideModal.headers.rise',
    ],
    rows: [
      {
        size: 'XS',
        cm: ['62-66', '88-92', '76', '24'],
        in: ['24-26', '35-36', '30', '9.5'],
      },
      {
        size: 'S',
        cm: ['66-70', '92-96', '76', '25'],
        in: ['26-28', '36-38', '30', '10'],
      },
      {
        size: 'M',
        cm: ['70-74', '96-100', '76', '26'],
        in: ['28-29', '38-39', '30', '10.5'],
      },
      {
        size: 'L',
        cm: ['74-78', '100-104', '76', '27'],
        in: ['29-31', '39-41', '30', '11'],
      },
      {
        size: 'XL',
        cm: ['78-82', '104-108', '76', '28'],
        in: ['31-32', '41-43', '30', '11'],
      },
    ],
  },
  dresses: {
    titleKey: 'product.sizeGuideModal.categories.dresses',
    headerKeys: [
      'product.sizeGuideModal.headers.size',
      'product.sizeGuideModal.headers.bust',
      'product.sizeGuideModal.headers.waist',
      'product.sizeGuideModal.headers.hips',
      'product.sizeGuideModal.headers.length',
    ],
    rows: [
      {
        size: 'XS',
        cm: ['82-86', '62-66', '88-92', '90'],
        in: ['32-34', '24-26', '35-36', '35.5'],
      },
      {
        size: 'S',
        cm: ['86-90', '66-70', '92-96', '92'],
        in: ['34-35', '26-28', '36-38', '36'],
      },
      {
        size: 'M',
        cm: ['90-94', '70-74', '96-100', '94'],
        in: ['35-37', '28-29', '38-39', '37'],
      },
      {
        size: 'L',
        cm: ['94-98', '74-78', '100-104', '96'],
        in: ['37-39', '29-31', '39-41', '38'],
      },
      {
        size: 'XL',
        cm: ['98-102', '78-82', '104-108', '98'],
        in: ['39-40', '31-32', '41-43', '38.5'],
      },
    ],
  },
  shoes: {
    titleKey: 'product.sizeGuideModal.categories.shoes',
    headerKeys: [
      'product.sizeGuideModal.headers.eu',
      'product.sizeGuideModal.headers.us',
      'product.sizeGuideModal.headers.uk',
      'product.sizeGuideModal.headers.footLength',
    ],
    rows: [
      {size: '35', cm: ['5', '2', '22'], in: ['5', '2', '8.7']},
      {size: '36', cm: ['6', '3', '22.5'], in: ['6', '3', '8.9']},
      {size: '37', cm: ['6.5', '4', '23.5'], in: ['6.5', '4', '9.3']},
      {size: '38', cm: ['7.5', '5', '24'], in: ['7.5', '5', '9.4']},
      {size: '39', cm: ['8.5', '6', '24.5'], in: ['8.5', '6', '9.6']},
      {size: '40', cm: ['9', '6.5', '25.5'], in: ['9', '6.5', '10']},
      {size: '41', cm: ['10', '7.5', '26'], in: ['10', '7.5', '10.2']},
    ],
  },
  accessories: {
    titleKey: 'product.sizeGuideModal.categories.accessories',
    headerKeys: [
      'product.sizeGuideModal.headers.size',
      'product.sizeGuideModal.headers.beltLength',
      'product.sizeGuideModal.headers.fitsWaist',
    ],
    rows: [
      {size: 'XS', cm: ['85', '66-72'], in: ['33.5', '26-28']},
      {size: 'S', cm: ['90', '72-78'], in: ['35.5', '28-31']},
      {size: 'M', cm: ['95', '78-84'], in: ['37.5', '31-33']},
      {size: 'L', cm: ['100', '84-90'], in: ['39.5', '33-35']},
      {size: 'XL', cm: ['105', '90-96'], in: ['41.5', '35-38']},
    ],
  },
};

export function SizeGuide({
  isOpen,
  onClose,
  productType = 'tops',
}: SizeGuideProps) {
  const {t} = useTranslation();
  const [unit, setUnit] = useState<Unit>('cm');
  const [activeTab, setActiveTab] =
    useState<keyof typeof SIZE_CHARTS>(productType);

  const chart = SIZE_CHARTS[activeTab];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={t('product.sizeGuideModal.title')}
    >
      <div className="p-6">
        {/* Unit Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(Object.keys(SIZE_CHARTS) as Array<keyof typeof SIZE_CHARTS>).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-full transition-colors',
                    activeTab === type
                      ? 'bg-primary text-white'
                      : 'bg-surface-1 text-text-secondary hover:bg-surface-2',
                  )}
                >
                  {t(SIZE_CHARTS[type].titleKey as any)}
                </button>
              ),
            )}
          </div>
          <div className="flex rounded-full bg-surface-1 p-1">
            <button
              onClick={() => setUnit('cm')}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-full transition-colors',
                unit === 'cm'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {t('product.sizeGuideModal.units.cm')}
            </button>
            <button
              onClick={() => setUnit('in')}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-full transition-colors',
                unit === 'in'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {t('product.sizeGuideModal.units.in')}
            </button>
          </div>
        </div>

        {/* Size Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default">
                {chart.headerKeys.map((headerKey: string, index: number) => (
                  <th
                    key={headerKey}
                    className={cn(
                      'py-3 px-4 font-semibold text-primary',
                      index === 0 ? 'text-left' : 'text-center',
                    )}
                  >
                    {t(headerKey as any)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row, rowIndex) => (
                <tr
                  key={row.size}
                  className={cn(
                    'border-b border-border-subtle',
                    rowIndex % 2 === 0 ? 'bg-surface-0' : 'bg-surface-1',
                  )}
                >
                  <td className="py-3 px-4 font-medium text-primary">
                    {row.size}
                  </td>
                  {row[unit].map((value, colIndex) => (
                    <td
                      key={`${row.size}-${chart.headerKeys[colIndex + 1]}`}
                      className="py-3 px-4 text-center text-text-secondary"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure */}
        <div className="mt-8 p-6 bg-surface-1 rounded-xl">
          <h3 className="font-medium text-primary mb-4">
            {t('product.sizeGuideModal.howToMeasure')}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-text-secondary">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <div>
                <p className="font-medium text-text-primary mb-1">
                  {t('product.sizeGuideModal.measurements.chestBust.title')}
                </p>
                <p>
                  {t(
                    'product.sizeGuideModal.measurements.chestBust.description',
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <div>
                <p className="font-medium text-text-primary mb-1">
                  {t('product.sizeGuideModal.measurements.waist.title')}
                </p>
                <p>
                  {t('product.sizeGuideModal.measurements.waist.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <div>
                <p className="font-medium text-text-primary mb-1">
                  {t('product.sizeGuideModal.measurements.hips.title')}
                </p>
                <p>
                  {t('product.sizeGuideModal.measurements.hips.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                4
              </span>
              <div>
                <p className="font-medium text-text-primary mb-1">
                  {t('product.sizeGuideModal.measurements.inseam.title')}
                </p>
                <p>
                  {t('product.sizeGuideModal.measurements.inseam.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fit Tips */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <TipIcon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">
              {t('product.sizeGuideModal.fitTip.title')}
            </p>
            <p className="text-text-secondary">
              {t('product.sizeGuideModal.fitTip.message')}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Hook for Size Guide state
export function useSizeGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return {isOpen, open, close};
}
