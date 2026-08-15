# ÉLAN Demo Content Map

> Complete reference guide for all seeded content and their relationships

## 📦 Overview

All demo content is now **fully integrated** with no broken links or 404 errors. Every page, collection, blog post, and custom page references valid content.

---

## 🗂️ Collections (11 Total)

| Handle | Title | Description | Referenced By |
|--------|-------|-------------|---------------|
| `women` | Women | Curated collection for modern women | Header menu, Footer menu, Homepage hero, Blog posts |
| `men` | Men | Contemporary classics for gentlemen | Header menu, Footer menu, Homepage hero, Blog posts |
| `dresses` | Dresses | Elegant dresses for every occasion | Header submenu, Blog posts |
| `tops` | Tops | Blouses, shirts, and sweaters | Header submenu, Blog posts |
| `outerwear` | Outerwear | Coats and jackets | Header submenu, Blog posts |
| `accessories` | Accessories | Finishing touches | Header menu, Footer menu, Blog posts |
| `new-in` | New Arrivals | Latest additions | Header menu, Footer menu, Blog posts |
| `all` | All Products | Complete collection | Header menu, Footer menu |
| `autumn` | Autumn Collection | Seasonal essentials | **Lookbook items**, Blog posts |
| `workwear` | Workwear | Professional pieces | **Lookbook items**, Blog posts |
| `casual` | Casual Essentials | Relaxed weekend wear | **Lookbook items**, Blog posts |

**✅ All collections are valid** - No 404s from lookbook items or blog references

---

## 📝 Blog Posts (6 Total)

| Handle | Title | Category | Links To |
|--------|-------|----------|----------|
| `autumn-wardrobe-essentials` | 10 Autumn Wardrobe Essentials | Seasonal Trends | `/collections/autumn`, `/collections/workwear` |
| `sustainable-fashion-guide` | Building a Sustainable Wardrobe | Sustainability | `/pages/sustainability`, `/collections/women`, `/collections/men` |
| `office-to-evening-styling` | From Office to Evening | Style Guide | `/collections/workwear`, `/collections/dresses` |
| `behind-scenes-atelier` | Behind the Scenes: Atelier | Behind the Scenes | `/collections/women`, `/collections/men`, `/collections/new-in`, `/about` |
| `winter-layering-guide` | The Art of Winter Layering | Style Guide | `/collections/outerwear`, `/collections/accessories` |
| `weekend-casual-essentials` | Weekend Wardrobe Essentials | Style Guide | `/collections/casual`, `/collections/tops`, `/collections/dresses` |

**✅ All blog internal links are valid**

---

## 📄 Custom Pages (7 Total)

| Handle | Title | Route | Links To |
|--------|-------|-------|----------|
| `sustainability` | Sustainability | `/pages/sustainability` | `/collections/women`, `/collections/men`, `/collections/new-in`, `/about`, `/blogs/journal` |
| `careers` | Careers | `/pages/careers` | `/stores`, `/about` |
| `cookies` | Cookie Policy | `/pages/cookies` | `/contact`, `/policies/privacy-policy` |
| `about` | About ÉLAN | `/about` | `/stores`, `/pages/sustainability`, `/blogs/journal`, `/pages/careers` |
| `contact` | Contact Us | `/contact` | `/stores`, `/faq` |
| `stores` | Our Stores | `/stores` | `/contact` |
| `faq` | FAQ | `/faq` | `/policies/shipping-policy`, `/policies/refund-policy`, `/pages/sustainability`, `/contact`, `/account` |

**✅ All custom page links are valid**

---

## 🧭 Menu Structure

### Header Menu
```
├── New In → /collections/new-in
├── Women → /collections/women
│   ├── View All → /collections/women
│   ├── Dresses → /collections/dresses
│   ├── Tops → /collections/tops
│   └── Outerwear → /collections/outerwear
├── Men → /collections/men
│   ├── View All → /collections/men
│   └── Outerwear → /collections/outerwear
├── Accessories → /collections/accessories
└── All → /collections/all
```

