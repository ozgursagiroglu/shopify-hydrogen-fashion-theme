import {Image} from '@shopify/hydrogen';
import {HeartIcon, CommentIcon, InstagramIcon} from '~/components/icons';
import {useTranslation} from 'react-i18next';
import type {InstagramPost} from '~/graphql/storefront/MetaobjectQueries';

interface InstagramFeedProps {
  posts?: InstagramPost[];
}

export function InstagramFeed({posts}: InstagramFeedProps) {
  const {t} = useTranslation();

  // Don't render if no posts
  if (!posts || posts.length === 0) {
    return null;
  }

  const items = posts;

  return (
    <section className="py-16 md:py-24 bg-surface-0">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="overline text-text-muted mb-3">@ELAN.FASHION</p>
          <h2 className="font-display text-display-sm md:text-display-md text-primary tracking-tight mb-4">
            {t('home.followUs')}
          </h2>
          <p className="text-text-secondary max-w-md mx-auto">
            {t('home.joinCommunity')}
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {items.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                data={{
                  url: post.image.url,
                  altText: post.image.altText,
                }}
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1 text-white text-sm font-medium">
                  <HeartIcon className="w-4 h-4" />
                  {formatNumber(post.likes)}
                </span>
                <span className="flex items-center gap-1 text-white text-sm font-medium">
                  <CommentIcon className="w-4 h-4" />
                  {post.comments}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Follow Button */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-300 font-medium"
          >
            <InstagramIcon className="w-5 h-5" />
            {t('misc.followOnInstagram')}
          </a>
        </div>
      </div>
    </section>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
