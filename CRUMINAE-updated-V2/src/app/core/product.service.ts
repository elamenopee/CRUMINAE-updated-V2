
import { Injectable, NgZone, inject } from '@angular/core';
import { Allergen, Cookie, TasteTag } from './models';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface Freshness {
  minutes: number;
  label: string;
  level: 'hot' | 'today' | 'older';
}

export const PRODUCT_CATEGORIES: string[] = [
  'Flavor & Sweetness Profiles',
  'Bite-Size & Snackable Treats',
  'Crumbly & Delicate Textures',
  'Classic Cookies & Playful Variations',
  'Biscuits & Baked Crunch',
  'Soft Dough & Base Pastries'
];

// Original cookie data.
// Each row contains:
// ID, name, description, category index,
// price, ingredients, taste tags, bake hour.

type CookieRecord = [
  string,
  string,
  string,
  number,
  number,
  string,
  TasteTag[],
  number
];

const COOKIE_RECORDS: CookieRecord[] = [
  [
    'doucelle',
    'Doucelle',
    'Sweet Cream Butter Biscuit',
    0,
    110,
    'Cultured butter, heavy cream, powdered sugar, flour, cornstarch, vanilla, flaky sea salt.',
    ['classic'],
    7
  ],
  [
    'doucette',
    'Doucette',
    'Powdered Chamomile Honey',
    0,
    130,
    'Chamomile tea, honey, butter, powdered sugar, flour, cornstarch, vanilla, salt.',
    ['classic'],
    11
  ],
  [
    'douceria',
    'Douceria',
    'Dulce de Leche Caramel',
    0,
    150,
    'Dulce de leche, butter, sugars, egg, flour, baking soda, cornstarch, salt, caramel.',
    ['classic'],
    15
  ],
  [
    'doucelia',
    'Doucelia',
    'White Chocolate Almond Silk',
    0,
    150,
    'White chocolate chips, almond flour, sliced almonds, butter, sugars, egg, almond extract, flour, baking soda, salt.',
    ['chocolatey', 'nutty'],
    7
  ],
  [
    'doucelette',
    'Doucelette',
    'Milk-Glazed Sugar Cookie',
    0,
    130,
    'Butter, sugar, eggs, flour, baking powder, milk, powdered sugar, vanilla, salt.',
    ['classic'],
    11
  ],
  [
    'doucea',
    'Doucea',
    'Vanilla Bean Sugar Cookie',
    0,
    120,
    'Butter, sugar, egg, egg yolk, vanilla bean, flour, baking powder, salt, sanding sugar.',
    ['classic'],
    15
  ],
  [
    'doucemiel',
    'Doucemiel',
    'Honey Lavender Shortbread',
    0,
    120,
    ' Butter, powdered sugar, raw honey, dried lavender, flour, cornstarch, vanilla, salt.',
    ['classic'],
    7
  ],
  [
    'chocovia',
    'Chocovia',
    'Dark Chocolate Fudge & Cocoa Swirl',
    0,
    140,
    'Dark chocolate, cocoa powder, butter, sugars, eggs, flour, espresso, baking soda, salt, chocolate fudge swirl.',
    ['chocolatey'],
    11
  ],
  [
    'munche',
    'Munché',
    'Salted Caramel Pretzel Crunch',
    1,
    160,
    'Pretzels, caramel bits, brown sugar, sugar, butter, egg, flour, baking soda, sea salt.',
    ['classic'],
    15
  ],
  [
    'bitezy',
    'Bitezy',
    'Birthday Cake Sprinkle Bite',
    1,
    140,
    'Butter, sugar, egg, flour, yellow cake mix, sprinkles, white chocolate chips, vanilla, baking powder, salt.',
    ['classic'],
    7
  ],
  [
    'bitella',
    'Bitélla',
    'Hazelnut Nutella Mini Crisp',
    1,
    160,
    'Nutella, hazelnuts, butter, brown sugar, flour, egg, cocoa powder, salt.',
    ['chocolatey', 'nutty'],
    11
  ],
  [
    'crumie',
    'Crumie',
    'Powdered Sugar Snowball',
    2,
    130,
    'Butter, powdered sugar, pecans, flour, vanilla, salt.',
    ['classic'],
    15
  ],
  [
    'crumina',
    'Crumina',
    'Spiced Oatmeal Crumb',
    2,
    110,
    'Rolled oats, whole wheat flour, brown sugar, butter, spices, baking soda, salt, streusel.',
    ['classic'],
    7
  ],
  [
    'crumiette',
    'Crumiette',
    'Raspberry Linzer Almond',
    2,
    140,
    'Almond meal, raspberry jam, butter, sugar, egg yolk, cinnamon, flour, powdered sugar, salt.',
    ['fruity', 'nutty'],
    11
  ],
  [
    'crumbelle',
    'Crumbelle',
    'Lemon Zest Shortbread',
    2,
    120,
    'Lemon zest, lemon juice, butter, powdered sugar, flour, cornstarch, vanilla, salt.',
    ['zesty'],
    15
  ],
  [
    'crumella',
    'Crumella',
    'Cinnamon Streusel Sandie',
    2,
    120,
    ' Butter, powdered sugar, brown sugar, cinnamon, nutmeg, flour, pecans, vanilla, salt.',
    ['classic'],
    7
  ],
  [
    'cookiva',
    'Cookiva',
    'Classic Cookies & Playful Variations collection.',
    3,
    120,
    'Butter, sugar, egg, almond extract, vanilla, flour, baking powder, sprinkles, salt.',
    ['classic'],
    11
  ],
  [
    'kookie',
    'Kookié',
    'Classic Cookies & Playful Variations collection.',
    3,
    150,
    'Peanut butter, peanut butter cups, sugar, butter, egg, flour, baking soda, salt.',
    ['classic'],
    15
  ],
  [
    'kookette',
    'Kookette',
    'Classic Cookies & Playful Variations collection.',
    3,
    130,
    'Butter, sugar, egg, cream of tartar, baking soda, flour, cinnamon, vanilla, salt.',
    ['classic'],
    7
  ],
  [
    'cookieva',
    'Cookieva',
    'Classic Cookies & Playful Variations collection.',
    3,
    120,
    'Butter, sour cream, sugar, egg, flour, baking powder, baking soda, vanilla buttercream, sprinkles.',
    ['classic'],
    11
  ],
  [
    'cookina',
    'Cookina',
    'Classic Cookies & Playful Variations collection.',
    3,
    110,
    'Rolled oats, raisins, butter, sugars, egg, cinnamon, flour, baking soda, vanilla, salt.',
    ['classic'],
    15
  ],
  [
    'cookelle',
    'Cookelle',
    'Classic Cookies & Playful Variations collection.',
    3,
    100,
    'Browned butter, chocolate chunks, chocolate chips, sugars, egg, egg yolk, flour, baking soda, espresso, sea salt.',
    ['classic'],
    7
  ],
  [
    'biskie',
    'Biskie',
    'Biscuits & Baked Crunch collection.',
    4,
    120,
    'Maple syrup, honey, butter, brown sugar, flour, baking powder, salt.',
    ['classic'],
    11
  ],
  [
    'biscou',
    'Biscou',
    'Biscuits & Baked Crunch collection.',
    4,
    110,
    'Cultured butter, caster sugar, flour, rice flour, vanilla bean.',
    ['classic'],
    15
  ],
  [
    'biscova',
    'Biscova',
    'Biscuits & Baked Crunch collection.',
    4,
    120,
    'Chai spice mix, butter, brown sugar, flour, milk, salt.',
    ['classic'],
    7
  ],
  [
    'biscottie',
    'Biscottie',
    'Mini Espresso Biscotti',
    4,
    110,
    'Ground espresso, dark chocolate chips, butter, sugar, eggs, flour, baking powder, salt.',
    ['classic'],
    11
  ],
  [
    'biscelle',
    'Biscelle',
    'Biscuits & Baked Crunch collection.',
    4,
    130,
    'Butter, sugar, egg yolk, flour, sliced almonds, almond extract, salt.',
    ['classic'],
    15
  ],
  [
    'doughsie',
    'Doughsie',
    'Soft-Baked Chewy Molasses',
    5,
    120,
    'Molasses, ginger, cinnamon, cloves, butter, brown sugar, egg, flour, baking soda, turbinado sugar.',
    ['classic'],
    7
  ],
  [
    'doughe',
    'Doughé',
    'Earl Grey Butter Cookie',
    5,
    130,
    'Earl Grey tea, butter, powdered sugar, egg yolk, cake flour, cornstarch, vanilla, salt.',
    ['classic'],
    11
  ],
  [
    'doughli',
    'Doughli',
    'Cookie Dough Chunk Bites',
    5,
    160,
    'Heat-treated flour, dark chocolate chips, mini chocolate chips, sugars, butter, milk, vanilla, salt.',
    ['classic'],
    15
  ]
];