### Footer Menus

**Shop**
- New Arrivals → `/collections/new-in`
- Women → `/collections/women`
- Men → `/collections/men`
- Accessories → `/collections/accessories`
- All Products → `/collections/all`

**About**
- Our Story → `/about` ✅
- Sustainability → `/pages/sustainability` ✅
- Journal → `/blogs/journal` ✅
- Careers → `/pages/careers` ✅
- Stores → `/stores` ✅

**Help**
- Contact Us → `/contact` ✅
- FAQ → `/faq` ✅
- Shipping → `/policies/shipping-policy` (Shopify policy)
- Returns → `/policies/refund-policy` (Shopify policy)

**Legal**
- Privacy Policy → `/policies/privacy-policy` (Shopify policy)
- Terms of Service → `/policies/terms-of-service` (Shopify policy)
- Cookies → `/pages/cookies` ✅

**✅ All menu links have corresponding content**

---

## 🏠 Homepage Content

### Hero Section
- Primary CTA → `/collections/women` ✅
- Secondary CTA → `/collections/men` ✅

### Feature Banner
- CTA → `/about` ✅

### Lookbook Items
- Autumn Essentials → `/collections/autumn` ✅
- Office Ready → `/collections/workwear` ✅
- Weekend Casual → `/collections/casual` ✅

### Split Hero
- Women Panel → `/collections/women` ✅
- Men Panel → `/collections/men` ✅

---

## 🏪 Store Locations (3 Total)

- ÉLAN Paris — Le Marais
- ÉLAN London — Soho
- ÉLAN New York — SoHo

Accessible via `/stores` route

---

## 📊 Metaobject Definitions (13 Total)

| Type | Count | Status |
|------|-------|--------|
| `homepage_hero` | 1 | ✅ |
| `feature_banner` | 1 | ✅ |
| `press_feature` | 6 | ✅ |
| `lookbook_item` | 3 | ✅ |
| `split_hero` | 2 | ✅ |
| `testimonial` | 4 | ✅ |
| `instagram_post` | 6 | ✅ |
| `faq` | 10 | ✅ |
| `newsletter_section` | 1 | ✅ |
| `about_page` | 1 | ✅ |
| `brand_value` | 4 | ✅ |
| `store_location` | 3 | ✅ |
| `lookbook_collection` | 2 | ✅ |

## 📝 Native Shopify Content

| Type | Count | Status | File |
|------|-------|--------|------|
| **Blog** (`journal`) | 1 | ✅ | Created automatically |
| **Articles** | 6 | ✅ | `demo-articles.json` |
| **Pages** | 7 | ✅ | `demo-pages.json` |
| **Policies** | 4 | ✅ | `demo-policies.json` |

> **Note:** Blog posts, custom pages, and policies use Shopify's native resources instead of metaobjects. This is the correct approach as these are built-in Shopify content types.

---

## 🔗 Link Validation Summary

### ✅ Valid Internal Links

**Collections (11)**
- All collection handles are valid
- All referenced in menus, blog posts, and pages

**Pages (7)**
- `/about` - Native Shopify page ✅
- `/contact` - Native Shopify page ✅
- `/faq` - Native Shopify page ✅
- `/stores` - Native Shopify page ✅
- `/pages/sustainability` - Native Shopify page ✅
- `/pages/careers` - Native Shopify page ✅
- `/pages/cookies` - Native Shopify page ✅
- `/blogs/journal` - Blog listing page (6 articles)

**Policies (4)**
- `/policies/privacy-policy` - Shopify policy
- `/policies/terms-of-service` - Shopify policy
- `/policies/shipping-policy` - Shopify policy
- `/policies/refund-policy` - Shopify policy

### ❌ No Broken Links!

All cross-references have been validated and work correctly.

