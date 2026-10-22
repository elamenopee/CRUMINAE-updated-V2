
import { Component, inject } from '@angular/core';

import {
  ALLERGENS,
  Allergen,
  Cookie,
  TASTE_TAGS,
  TasteTag
} from '../../core/models';

import { CartService } from '../../core/cart.service';
import { ProductService } from '../../core/product.service';
import { UiService } from '../../core/ui.service';

interface Option {
  label: string;
  emoji: string;
  tags: TasteTag[];
}

interface Question {
  q: string;
  options: Option[];
}

const PERSONAS: Record<
  TasteTag,
  { name: string; blurb: string }
> = {
  chocolatey: {
    name: 'The Chocoholic',
    blurb: 'Rich, deep, and a little dramatic. Cocoa is your love language.'
  },
  fruity: {
    name: 'The Sunshine Seeker',
    blurb: 'You like it bright and tropical, with a sweet surprise inside.'
  },
  nutty: {
    name: 'The Toasty Soul',
    blurb: 'You want something savory-sweet with real bite and crunch.'
  },
  classic: {
    name: 'The Comfort Classic',
    blurb: 'Warm, buttery, and familiar. You know what you like.'
  },
  zesty: {
    name: 'The Zest Chaser',
    blurb: 'Bright, tangy, and a bit adventurous. You like a wake-up call.'
  }
};

@Component({
  selector: 'app-quiz',
  templateUrl: 'quiz.page.html',
  standalone: false
})
export class QuizPage {

  private products = inject(ProductService);
  private cart = inject(CartService);
  private ui = inject(UiService);

  questions: Question[] = [
    {
      q: 'Your ideal afternoon?',
      options: [
        {
          label: 'Rainy day under a blanket',
          emoji: '🌧️',
          tags: ['chocolatey', 'classic']
        },
        {
          label: 'Beach with a cold drink',
          emoji: '🏖️',
          tags: ['fruity', 'zesty']
        },
        {
          label: 'Café with a good book',
          emoji: '📖',
          tags: ['nutty', 'classic']
        },
        {
          label: 'Spontaneous road trip',
          emoji: '🚗',
          tags: ['zesty', 'nutty']
        }
      ]
    },
    {
      q: 'Pick a dessert you would never turn down.',
      options: [
        {
          label: 'Fudgy brownie',
          emoji: '🍫',
          tags: ['chocolatey']
        },
        {
          label: 'Halo-halo',
          emoji: '🍧',
          tags: ['fruity']
        },
        {
          label: 'Turon or peanut brittle',
          emoji: '🥜',
          tags: ['nutty']
        },
        {
          label: 'Lemon bar',
          emoji: '🍋',
          tags: ['zesty']
        }
      ]
    },
    {
      q: 'How do you like your cookie?',
      options: [
        {
          label: 'Soft and gooey',
          emoji: '🫠',
          tags: ['chocolatey', 'classic']
        },
        {
          label: 'Crisp and crunchy',
          emoji: '🥨',
          tags: ['nutty', 'zesty']
        },
        {
          label: 'Chewy with a surprise filling',
          emoji: '💜',
          tags: ['fruity', 'chocolatey']
        }
      ]
    },
    {
      q: 'What are you drinking with it?',
      options: [
        {
          label: 'Hot coffee',
          emoji: '☕',
          tags: ['classic', 'nutty']
        },
        {
          label: 'Cold milk',
          emoji: '🥛',
          tags: ['chocolatey', 'classic']
        },
        {
          label: 'Iced tea',
          emoji: '🧋',
          tags: ['fruity', 'zesty']
        }
      ]
    }
  ];

  allergens = ALLERGENS;

  stage: 'quiz' | 'allergy' | 'result' = 'quiz';

  step = 0;

  scores = this.emptyScores();

  avoid = new Set<Allergen>();

  results: Cookie[] = [];

  // Whether recommendations passed the allergen filter
  verifiedMatches = true;

  persona = PERSONAS.classic;

  get question(): Question {
    return this.questions[this.step];
  }

  answer(o: Option): void {
    o.tags.forEach(t => {
      this.scores[t]++;
    });

    this.step++;

    if (this.step >= this.questions.length) {
      this.stage = 'allergy';
    }
  }

  toggle(a: Allergen): void {
    if (this.avoid.has(a)) {
      this.avoid.delete(a);
    } else {
      this.avoid.add(a);
    }
  }

  finish(): void {

    // Determine cookie personality
    const top = [...TASTE_TAGS].sort(
      (a, b) => this.scores[b] - this.scores[a]
    )[0];

    this.persona = PERSONAS[top];

    // Score cookies based on quiz answers
    const score = (c: Cookie): number => {
      return c.tags.reduce(
        (total, tag) => total + this.scores[tag],
        0
      );
    };

    // Rank all products by personality compatibility
    const rankedCookies = [...this.products.cookies].sort(
      (a, b) =>
        score(b) - score(a) ||
        this.products.freshness(a).minutes -
        this.products.freshness(b).minutes
    );

    // No allergen restrictions: recommend top cookies
    if (this.avoid.size === 0) {
      this.results = rankedCookies.slice(0, 3);
      this.verifiedMatches = true;
    } else {

      // First attempt: verified allergen-safe matches
      const safeMatches = rankedCookies.filter(
        c => this.products.matchesAllergens(c, this.avoid)
      );

      if (safeMatches.length > 0) {
        this.results = safeMatches.slice(0, 3);
        this.verifiedMatches = true;
      } else {

        // Fallback: personality matches only
        // These are NOT verified safe for selected allergens
        this.results = rankedCookies.slice(0, 3);
        this.verifiedMatches = false;
      }
    }

    this.stage = 'result';
  }

  add(c: Cookie): void {
    if (!this.canAddRecommended) {
      this.ui.toast(
        'Please verify ingredient safety before ordering.'
      );
      return;
    }

    if (!this.cart.addCookie(c.id)) {
      return;
    }

    this.ui.toast(`${c.name} added to cart`);
  }

  addAll(): void {
    if (!this.canAddAll) {
      return;
    }

    this.results.forEach(c => {
      this.cart.addCookie(c.id);
    });

    this.ui.toast(
      `Your ${this.results.length} matches are in the cart`
    );
  }

  get canAddRecommended(): boolean {
    return this.verifiedMatches;
  }

  get canAddAll(): boolean {
    return (
      this.verifiedMatches &&
      this.results.length > 0 &&
      this.results.every(
        c => this.products.canPurchase(c)
      )
    );
  }

  retake(): void {
    this.stage = 'quiz';
    this.step = 0;
    this.scores = this.emptyScores();
    this.avoid.clear();
    this.results = [];
    this.verifiedMatches = true;
    this.persona = PERSONAS.classic;
  }

  private emptyScores(): Record<TasteTag, number> {
    return {
      chocolatey: 0,
      fruity: 0,
      nutty: 0,
      classic: 0,
      zesty: 0
    };
  }
}