// Convert original data into Cookie objects.
export const COOKIES: Cookie[] = COOKIE_RECORDS.map(
  ([
    id,
    name,
    description,
    categoryIndex,
    price,
    ingredients,
    tags,
    bakeHour
  ]) => ({
    id,
    name,
    description,
    category: PRODUCT_CATEGORIES[categoryIndex],
    image: `assets/products/${id}.webp`,
    price,
    ingredients: [ingredients],
    emoji: '🍪',
    color: '#C98B4D',
    allergens: [],
    allergensVerified: false,
    tags,
    bakeHour
  })
);

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly zone = inject(NgZone);

  // Keep the original array reference stable.
  readonly cookies: Cookie[] = [...COOKIES];

  readonly categories = PRODUCT_CATEGORIES;

  // Firebase status used by products.page.ts.
  readonly catalogLoading = { value: true };
  readonly catalogError = { value: '' };

  constructor() {
    this.listenToProducts();
  }

  private listenToProducts(): void {

    onSnapshot(
      collection(db, 'products'),

      snapshot => {

        // Start with the original 30 cookies.
        // This prevents a partial Firestore import
        // from removing the existing catalog.
        const productMap = new Map<string, Cookie>();

        COOKIES.forEach(cookie => {
          productMap.set(cookie.id, { ...cookie });
        });

        snapshot.docs.forEach(document => {

          const data = document.data();

          const slug = String(
            data['slug'] ?? ''
          ).trim().toLowerCase();

          const name = String(
            data['name'] ?? ''
          ).trim();

          // Match by slug or original product name.
          // Numeric Admin IDs are NOT used to identify
          // the original Customer cookies.
          const original = COOKIES.find(cookie =>
            (slug !== '' && cookie.id === slug) ||
            cookie.name.toLowerCase() ===
              name.toLowerCase()
          );

          const id = original?.id ||
            slug ||
            `admin-${document.id}`;

          const rawCategory = String(
            data['category'] ??
            original?.category ??
            PRODUCT_CATEGORIES[0]
          );

          const category =
            rawCategory === 'Bite-Sized & Snackable Treats'
              ? 'Bite-Size & Snackable Treats'
              : rawCategory;

          const rawImage = String(
            data['image'] ?? ''
          ).trim();

          let image = original?.image ?? '';

          if (rawImage.startsWith('https://') ||
              rawImage.startsWith('http://')) {

            image = rawImage;

          } else if (rawImage) {

            const filename =
              rawImage.split('/').pop() || '';

            image = `assets/products/${filename}`;
          }

          const rawPrice = data['price'];

          const parsedPrice =
            rawPrice === null ||
            rawPrice === undefined ||
            rawPrice === ''
              ? null
              : Number(rawPrice);

          const price =
            parsedPrice !== null &&
            Number.isFinite(parsedPrice)
              ? parsedPrice
              : null;

          const cookie: Cookie = {
            id,
            name: name || original?.name || 'New Cookie',

            description: String(
              data['description'] ??
              original?.description ??
              ''
            ),

            price,
            image,
            category,

            // Preserve original Customer App metadata.
            ingredients: original?.ingredients ?? [],
            allergensVerified:
              original?.allergensVerified ?? false,
            emoji: original?.emoji ?? '🍪',
            color: original?.color ?? '#C98B4D',
            allergens: original?.allergens ?? [],
            tags: original?.tags ?? [],
            bakeHour: original?.bakeHour ?? 7
          };

          productMap.set(id, cookie);
        });

        this.zone.run(() => {

          // Update the existing array in place.
          // Other pages still reference this array.
          this.cookies.splice(
            0,
            this.cookies.length,
            ...Array.from(productMap.values())
          );

          // Include categories introduced by Admin.
          for (const cookie of this.cookies) {
            if (
              cookie.category &&
              !this.categories.includes(cookie.category)
            ) {
              this.categories.push(cookie.category);
            }
          }

          this.catalogLoading.value = false;
          this.catalogError.value = '';
        });

      },

      error => {

        console.error(
          'Firebase product loading error:',
          error
        );

        this.zone.run(() => {

          // Preserve local products if Firebase fails.
          this.catalogLoading.value = false;

          this.catalogError.value =
            'Unable to load products from Firebase.';
        });
      }
    );
  }

  // PURCHASE VALIDATION
  canPurchase(
    cookie: Cookie | undefined
  ): boolean {

    return !!cookie &&
      cookie.price !== null &&
      Number.isFinite(cookie.price) &&
      cookie.price > 0;
  }

  // ALLERGEN FILTERING
  matchesAllergens(
    cookie: Cookie,
    avoid: Set<Allergen>
  ): boolean {

    return !avoid.size ||
      (
        cookie.allergensVerified &&
        !cookie.allergens.some(
          allergen => avoid.has(allergen)
        )
      );
  }

  // FIND COOKIE BY ID
  byId(id: string): Cookie | undefined {

    return this.cookies.find(
      cookie => cookie.id === id
    );
  }

  // COOKIE FRESHNESS
  freshness(
    cookie: Cookie,
    now = new Date()
  ): Freshness {

    const last = new Date(now);

    last.setHours(
      cookie.bakeHour,
      0,
      0,
      0
    );

    if (last > now) {
      last.setDate(
        last.getDate() - 1
      );
    }

    const minutes = Math.floor(
      (now.getTime() - last.getTime()) / 60000
    );

    const isToday =
      last.toDateString() ===
      now.toDateString();

    if (!isToday) {
      return {
        minutes,
        label: 'Baked yesterday',
        level: 'older'
      };
    }

    if (minutes < 90) {
      return {
        minutes,
        label: minutes < 60
          ? `Fresh out of the oven · ${minutes}m`
          : 'Fresh out of the oven',
        level: 'hot'
      };
    }

    return {
      minutes,
      label:
        `Baked ${Math.floor(minutes / 60)}h ago`,
      level: 'today'
    };
  }

  // COOKIE OF THE DAY
  cookieOfTheDay(): Cookie {

    const day = Math.floor(
      Date.now() / 86400000
    );

    return this.cookies.length
      ? this.cookies[day % this.cookies.length]
      : COOKIES[day % COOKIES.length];
  }
}
