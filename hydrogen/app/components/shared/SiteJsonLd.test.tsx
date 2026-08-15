/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {SiteJsonLd} from './SiteJsonLd';
import type {ShopFragment} from 'storefrontapi.generated';

const mockShop: ShopFragment = {
  id: 'gid://shopify/Shop/1',
  name: 'ÉLAN',
  description: 'Premium fashion for the modern wardrobe.',
  primaryDomain: {url: 'https://elan.example.com'},
  brand: {logo: {image: {url: 'https://cdn.example.com/logo.png'}}},
};

/** Renders the component and returns the parsed JSON-LD payload. */
function renderJsonLd(props: Partial<Parameters<typeof SiteJsonLd>[0]> = {}) {
  const {container} = render(<SiteJsonLd shop={mockShop} {...props} />);
  const script = container.querySelector(
    'script[type="application/ld+json"]',
  ) as HTMLScriptElement;

  return {
    script,
    data: JSON.parse(script.innerHTML) as {
      '@context': string;
      '@graph': Record<string, any>[];
    },
  };
}

function nodeOfType(data: {'@graph': Record<string, any>[]}, type: string) {
  return data['@graph'].find((node) => node['@type'] === type)!;
}

describe('SiteJsonLd', () => {
  describe('Script tag', () => {
    it('renders a single ld+json script', () => {
      const {container} = render(<SiteJsonLd shop={mockShop} />);

      expect(
        container.querySelectorAll('script[type="application/ld+json"]'),
      ).toHaveLength(1);
    });

    it('emits valid JSON with the schema.org context', () => {
      const {data} = renderJsonLd();

      expect(data['@context']).toBe('https://schema.org');
      expect(data['@graph']).toHaveLength(2);
    });
  });

  describe('Organization node', () => {
    it('describes the shop', () => {
      const org = nodeOfType(renderJsonLd().data, 'Organization');

      expect(org.name).toBe('ÉLAN');
      expect(org.url).toBe('https://elan.example.com');
      expect(org.description).toBe('Premium fashion for the modern wardrobe.');
      expect(org['@id']).toBe('https://elan.example.com/#organization');
    });

    it('includes the brand logo as an ImageObject', () => {
      const org = nodeOfType(renderJsonLd().data, 'Organization');

      expect(org.logo).toEqual({
        '@type': 'ImageObject',
        url: 'https://cdn.example.com/logo.png',
      });
    });

    it('omits the logo when the shop has no brand image', () => {
      const {data} = renderJsonLd({shop: {...mockShop, brand: null}});

      expect(nodeOfType(data, 'Organization')).not.toHaveProperty('logo');
    });

    it('omits the description when the shop has none', () => {
      const {data} = renderJsonLd({shop: {...mockShop, description: null}});

      expect(nodeOfType(data, 'Organization')).not.toHaveProperty('description');
    });

    it('includes social profiles as sameAs when provided', () => {
      const sameAs = [
        'https://instagram.com/elan',
        'https://tiktok.com/@elan',
      ];
      const {data} = renderJsonLd({sameAs});

      expect(nodeOfType(data, 'Organization').sameAs).toEqual(sameAs);
    });

    it('omits sameAs when no social profiles are given', () => {
      expect(nodeOfType(renderJsonLd().data, 'Organization')).not.toHaveProperty(
        'sameAs',
      );
    });

    it('omits sameAs when an empty list is given', () => {
      const {data} = renderJsonLd({sameAs: []});

      expect(nodeOfType(data, 'Organization')).not.toHaveProperty('sameAs');
    });
  });

  describe('WebSite node', () => {
    it('describes the site and links to the organization', () => {
      const site = nodeOfType(renderJsonLd().data, 'WebSite');

      expect(site.name).toBe('ÉLAN');
      expect(site.url).toBe('https://elan.example.com');
      expect(site['@id']).toBe('https://elan.example.com/#website');
      expect(site.publisher).toEqual({
        '@id': 'https://elan.example.com/#organization',
      });
    });

    it('exposes a SearchAction pointing at the search route', () => {
      const site = nodeOfType(renderJsonLd().data, 'WebSite');

      expect(site.potentialAction).toEqual({
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://elan.example.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      });
    });
  });

  describe('URL normalisation', () => {
    it('strips trailing slashes from the primary domain', () => {
      const {data} = renderJsonLd({
        shop: {...mockShop, primaryDomain: {url: 'https://elan.example.com///'}},
      });

      expect(nodeOfType(data, 'Organization')['@id']).toBe(
        'https://elan.example.com/#organization',
      );
      expect(nodeOfType(data, 'WebSite').url).toBe('https://elan.example.com');
    });
  });
});
