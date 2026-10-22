# Cruminae (Ionic + Angular)

Complete project, ready to run.

## Run it
Requires Node.js 20.19+ or 22.12+ (https://nodejs.org, LTS).

```bash
npm install
npm start
```
Then open http://localhost:4200 (use the browser's phone view with F12).

On Windows PowerShell, if npm is blocked:
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Notes
- Replace `src/assets/icon/CruminaeLogo.png` with your real logo.
- Data (cart, favorites, orders, crumbs, profile) is saved in the browser's localStorage. "Reset demo data" is on the Profile page.
- New installs start with an empty order history. Existing saved orders are preserved; discontinued items cannot be reordered.
- Placeholders to edit: developer names (`pages/developers`), contact info (`pages/contact`).

## Product catalogue

The catalogue contains the 30 distinct products from the supplied [Drive folder](https://drive.google.com/drive/folders/1ro0teBwWgEBejSNxQ0EtZjDOVURiEsAr), grouped into six categories. Doucelle and Cookiva use the updated images. Optimized WebP photos are bundled in `src/assets/products`, so the app does not require Drive access.

Edit product details in `src/app/core/product.service.ts`. Prices are `null` until the owner supplies the selling prices. Cards show "Price coming soon" and purchasing, box selection, reorders, and checkout reject unpriced or discontinued products. Set a product's `price` to its positive peso amount to enable purchasing.

Flavors use the source filenames and previously supplied product planning labels where available. Products without supplied flavor details display their collection name. Allergen information is unconfirmed: add verified allergens and set `allergensVerified` to `true` only after checking the recipe. Products with unconfirmed ingredients are excluded whenever an allergen filter is active, including quiz results. The existing freshness feature still uses a demo daily bake schedule.
