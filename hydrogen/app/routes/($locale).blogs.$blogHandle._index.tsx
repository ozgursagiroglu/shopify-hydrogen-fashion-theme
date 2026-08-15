import {useLoaderData} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import type {Route} from './+types/($locale).blogs.$blogHandle._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/shared/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ArrowLeftIcon, ArrowRightIcon} from '~/components/icons';
import {LIMITS} from '~/lib/constants';
import {buildPageTitleWithFallback} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, matches}) => {
  return [
    {title: buildPageTitleWithFallback(data?.blog.title, 'Blog', matches)},
    {name: 'description', content: data?.blog.seo?.description ?? ''},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(); // args
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: LIMITS.BLOG_POSTS_PER_PAGE,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

function loadDeferredData() {
  // {context}: Route.LoaderArgs
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-surface-alt py-12 md:py-16 lg:py-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            All Journals
          </Link>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-text">
            {blog.title}
          </h1>
          {blog.seo?.description && (
            <p className="mt-4 text-base md:text-lg text-text-muted max-w-2xl mx-auto">
              {blog.seo.description}
            </p>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        <PaginatedResourceSection<ArticleItemFragment>
          connection={articles}
          resourcesClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >
          {({node: article, index}) => (
            <ArticleCard
              article={article}
              key={article.id}
              loading={index < 3 ? 'eager' : 'lazy'}
              featured={index === 0}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  loading,
  featured = false,
}: {
  article: ArticleItemFragment;
  loading?: 'eager' | 'lazy';
  featured?: boolean;
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));

  return (
    <article className={featured ? 'md:col-span-2 lg:col-span-3' : ''}>
      <Link
        to={`/blogs/${article.blog.handle}/${article.handle}`}
        className="group block"
      >
        {/* Image */}
        {article.image && (
          <div
            className={`relative overflow-hidden rounded-lg bg-surface-alt ${featured ? 'aspect-21/9' : 'aspect-3/2'}`}
          >
            <Image
              alt={article.image.altText || article.title}
              data={article.image}
              loading={loading}
              sizes={
                featured
                  ? '100vw'
                  : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
              }
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className={`mt-4 ${featured ? 'md:mt-6' : ''}`}>
          {/* Date & Author */}
          <div className="flex items-center gap-3 text-sm text-text-muted mb-2">
            <time dateTime={article.publishedAt}>{publishedAt}</time>
            {article.author?.name && (
              <>
                <span>·</span>
                <span>{article.author.name}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h2
            className={`font-display tracking-tight text-text group-hover:text-accent transition-colors ${featured ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'}`}
          >
            {article.title}
          </h2>

          {/* Excerpt - only for featured */}
          {featured && article.contentHtml && (
            <p className="mt-3 text-text-muted line-clamp-2 max-w-3xl">
              {article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 200)}...
            </p>
          )}

          {/* Read More */}
          <span className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-accent">
            Read article
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    </article>
  );
}

const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
