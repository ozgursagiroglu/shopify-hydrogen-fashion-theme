import type {Route} from './+types/($locale).compare';
import {ComparePageContent} from '~/components/product/CompareDrawer';
import {buildPageTitle} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  return [
    {title: buildPageTitle('Compare Products', matches)},
    {name: 'description', content: 'Compare products side by side'},
  ];
};

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        <ComparePageContent />
      </div>
    </div>
  );
}
