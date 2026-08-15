# Shopify Metaobjects Setup Guide

This guide explains how to set up Shopify Metaobjects to power dynamic content on your ada ÉLAN storefront. Metaobjects allow you to manage homepage sections and custom content directly from Shopify Admin.

---

## Table of Contents

1. [Overview](#overview)
2. [Homepage Hero](#homepage-hero)
3. [Feature Banner](#feature-banner)
4. [Press Features](#press-features)
5. [Lookbook Items](#lookbook-items)
6. [Lookbook Collections](#lookbook-collections)
7. [Split Hero](#split-hero)
8. [Testimonials](#testimonials)
9. [Instagram Posts](#instagram-posts)
10. [Category Grid (Collections)](#category-grid-collections)
11. [About Page](#about-page)
12. [Brand Values](#brand-values)
13. [Store Locations](#store-locations)
14. [Customer Reviews](#customer-reviews)
15. [Contact Submissions](#contact-submissions)
16. [Stock Alerts](#stock-alerts)
17. [Storefront API Access](#storefront-api-access)
18. [Troubleshooting](#troubleshooting)

---

## Overview

ada ÉLAN uses Shopify Metaobjects for dynamic homepage and page content:

| Content Type | Metaobject Type | Purpose | Required |
|--------------|-----------------|---------|----------|
| Homepage Hero | `homepage_hero` | Main hero banner | Yes (1 entry) |
| Feature Banner | `feature_banner` | Brand story section | Yes (1 entry) |
| Press Features | `press_feature` | "As Featured In" logos | Optional |
| Lookbook Items | `lookbook_item` | Editorial lookbook grid | Optional |
| Lookbook Collections | `lookbook_collection` | Seasonal lookbook collections | Optional |
| Split Hero | `split_hero` | Men/Women split panels | Optional |
| Testimonials | `testimonial` | Customer reviews | Optional |
| Instagram Feed | `instagram_post` | Social proof grid | Optional |
| About Page | `about_page` | About us page content | Yes (1 entry) |
| Brand Values | `brand_value` | Core brand values (About page) | Optional |
| Store Locations | `store_location` | Physical store locations | Optional |
| Customer Reviews | `customer_review` | Product reviews system | Required for reviews |
| Contact Submissions | `contact_submission` | Contact form storage | Required for contact |
| Stock Alerts | `stock_alert` | Back-in-stock notifications | Required for stock alerts |

**Important:** Sections without metaobject data will not render on the homepage.

---

## Homepage Hero

The main hero banner at the top of your homepage.

### Step 1: Create the Metaobject Definition

1. Go to **Shopify Admin** → **Settings** → **Custom data** → **Metaobject definitions**
2. Click **Add definition**
3. Set:
   - **Name**: `Homepage Hero`
   - **Type**: `homepage_hero`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Title | `title` | Single line text | Yes | Main headline |
| Subtitle | `subtitle` | Multi-line text | No | Supporting text |
| Background Image | `background_image` | File (Image) | Yes | Hero image (1920x1080px recommended) |
| Primary Button Text | `primary_cta_text` | Single line text | No | e.g., "Shop Women" |
| Primary Button URL | `primary_cta_url` | URL | No | e.g., /collections/women |
| Secondary Button Text | `secondary_cta_text` | Single line text | No | e.g., "Shop Men" |
| Secondary Button URL | `secondary_cta_url` | URL | No | e.g., /collections/men |
| Height | `height` | Single line text | No | "full", "large", or "medium" (default: large) |

### Step 3: Enable Storefront Access

1. In the definition settings, scroll to **Storefront access**
2. Toggle ON "Storefronts can read metaobject entries"

### Step 4: Create Entry

1. Go to **Content** → **Metaobjects** → **Homepage Hero**
2. Click **Add entry**
3. Fill in:

```
Title: New Season Collection
Subtitle: Discover timeless elegance in our latest arrivals. Curated pieces designed for the modern wardrobe.
Background Image: [Upload hero image - 1920x1080px or larger]
Primary Button Text: Shop Women
Primary Button URL: /collections/women
Secondary Button Text: Shop Men
Secondary Button URL: /collections/men
Height: large
```

**Note:** Only the first entry is used. Create only 1 homepage hero.

---

## Feature Banner

A full-width banner for brand storytelling.

### Step 1: Create the Metaobject Definition

1. Go to **Settings** → **Custom data** → **Metaobject definitions**
2. Click **Add definition**
3. Set:
   - **Name**: `Feature Banner`
   - **Type**: `feature_banner`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Title | `title` | Single line text | Yes | Main headline |
| Subtitle | `subtitle` | Multi-line text | No | Supporting description |
| Image | `image` | File (Image) | Yes | Background image (1920x600px) |
| Button Text | `cta_text` | Single line text | No | e.g., "Our Story" |
| Button URL | `cta_url` | URL | No | e.g., /about |
| Alignment | `alignment` | Single line text | No | "left", "center", or "right" |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Create Entry

```
Title: Crafted with Care, Designed to Last
Subtitle: We believe in slow fashion. Every piece is made with premium materials and timeless design.
Image: [Upload wide banner image]
Button Text: Our Story
Button URL: /about
Alignment: center
```

---

## Press Features

"As Featured In" section with publication logos and quotes.

> **Note:** Demo entries use placeholder names. Replace with your actual press features or remove this section if not applicable.

### Step 1: Create the Metaobject Definition

1. **Name**: `Press Feature`
2. **Type**: `press_feature`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Publication Name | `name` | Single line text | Yes | Publication or media outlet name |
| Logo Text | `logo_text` | Single line text | Yes | Text to display as logo |
| Logo Image | `logo_image` | File (Image) | No | Optional SVG/PNG logo |
| Quote | `quote` | Single line text | No | Short quote about your brand |
| Is Featured | `is_featured` | True/false | No | Show as main featured quote |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Create Entries

Create 4-6 press entries. **For demo purposes, use placeholder names:**

**Entry 1 (Featured):**
```
Publication Name: Fashion Weekly
Logo Text: FASHION WEEKLY
Quote: A fresh approach to modern elegance.
Is Featured: true
```

**Entry 2:**
```
Publication Name: Style Magazine
Logo Text: STYLE
Quote: Timeless pieces for the contemporary wardrobe
Is Featured: false
```

**Entry 3:**
```
Publication Name: Mode Journal
Logo Text: MODE
Quote: Where craftsmanship meets design
Is Featured: false
```

**Entry 4:**
```
Publication Name: Luxe Living
Logo Text: LUXE
Quote: Exceptional quality, refined aesthetic
Is Featured: false
```

> **For production:** Replace these with your actual press features, or remove this section entirely if you don't have press coverage yet

---

## Lookbook Items

Editorial lookbook grid showcasing curated collections.

### Step 1: Create the Metaobject Definition

1. **Name**: `Lookbook Item`
2. **Type**: `lookbook_item`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Title | `title` | Single line text | Yes | e.g., "Autumn Essentials" |
| Image | `image` | File (Image) | Yes | Editorial photo (800x1000px) |
| Collection | `collection` | Collection reference | No | Link to collection |
| URL | `url` | URL | No | Custom URL (if not using collection) |
| Order | `order` | Integer number | No | Display order (1, 2, 3...) |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Create Entries

Create 3 lookbook items for best layout:

**Entry 1:**
```
Title: Autumn Essentials
Image: [Upload editorial photo]
Collection: [Select "Autumn" collection]
Order: 1
```

**Entry 2:**
```
Title: Office Ready
Image: [Upload editorial photo]
Collection: [Select "Workwear" collection]
Order: 2
```

**Entry 3:**
```
Title: Weekend Casual
Image: [Upload editorial photo]
Collection: [Select "Casual" collection]
Order: 3
```

---

## Lookbook Collections

Seasonal lookbook collections displayed on the dedicated `/lookbook` page.

### Step 1: Create the Metaobject Definition

1. **Name**: `Lookbook Collection`
2. **Type**: `lookbook_collection`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Title | `title` | Single line text | Yes | Collection name (e.g., "Spring/Summer 2025") |
| Subtitle | `subtitle` | Single line text | No | Supporting description or tagline |
| Description | `description` | Multi-line text | No | Detailed collection theme description |
| Hero Image | `hero_image` | File (Image) | No | Main image for collection (1600x700px) |
| Season | `season` | Single line text | No | Season identifier (e.g., "SS25", "AW24") |
| Year | `year` | Integer number | No | Collection year (validation: min 2020, max 2030) |
| Featured | `featured` | True/false | No | Show this collection prominently |
| Order | `order` | Integer number | No | Display order (1, 2, 3...) |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Create Entries

Create lookbook collections for your seasonal campaigns:

**Entry 1 (Featured):**
```
Title: Spring/Summer 2025
Subtitle: New Beginnings
Description: Embrace the season with flowing silhouettes and fresh tones. Our Spring/Summer collection celebrates renewal and effortless elegance.
Hero Image: [Upload hero image]
Season: SS25
Year: 2025
Featured: true
Order: 1
```

**Entry 2:**
```
Title: Autumn/Winter 2024
Subtitle: Essential Layers
Description: Timeless pieces designed for the cooler months. Rich textures and refined tailoring define our Autumn/Winter collection.
Hero Image: [Upload hero image]
Season: AW24
Year: 2024
Featured: false
Order: 2
```

---

## Split Hero

Men/Women split panels section.

### Step 1: Create the Metaobject Definition

1. **Name**: `Split Hero`
2. **Type**: `split_hero`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Title | `title` | Single line text | Yes | Panel title (e.g., "Women") |
| Image | `image` | File (Image) | Yes | Panel image (1200x800px) |
| Button Text | `cta_text` | Single line text | No | e.g., "Shop Now" |
| Button URL | `cta_url` | URL | No | e.g., /collections/women |
| Position | `position` | Single line text | Yes | "left" or "right" |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Create Entries

Create exactly 2 entries:

**Entry 1 (Left Panel):**
```
Title: Women
Image: [Upload women's fashion image]
Button Text: Shop Now
Button URL: /collections/women
Position: left
```

**Entry 2 (Right Panel):**
```
Title: Men
Image: [Upload men's fashion image]
Button Text: Shop Now
Button URL: /collections/men
Position: right
```

---

## Testimonials

Customer reviews and social proof.

### Step 1: Create the Metaobject Definition

1. **Name**: `Testimonial`
2. **Type**: `testimonial`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Name | `name` | Single line text | Yes | Customer name |
| Location | `location` | Single line text | No | e.g., "New York, NY" |
| Avatar | `avatar` | File (Image) | No | Customer photo (100x100px) |
| Rating | `rating` | Integer number | Yes | 1-5 stars |
| Text | `text` | Multi-line text | Yes | Review content |
| Product | `product` | Product reference | No | Purchased product |
| Verified | `verified` | True/false | No | Verified purchase badge |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Create Entries

Create 3-6 testimonials:

```
Name: Alexandra Chen
Location: New York, NY
Avatar: [Upload headshot]
Rating: 5
Text: The quality of ada ÉLAN pieces is unmatched. Every garment feels luxurious and the attention to detail is exceptional.
Product: [Select product]
Verified: true
```

---

## Instagram Posts

Social feed grid.

### Step 1: Create the Metaobject Definition

1. **Name**: `Instagram Post`
2. **Type**: `instagram_post`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Image | `image` | File (Image) | Yes | Square image (400x400px) |
| Likes | `likes` | Integer number | No | Like count |
| Comments | `comments` | Integer number | No | Comment count |
| URL | `url` | URL | No | Link to Instagram post |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Create Entries

Create 6 posts for optimal grid layout.

---

## Category Grid (Collections)

**Note:** Category Grid uses Shopify Collections directly, not metaobjects.

### Setup

1. Go to **Products** → **Collections**
2. Ensure collections have:
   - **Title**: Category name
   - **Image**: Collection image (800x1000px recommended)
   - **Handle**: URL-friendly slug

### Collections to Create

| Collection | Handle | Purpose |
|------------|--------|---------|
| Dresses | `dresses` | Women's dresses |
| Tops | `tops` | Tops & blouses |
| Outerwear | `outerwear` | Coats & jackets |
| Accessories | `accessories` | Bags, jewelry, etc. |

The homepage will automatically display the first 4 collections with images.

---

## About Page

Content for the `/about` page, including mission, story, and values sections.

### Step 1: Create the Metaobject Definition

1. **Name**: `About Page`
2. **Type**: `about_page`
3. **Display name key**: `title`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Title | `title` | Single line text | Yes | Page title (e.g., "About ada ÉLAN") |
| Subtitle | `subtitle` | Single line text | No | Hero subtitle |
| Hero Image | `hero_image` | File (Image) | No | Hero background image (1920x600px) |
| Mission Title | `mission_title` | Single line text | No | Mission section heading |
| Mission Text | `mission_text` | Multi-line text | No | Mission statement |
| Story Title | `story_title` | Single line text | No | Story section heading |
| Story Text | `story_text` | Multi-line text | No | Brand story (supports \n\n for paragraphs) |
| Story Image | `story_image` | File (Image) | No | Story section image (1200x1500px) |
| Values Title | `values_title` | Single line text | No | Values section heading |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Enable Translatable Content

1. In definition settings, enable **Translatable content**
2. This allows multi-language versions of the About page

### Step 5: Create Entry

Create exactly 1 entry (singleton):

```
Title: About ada ÉLAN
Subtitle: Where timeless design meets conscious craftsmanship
Hero Image: [Upload hero image]
Mission Title: Our Mission
Mission Text: We believe fashion should be timeless, not temporary. Every piece in our collection is designed to become a lasting part of your wardrobe, transcending seasons and trends.
Story Title: Our Story
Story Text: Founded in 2020, ÉLAN was born from a simple belief: fashion should be both beautiful and responsible.

Our founders, inspired by the elegance of European ateliers and the craftsmanship of traditional tailoring, set out to create a brand that honors both heritage and innovation.

Today, we work with skilled artisans and sustainable suppliers to create pieces that tell a story—your story.
Story Image: [Upload story image]
Values Title: What Drives Us
```

**Note:** Only the first entry is used. Create only 1 about page entry.

---

## Brand Values

Core brand values displayed on the About page, with icon support.

### Step 1: Create the Metaobject Definition

1. **Name**: `Brand Value`
2. **Type**: `brand_value`
3. **Display name key**: `title`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Title | `title` | Single line text | Yes | Value title (e.g., "Quality Craftsmanship") |
| Description | `description` | Multi-line text | Yes | Value description |
| Icon | `icon` | Single line text | No | Icon identifier (see supported icons below) |
| Order | `order` | Integer number | No | Display order (1, 2, 3...) |

### Supported Icons

Use these icon names in the `icon` field:
- `sparkles` - Quality & Excellence
- `clock` - Timeless Design
- `leaf` - Sustainability
- `heart` - Craftsmanship & Care

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Enable Translatable Content

Enable **Translatable content** in definition settings.

### Step 5: Create Entries

Create 2-4 brand value entries:

**Entry 1:**
```
Title: Quality Craftsmanship
Description: Every piece is crafted with premium materials and meticulous attention to detail, ensuring lasting quality and timeless appeal.
Icon: sparkles
Order: 1
```

**Entry 2:**
```
Title: Timeless Design
Description: We create pieces that transcend fleeting trends, focusing on classic silhouettes and versatile styles that remain relevant season after season.
Icon: clock
Order: 2
```

**Entry 3:**
```
Title: Sustainable Practice
Description: From ethically sourced materials to responsible production methods, sustainability is woven into every decision we make.
Icon: leaf
Order: 3
```

**Entry 4:**
```
Title: Made with Care
Description: Each garment is thoughtfully designed and carefully constructed by skilled artisans who take pride in their craft.
Icon: heart
Order: 4
```

---

## Store Locations

Physical store locations displayed on the `/stores` page with contact info and map integration.

### Step 1: Create the Metaobject Definition

1. **Name**: `Store Location`
2. **Type**: `store_location`
3. **Display name key**: `name`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Name | `name` | Single line text | Yes | Store name (e.g., "ada ÉLAN Paris — Le Marais") |
| Image | `image` | File (Image) | No | Store photo (1200x675px) |
| Address Line 1 | `address_line1` | Single line text | Yes | Street address |
| Address Line 2 | `address_line2` | Single line text | No | Suite, floor, etc. |
| City | `city` | Single line text | Yes | City name |
| Postal Code | `postal_code` | Single line text | No | ZIP/Postal code |
| Country | `country` | Single line text | Yes | Country name |
| Phone | `phone` | Single line text | No | Contact phone |
| Email | `email` | Single line text | No | Store email |
| Hours | `hours` | Multi-line text | No | Opening hours (one per line) |
| Latitude | `latitude` | Single line text | No | GPS latitude for map integration |
| Longitude | `longitude` | Single line text | No | GPS longitude for map integration |
| Features | `features` | Multi-line text | No | Store amenities (one per line) |
| Order | `order` | Integer number | No | Display order (1, 2, 3...) |

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Enable Translatable Content

Enable **Translatable content** in definition settings.

### Step 5: Create Entries

Create entries for each physical store location:

**Entry 1:**
```
Name: ada ÉLAN Paris — Le Marais
Image: [Upload store photo]
Address Line 1: 45 Rue des Francs Bourgeois
Address Line 2:
City: Paris
Postal Code: 75004
Country: France
Phone: +33 1 23 45 67 89
Email: paris@ada-elan.com
Hours: Monday - Saturday: 11:00 - 19:00
Sunday: 13:00 - 18:00
Latitude: 48.8566
Longitude: 2.3522
Features: Personal Styling
Alterations Service
Private Shopping
Click & Collect
Order: 1
```

**Entry 2:**
```
Name: ada ÉLAN London — Mayfair
Image: [Upload store photo]
Address Line 1: 123 Bond Street
City: London
Postal Code: W1S 1DY
Country: United Kingdom
Phone: +44 20 7123 4567
Email: london@ada-elan.com
Hours: Monday - Saturday: 10:00 - 20:00
Sunday: 12:00 - 18:00
Latitude: 51.5074
Longitude: -0.1278
Features: Personal Styling
Express Alterations
VIP Appointments
Gift Wrapping
Order: 2
```

**Note:** GPS coordinates enable Google Maps integration with "Get Directions" functionality.

---

## Customer Reviews

Product review system that stores verified purchase reviews.

### Step 1: Create the Metaobject Definition

1. **Name**: `Customer Review`
2. **Type**: `customer_review`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Product | `product` | Product reference | Yes | Product being reviewed |
| Rating | `rating` | Integer number | Yes | 1-5 stars |
| Title | `title` | Single line text | Yes | Review headline |
| Content | `content` | Multi-line text | Yes | Review text |
| Author Name | `author_name` | Single line text | Yes | Customer name |
| Author Email | `author_email` | Single line text | Yes | Customer email |
| Customer ID | `customer_id` | Single line text | Yes | Shopify customer ID |
| Verified | `verified` | True/false | Yes | Verified purchase badge |
| Status | `status` | Single line text (dropdown) | Yes | Select: "pending", "approved", "rejected" |
| Created At | `created_at` | Date | Yes | Review submission date |

**Note:** The `status` field uses the "Limit to preset choices" validation to create a dropdown with predefined options for moderation workflow.

### Step 3: Enable Storefront Access

Toggle ON in definition settings.

### Step 4: Enable Admin API

For the review submission system to work, you need to configure Admin API access:

1. Go to **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Name it "ÉLAN Starter Kit API"
4. Under **Configuration** → **Admin API integration**, enable:
   - `write_metaobjects` (to create reviews)
   - `read_metaobjects` (to read reviews)
5. Install the app and copy the **Admin API access token**
6. Add to your `.env` file:
   ```
   ADMIN_API_ACCESS_TOKEN=your_token_here
   ADMIN_API_VERSION=2025-10
   ```

### Step 5: How It Works

- Customers can only review products they've purchased
- Reviews are automatically verified
- Reviews are auto-approved for verified purchases
- Merchants can view/manage reviews in **Content** → **Metaobjects** → **Customer Review**

---

## Contact Submissions

Contact form submissions stored as metaobjects for merchant review.

### Step 1: Create the Metaobject Definition

1. **Name**: `Contact Submission`
2. **Type**: `contact_submission`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Name | `name` | Single line text | Yes | Customer name |
| Email | `email` | Single line text | Yes | Customer email |
| Subject | `subject` | Single line text | Yes | Message subject |
| Message | `message` | Multi-line text | Yes | Message content |
| Status | `status` | Single line text (dropdown) | Yes | Select: "new", "read", "replied" |
| Created At | `created_at` | Date | Yes | Submission date |

**Note:** The `status` field uses the "Limit to preset choices" validation to create a dropdown with predefined options, ensuring data consistency and preventing typos.

### Step 3: Enable Storefront Access

**DO NOT** enable Storefront access for contact submissions. These should only be accessible via Admin API.

### Step 4: Enable Admin API

If not already configured (see Customer Reviews section):

1. Create/use existing custom app
2. Enable `write_metaobjects` and `read_metaobjects`
3. Add credentials to `.env` file

### Step 5: How It Works

- Form submissions are stored as metaobjects
- Merchants can view/manage submissions in **Content** → **Metaobjects** → **Contact Submission**
- Filter by status: new, read, replied
- No storefront access needed (submissions are private)

### Step 6: Managing Submissions

To view contact form submissions:

1. Go to **Content** → **Metaobjects** → **Contact Submission**
2. Click on any submission to view details
3. Update `status` field as you process:
   - `new` → `read` → `replied`
4. Use Shopify Flow or email service to send responses

**Tip:** Set up a Shopify Flow to get email notifications when new submissions arrive.

---

## Stock Alerts

Back-in-stock notification system stored as metaobjects. Customers can subscribe to alerts when out-of-stock products become available again.

### Step 1: Create the Metaobject Definition

1. **Name**: `Stock Alert`
2. **Type**: `stock_alert`

### Step 2: Add Fields

| Field Name | Key | Type | Required | Description |
|------------|-----|------|----------|-------------|
| Email | `email` | Single line text | Yes | Customer email |
| Product Title | `product_title` | Single line text | Yes | Product name |
| Product Handle | `product_handle` | Single line text | Yes | Product URL handle |
| Variant Title | `variant_title` | Single line text | No | Variant details (e.g., "Medium / Black") |
| Variant ID | `variant_id` | Single line text | No | Shopify variant ID |
| Status | `status` | Single line text (dropdown) | Yes | Select: "active", "notified", "expired" |
| Created At | `created_at` | Date | Yes | Subscription date |

**Note:** The `status` field uses the "Limit to preset choices" validation to create a dropdown with predefined options:
- `active` - Alert is active, waiting for restock
- `notified` - Customer has been notified of restock
- `expired` - Alert has expired or been cancelled

### Step 3: Enable Storefront Access

Toggle ON "Storefronts can read metaobject entries" in definition settings. This allows duplicate checking to prevent users from subscribing multiple times to the same product.

### Step 4: Enable Admin API

If not already configured (see Customer Reviews section):

1. Create/use existing custom app
2. Enable `write_metaobjects` and `read_metaobjects`
3. Add credentials to `.env` file

### Step 5: How It Works

- Customers can subscribe to stock alerts from product detail pages when variants are sold out
- System automatically checks for duplicate subscriptions
- Alerts are stored as metaobjects for merchant review
- Merchants can view/manage alerts in **Content** → **Metaobjects** → **Stock Alert**
- Filter by status to manage notifications

### Step 6: Managing Stock Alerts

To view and manage stock alert subscriptions:

1. Go to **Content** → **Metaobjects** → **Stock Alert**
2. View all active alerts sorted by date
3. When products are restocked:
   - Filter alerts by `product_handle` or `variant_id`
   - Send notification emails to subscribed customers
   - Update `status` field from `active` to `notified`
4. Set up Shopify Flow to automate notifications when inventory levels change

**Tip:** Integrate with email marketing tools (Klaviyo, Mailchimp) or use Shopify Flow to automatically notify customers when products are back in stock.

### Step 7: Automation (Optional)

Set up a Shopify Flow to automatically notify customers:

1. **Trigger**: Product variant inventory quantity changed
2. **Condition**: New quantity > 0 (back in stock)
3. **Action**: Query stock_alert metaobjects for matching variant_id
4. **Action**: Send email to customers with status = "active"
5. **Action**: Update metaobject status to "notified"

---

## Storefront API Access

**Critical:** All metaobjects must have Storefront API access enabled.

### Enable for Each Definition

1. Open each metaobject definition
2. Scroll to **Storefront access**
3. Toggle ON "Storefronts can read metaobject entries"
4. Save

### Verify Access

Test with GraphQL query:

```graphql
query TestMetaobjects {
  metaobjects(type: "homepage_hero", first: 1) {
    nodes {
      id
      handle
      fields {
        key
        value
      }
    }
  }
}
```

---

## Troubleshooting

### Section not appearing on homepage

1. **Check entries exist** in Content → Metaobjects
2. **Verify Storefront access** is enabled
3. **Confirm field names** match exactly (case-sensitive)

### Images not loading

1. Use **File** type, not URL
2. Keep images under 2MB
3. Use recommended dimensions

### Field name reference

| Metaobject | Required Fields |
|------------|-----------------|
| `homepage_hero` | `title`, `background_image` |
| `feature_banner` | `title`, `image` |
| `press_feature` | `name`, `logo_text` |
| `lookbook_item` | `title`, `image` |
| `lookbook_collection` | `title` |
| `split_hero` | `title`, `image`, `position` |
| `testimonial` | `name`, `rating`, `text` |
| `instagram_post` | `image` |
| `about_page` | `title` |
| `brand_value` | `title`, `description` |
| `store_location` | `name`, `address_line1`, `city`, `country` |
| `customer_review` | `product`, `rating`, `title`, `content`, `author_name`, `author_email`, `customer_id`, `verified`, `status`, `created_at` |
| `contact_submission` | `name`, `email`, `subject`, `message`, `status`, `created_at` |
| `stock_alert` | `email`, `product_title`, `product_handle`, `status`, `created_at` |

### Regenerate types after changes

```bash
cd web
yarn codegen
```

---

## Setup Checklist

Use this checklist when setting up a new store:

### Required Setup
- [ ] **Homepage Hero** - 1 entry with hero image
- [ ] **Feature Banner** - 1 entry with brand story
- [ ] **Collections** - At least 4 with images
- [ ] **About Page** - 1 entry with mission & story
- [ ] **Customer Review** - Definition created (no entries needed)
- [ ] **Contact Submission** - Definition created (no entries needed)
- [ ] **Stock Alert** - Definition created (no entries needed)
- [ ] **Admin API** - Custom app created with metaobject permissions
- [ ] **Storefront Access** - Enabled for all metaobjects

### Optional Content
- [ ] **Press Features** - 4-6 entries (optional)
- [ ] **Lookbook Items** - 3 entries (optional)
- [ ] **Lookbook Collections** - 2+ seasonal collections (optional)
- [ ] **Split Hero** - 2 entries: left + right (optional)
- [ ] **Testimonials** - 3-6 entries (optional)
- [ ] **Instagram Posts** - 6 entries (optional)
- [ ] **Brand Values** - 2-4 core values (optional)
- [ ] **Store Locations** - Physical store entries (optional)

---

## Admin API Configuration

### Required Environment Variables

Add these to your `.env` file:

```bash
# Shopify Store
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_token
PUBLIC_STOREFRONT_ID=your_storefront_id

# Admin API (for reviews, contact form, stock alerts)
ADMIN_API_ACCESS_TOKEN=your_admin_api_token
ADMIN_API_VERSION=2025-10

# Optional
PUBLIC_CHECKOUT_DOMAIN=your-store.myshopify.com
```

### Creating Admin API Credentials

1. **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **Develop apps** (if not visible, enable it in Settings → Apps and sales channels → Develop apps for your store)
3. Click **Create an app**
4. Name: "ada ÉLAN Starter Kit API"
5. Under **Configuration** → **Admin API integration**:
   - **Scopes needed:**
     - `write_metaobjects` - Create reviews and contact submissions
     - `read_metaobjects` - Read metaobject data
6. Click **Install app**
7. Under **API credentials**, reveal and copy:
   - **Admin API access token** → Add to `ADMIN_API_ACCESS_TOKEN`
   - **API version** → Add to `ADMIN_API_VERSION` (use 2025-10 or latest)

### Testing Admin API

Test your setup:

```bash
yarn dev
```

Try submitting:
1. A contact form at `/contact`
2. A product review on any product page (must be logged in)

Check submissions in **Shopify Admin** → **Content** → **Metaobjects**

---

*Last updated: December 11, 2025*
