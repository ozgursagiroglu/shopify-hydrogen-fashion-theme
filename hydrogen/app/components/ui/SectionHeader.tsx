import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import {cn} from '~/lib/cn';
import {ArrowRightIcon} from '~/components/icons';
import {RTLIcon} from '~/components/icons/RTLIcon';
import {TextReveal} from '~/components/motion';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  centered = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        centered
          ? 'items-center text-center'
          : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div>
        <TextReveal
          text={title}
          className="text-3xl md:text-4xl font-display text-text"
        />
        {subtitle && (
          <p className="mt-2 text-text-muted text-base md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          to={action.href}
          className="group inline-flex items-center gap-2 text-sm h-6 uppercase tracking-wider font-medium mt-4 md:mt-0 text-text hover:underline transition-colors"
        >
          {action.label}
          <RTLIcon
            icon={ArrowRightIcon}
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}
