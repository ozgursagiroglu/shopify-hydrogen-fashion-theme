import type {BrandValue} from '~/graphql/storefront/MetaobjectQueries';
import {
  SparklesIcon,
  ClockIcon,
  LeafIcon,
  HeartIcon,
} from '~/components/icons';

interface ValueCardProps {
  value: BrandValue;
}

export function ValueCard({value}: ValueCardProps) {
  const iconMap: Record<string, React.ComponentType<any>> = {
    sparkles: SparklesIcon,
    clock: ClockIcon,
    leaf: LeafIcon,
    heart: HeartIcon,
  };

  const IconComponent = iconMap[value.icon] || SparklesIcon;

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
        <IconComponent className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-display text-xl md:text-2xl text-text mb-2">
          {value.title}
        </h3>
        <p className="text-text-secondary leading-relaxed">
          {value.description}
        </p>
      </div>
    </div>
  );
}
