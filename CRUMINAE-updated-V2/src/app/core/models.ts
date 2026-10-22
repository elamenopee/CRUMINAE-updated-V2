export type Allergen = 'nuts' | 'gluten' | 'dairy' | 'eggs' | 'soy';
export type TasteTag = 'chocolatey' | 'fruity' | 'nutty' | 'classic' | 'zesty';
export const ALLERGENS: Allergen[] = ['nuts', 'gluten', 'dairy', 'eggs', 'soy'];
export const TASTE_TAGS: TasteTag[] = ['chocolatey', 'fruity', 'nutty', 'classic', 'zesty'];

export interface Cookie {
  id: string;
  name: string;
  description: string;
  /** null until the product's selling price is supplied. */
  ingredients?: string[];
  price: number | null;
  image: string;
  category: string;
  /** Empty allergens must not be interpreted as allergen-free unless verified. */
  allergensVerified: boolean;
  emoji: string;
  color: string;
  allergens: Allergen[];
  tags: TasteTag[];
  /** Hour of day (0-23) when this flavor's batch comes out of the oven. */
  bakeHour: number;
}

export interface CookieLine { kind: 'cookie'; cookieId: string; qty: number; }
export interface BoxLine { kind: 'box'; id: string; size: number; picks: Record<string, number>; qty: number; }
export type CartLine = CookieLine | BoxLine;

export type GiftCard = 'birthday' | 'thanks' | 'love' | 'congrats';
export interface GiftInfo { enabled: boolean; to: string; from: string; message: string; card: GiftCard; }
export interface DeliveryInfo { mode: 'delivery' | 'pickup'; date: string; slot: string; }
export interface CheckoutDraft { gift: GiftInfo; delivery: DeliveryInfo; crumbBlocks: number; }

export interface Order {
  id: string;
  placedAt: number;
  /** Optional for historical orders; required by checkout for all new orders. */
  contact?: { name: string; phone: string; };
  lines: CartLine[];
  subtotal: number;
  boxSavings: number;
  crumbDiscount: number;
  deliveryFee: number;
  giftFee: number;
  total: number;
  crumbsEarned: number;
  crumbsUsed: number;
  gift?: GiftInfo;
  delivery: DeliveryInfo;
  address: string;
}

export interface Profile { name: string; email: string; phone: string; address: string; avoid: Allergen[]; }

export const BOX_SIZES = [
  { size: 6, discount: 0.05 },
  { size: 12, discount: 0.10 },
  { size: 24, discount: 0.15 },
];

export const GIFT_WRAP_FEE = 30;
export const DELIVERY_FEE = 60;
export const FREE_DELIVERY_OVER = 500;
/** 1 crumb per ₱10 spent. 100 crumbs = ₱50 off. */
export const PESOS_PER_CRUMB = 10;
export const CRUMBS_PER_BLOCK = 100;
export const PESOS_PER_BLOCK = 50;
