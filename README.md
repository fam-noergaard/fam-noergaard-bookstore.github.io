# fam-noergaard — Online Bookstore

A complete, responsive bookstore storefront demo built with HTML, CSS and vanilla JavaScript.

## Features

- 32 books across Fiction, Romance, Mystery & Thriller, Fantasy, Science Fiction, Classics, Business & Self Development, and Children's books.
- Search, category filtering, sorting, quick-view modal, ratings and badges.
- Persistent shopping bag using `localStorage`.
- Responsive desktop, tablet and mobile layout.
- Store branding and logo included in `assets/images/logo.png`.
- Book-advice and support sections with safe demo contact numbers.
- Remote book-cover imagery from Open Library's Covers service, identified by ISBN.
- Retail-reference prices in USD. Prices can change; verify them before a commercial launch.

## Demo contact placeholders

- Book Advice: +1 (202) 555-0147
- Customer Support: +1 (202) 555-0186
- Email: support@fam-noergaard.example

The 555-01xx numbers and `.example` email domain are intentionally non-live placeholders. Replace them with real business contact details before launch.

## Run locally

Because the catalog is loaded from `data/books.json`, use a simple local server instead of double-clicking `index.html`.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

1. Upload all files to your repository.
2. Open **Settings → Pages**.
3. Set **Deploy from a branch**.
4. Select your main branch and `/ (root)`.
5. Save and wait for GitHub Pages to publish the site.

## Important production notes

This is a front-end storefront demo. It does not process real payments or place real orders. Before production use, connect a real ecommerce backend/payment provider, add your verified business contact details, configure shipping/tax rules, and re-check current book pricing and image licensing requirements.