---

## 🚀 Seeding Instructions

1. **Install dependencies:**
   ```bash
   cd scripts/seed
   yarn install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add your Shopify credentials
   ```

3. **Run seed:**
   ```bash
   yarn seed              # Create everything
   yarn seed:definitions  # Definitions only
   yarn seed:entries      # Entries only
   ```

4. **Verify:**
   - Visit `/collections/*` - All 11 collections load
   - Visit `/blogs/journal` - All 6 blog posts show
   - Visit `/pages/*` - All 7 custom pages load
   - Visit `/policies/*` - All 4 policies display
   - Check menus - No 404 links
   - Check footer - All links work

---

## 📚 Content Relationships

```
Collections (11)
    ↓ Referenced by
├─ Header Menu
├─ Footer Menu
├─ Homepage (Hero, Lookbook, Split Hero)
├─ Articles (6) ← Native Shopify blog posts
└─ Pages (3) ← Native Shopify pages

About Page (Metaobject)
    ↓ Referenced by
├─ Homepage Feature Banner
├─ Articles
├─ Pages
└─ Footer Menu

Store Locations (3 Metaobjects)
    ↓ Displayed on
└─ /stores route

Blog: "journal" (Native Shopify)
    ├─ Articles (6)
    ↓ Displayed on
    ├─ /blogs/journal listing
    └─ /blogs/journal/{handle} individual articles

Pages (7 - Native Shopify)
    ├─ About (/about)
    ├─ Contact (/contact)
    ├─ Stores (/stores)
    ├─ FAQ (/faq)
    ├─ Sustainability (/pages/sustainability)
    ├─ Careers (/pages/careers)
    └─ Cookie Policy (/pages/cookies)
    ↓ Accessed via
    ├─ Footer Menu
    ├─ Header Links
    └─ Article/Page Links

Policies (4 - Native Shopify)
    ├─ Shipping Policy (/policies/shipping-policy)
    ├─ Refund Policy (/policies/refund-policy)
    ├─ Privacy Policy (/policies/privacy-policy)
    └─ Terms of Service (/policies/terms-of-service)
    ↓ Accessed via
    ├─ Footer Menu
    └─ Page Links
```

---

## 🎯 Key Improvements

1. **✅ Added Missing Collections**
   - `autumn` - For lookbook item reference
   - `workwear` - For lookbook item reference
   - `casual` - For lookbook item reference

2. **✅ Created Blog & Articles (Native Shopify)**
   - "journal" blog created automatically
   - 6 comprehensive articles using Shopify's native Article resource
   - All link to valid collections and pages
   - SEO-optimized with excerpts and featured images
   - Author roles and reading time metadata

3. **✅ Created All Custom Pages (Native Shopify)**
   - 7 pages using Shopify's native Page resource
   - About page with brand story and values
   - Contact page with customer service info
   - Stores page with all 3 locations
   - FAQ page with common questions
   - Sustainability page with collection links
   - Careers page with store links
   - Cookie policy with legal links
   - Custom metafields for hero images and SEO

4. **✅ Created All Shop Policies (Native Shopify)**
   - 4 comprehensive policies using Shopify's native Policy system
   - Shipping Policy with delivery options and tracking
   - Refund Policy with 30-day return guarantee
   - Privacy Policy with GDPR compliance
   - Terms of Service with legal protections

5. **✅ Verified All Links**
   - No broken collection references
   - No 404 pages
   - All menu items valid
   - All cross-references work
   - All policy links functional

6. **✅ Proper Architecture**
   - Blog posts use native Shopify Articles (not metaobjects)
   - Pages use native Shopify Pages (not metaobjects)
   - Policies use native Shopify Policy system (not metaobjects)
   - Follows Shopify best practices
   - Eliminates unnecessary metaobject definitions

---

**Result:** A fully integrated, cohesive demo store with zero broken links! 🎉
