import {useLoaderData} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import type {Route} from './+types/($locale).blogs._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/shared/PaginatedResourceSection';
import type {BlogsQuery} from 'storefrontapi.generated';
import {ArrowRightIcon} from '~/components/icons';
import {LIMITS} from '~/lib/constants';
import {buildPageTitle} from '~/lib/seo';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = ({matches}) => {
  return [
    {title: buildPageTitle('Journal', matches)},
    {name: 'description', content: 'Explore our journal for style inspiration, trends, and stories'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(); // args
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: LIMITS.BLOGS_PER_PAGE,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
  ]);

  return {blogs};
}

function loadDeferredData() {
  // {context}: Route.LoaderArgs
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16 lg:py-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-text mb-4">
            Journal
          </h1>
          <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto">
            Stories, trends, and inspiration from the world of fashion
          </p>
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        <PaginatedResourceSection<BlogNode>
          connection={blogs}
          resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {({node: blog}) => (
            <BlogCard key={blog.handle} blog={blog} />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function BlogCard({blog}: {blog: BlogNode}) {
  return (
    <Link
      to={`/blogs/${blog.handle}`}
      prefetch="intent"
      className="group block p-6 md:p-8 bg-surface rounded-lg border border-border hover:border-text hover:shadow-lg transition-all duration-300"
    >
      <h2 className="font-display text-2xl md:text-3xl text-text group-hover:text-accent transition-colors">
        {blog.title}
      </h2>
      {blog.seo?.description && (
        <p className="mt-3 text-text-muted line-clamp-2">
          {blog.seo.description}
        </p>
      )}
      <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-accent">
        View articles
        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}

const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
