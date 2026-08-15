import {useLoaderData} from 'react-router';
import {LocaleLink as Link} from '~/components/shared/LocaleLink';
import type {Route} from './+types/($locale).blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ArrowLeftIcon} from '~/components/icons';
import {buildPageTitleWithFallback} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data, matches}) => {
  const title = buildPageTitleWithFallback(
    data?.article.title,
    'Article',
    matches,
  );
  const description = data?.article.seo?.description ?? '';
  const image = data?.article.image?.url ?? '';

  return [
    {title},
    {name: 'description', content: description},
    // Open Graph
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'article'},
    {property: 'og:image', content: image},
    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(); // args

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article, blogHandle};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData() {
  //{context}: Route.LoaderArgs
  return {};
}

export default function Article() {
  const {article, blogHandle} = useLoaderData<typeof loader>();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div className="min-h-screen">
      {/* Article Header */}
      <header className="bg-surface-alt py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Back Link */}
          <Link
            to={`/blogs/${blogHandle}`}
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Journal
          </Link>

          {/* Meta */}
          <div className="flex items-center justify-center gap-3 text-sm text-text-muted mb-4">
            <time dateTime={article.publishedAt}>{publishedDate}</time>
            {author?.name && (
              <>
                <span>·</span>
                <span>{author.name}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-text">
            {title}
          </h1>
        </div>
      </header>

      {/* Featured Image */}
      {image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-12">
          <div className="relative aspect-21/9 rounded-lg overflow-hidden shadow-lg">
            <Image
              data={image}
              sizes="(min-width: 1024px) 960px, (min-width: 768px) 720px, 100vw"
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div
          dangerouslySetInnerHTML={{__html: contentHtml}}
          className="prose prose-lg prose-stone max-w-none
            prose-headings:font-display prose-headings:tracking-tight prose-headings:text-text
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text prose-strong:font-medium
            prose-blockquote:border-l-accent prose-blockquote:text-text-muted prose-blockquote:italic
            prose-img:rounded-lg prose-img:shadow-md
            prose-ul:text-text-secondary prose-ol:text-text-secondary
            prose-li:marker:text-text-muted"
        />
      </article>

      {/* Article Footer */}
      <footer className="border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            to={`/blogs/${blogHandle}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>
      </footer>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
