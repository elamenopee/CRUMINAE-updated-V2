import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { DatetimeCustomEvent } from '@ionic/angular';

import {
  CRUMBS_PER_BLOCK,
  CartLine,
  GIFT_WRAP_FEE,
  GiftCard,
  Order,
  PESOS_PER_BLOCK,
  PESOS_PER_CRUMB,
} from '../../core/models';

import { CartService } from '../../core/cart.service';
import { LoyaltyService } from '../../core/loyalty.service';
import { OrderService } from '../../core/order.service';
import { ProfileService } from '../../core/profile.service';
import { UiService } from '../../core/ui.service';

type PaymentMethod =
  | 'cod'
  | 'pickup'
  | 'gcash'
  | 'bdo'
  | 'bpi'
  | 'gotyme';

type SpecialDiscount = 'none' | 'senior' | 'pwd';

interface Coupon {
  code: string;
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  minSpend: number;
  maxDiscount?: number;
  sukiOnly?: boolean;
}

const COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    minSpend: 200,
    maxDiscount: 100,
  },
  {
    code: 'SUKI10',
    type: 'percent',
    value: 10,
    minSpend: 300,
    maxDiscount: 100,
    sukiOnly: true,
  },
  {
    code: 'SUKI15',
    type: 'percent',
    value: 15,
    minSpend: 500,
    maxDiscount: 150,
    sukiOnly: true,
  },
  {
    code: 'FREESHIP',
    type: 'shipping',
    value: 0,
    minSpend: 500,
  },
  {
    code: 'COOKIE50',
    type: 'fixed',
    value: 50,
    minSpend: 500,
  },
];

const toISO = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

@Component({
  selector: 'app-checkout',
  templateUrl: 'checkout.page.html',
  styleUrls: ['checkout.page.scss'],
  standalone: false,
})
export class CheckoutPage {
  cart = inject(CartService);

  private loyalty = inject(LoyaltyService);
  private orders = inject(OrderService);
  private profileSvc = inject(ProfileService);
  private router = inject(Router);
  private ui = inject(UiService);

  draft = this.cart.draft;

  // FLOATING MODALS
  showCalendar = false;
  showTimePicker = false;
  showPaymentPicker = false;
  showGiftPicker = false;

  // Terms must be accepted for each order attempt. Accepting terms only
  // closes the modal; the customer must press Place Order again to submit.
  showTermsModal = false;
  termsAccepted = false;
  private termsConfirmedForNextAttempt = false;

  pendingTime = '';

  // PAYMENT
  paymentMethod: PaymentMethod = 'cod';

  // COUPONS
  couponInput = '';
  appliedCoupon: Coupon | null = null;
  couponMessage = '';

  // Suki eligibility requires backend verification.
  isSuki = false;

  // SENIOR / PWD
  specialDiscount: SpecialDiscount = 'none';

  scheduleError = '';
  giftWrapFee = GIFT_WRAP_FEE;

  cards: {
    id: GiftCard;
    emoji: string;
    label: string;
  }[] = [
    { id: 'birthday', emoji: '🎂', label: 'Birthday' },
    { id: 'thanks', emoji: '🙏', label: 'Thank you' },
    { id: 'love', emoji: '💌', label: 'Love' },
    { id: 'congrats', emoji: '🎉', label: 'Congrats' },
  ];

  address = this.profileSvc.profile.address;

  constructor() {
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(
        this.draft.delivery.slot || ''
      )
    ) {
      this.draft.delivery.slot = '';
    }

    this.onModeChange();
  }

  // CART
  get lines(): CartLine[] {
    return this.cart.lines;
  }

  get net(): number {
    return this.cart.totals(this.lines).net;
  }

  get boxSavings(): number {
    return this.cart.totals(this.lines).boxSavings;
  }

  get balance(): number {
    return this.loyalty.state.balance;
  }

  // DATE AND TIME
  get minDate(): string {
    return toISO(new Date());
  }

  get formattedDate(): string {
    const value = this.draft.delivery.date;

    if (!value) return '';

    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  get formattedTime(): string {
    const time = this.draft.delivery.slot;

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return '';
    }

    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
  }

  get timePickerValue(): string {
    const time =
      this.pendingTime ||
      this.draft.delivery.slot ||
      '12:00';

    const date = this.draft.delivery.date || this.minDate;

    return `${date}T${time}:00`;
  }

  get scheduleValid(): boolean {
    const date = this.draft.delivery.date;
    const time = this.draft.delivery.slot;

    if (!date || !time) return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return false;
    }

    const selected = new Date(`${date}T${time}:00`);

    if (Number.isNaN(selected.getTime())) {
      return false;
    }

    if (toISO(selected) !== date) {
      return false;
    }

    return selected.getTime() >= Date.now() + 60 * 60 * 1000;
  }

  openCalendar(): void {
    this.showCalendar = true;
  }

  onCalendarDateChange(event: DatetimeCustomEvent): void {
    const value = event.detail.value;

    if (typeof value !== 'string') return;

    this.draft.delivery.date = value.slice(0, 10);
    this.onScheduleChange();
    this.showCalendar = false;
  }

  openTimePicker(): void {
    this.pendingTime = this.draft.delivery.slot || '12:00';
    this.showTimePicker = true;
  }

  onTimePickerChange(event: DatetimeCustomEvent): void {
    const value = event.detail.value;

    if (typeof value !== 'string') return;

    const match = value.match(/T(\d{2}):(\d{2})/);

    if (match) {
      this.pendingTime = `${match[1]}:${match[2]}`;
    }
  }

  applyTime(): void {
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(this.pendingTime)
    ) {
      return;
    }

    this.draft.delivery.slot = this.pendingTime;
    this.onScheduleChange();
    this.showTimePicker = false;
  }

  onScheduleChange(): void {
    this.scheduleError = '';

    if (
      !this.draft.delivery.date ||
      !this.draft.delivery.slot
    ) {
      return;
    }

    if (!this.scheduleValid) {
      this.scheduleError =
        'Please choose a valid date and time at least one hour from now.';
    }
  }

  // PAYMENT
  // Cash is selected directly on the checkout page.
  // Only online methods open a floating modal.

  openOnlinePaymentPicker(): void {
    this.showPaymentPicker = true;
  }

  closePaymentPicker(): void {
    this.showPaymentPicker = false;
  }

  selectPayment(method: PaymentMethod): void {
    if (
      method === 'cod' &&
      this.draft.delivery.mode !== 'delivery'
    ) {
      return;
    }

    if (
      method === 'pickup' &&
      this.draft.delivery.mode !== 'pickup'
    ) {
      return;
    }

    this.paymentMethod = method;
    this.closePaymentPicker();
  }

  onModeChange(): void {
    if (this.draft.delivery.mode === 'pickup') {
      if (this.paymentMethod === 'cod') {
        this.paymentMethod = 'pickup';
      }
    } else if (this.paymentMethod === 'pickup') {
      this.paymentMethod = 'cod';
    }
  }

  get paymentLabel(): string {
    const labels: Record<PaymentMethod, string> = {
      cod: 'Cash on Delivery',
      pickup: 'Pay at Pickup',
      gcash: 'GCash',
      bdo: 'BDO Bank Transfer',
      bpi: 'BPI Bank Transfer',
      gotyme: 'GoTyme Bank Transfer',
    };

    return labels[this.paymentMethod];
  }

  get isOnlinePayment(): boolean {
    return (
      this.paymentMethod === 'gcash' ||
      this.paymentMethod === 'bdo' ||
      this.paymentMethod === 'bpi' ||
      this.paymentMethod === 'gotyme'
    );
  }

  // GIFT MODE
  openGiftPicker(): void {
    this.showGiftPicker = true;
  }

  saveGift(): void {
    if (
      this.draft.gift.enabled &&
      !this.draft.gift.message.trim()
    ) {
      this.ui.toast(
        'Please enter a gift message.',
        'danger',
        2000
      );
      return;
    }

    this.showGiftPicker = false;
  }

  // COUPONS
  applyCoupon(): void {
    const code = this.couponInput.trim().toUpperCase();

    const coupon = COUPONS.find(
      item => item.code === code
    );

    if (!coupon) {
      this.appliedCoupon = null;
      this.couponMessage = 'Invalid coupon code.';
      return;
    }

    if (coupon.sukiOnly && !this.isSuki) {
      this.appliedCoupon = null;
      this.couponMessage =
        'This coupon requires verified Suki eligibility.';
      return;
    }

    if (this.net < coupon.minSpend) {
      this.appliedCoupon = null;
      this.couponMessage =
        `Minimum spend is ₱${coupon.minSpend}.`;
      return;
    }

    if (
      coupon.type === 'shipping' &&
      this.draft.delivery.mode !== 'delivery'
    ) {
      this.appliedCoupon = null;
      this.couponMessage =
        'Free shipping coupons require delivery.';
      return;
    }

    this.appliedCoupon = coupon;
    this.couponMessage =
      `${coupon.code} applied to the preview.`;
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponInput = '';
    this.couponMessage = '';
  }

  get couponDiscount(): number {
    const coupon = this.appliedCoupon;

    if (!coupon || this.net < coupon.minSpend) {
      return 0;
    }

    if (coupon.sukiOnly && !this.isSuki) {
      return 0;
    }

    if (coupon.type === 'percent') {
      const discount = this.net * coupon.value / 100;

      return Math.min(
        discount,
        coupon.maxDiscount ?? discount
      );
    }

    if (coupon.type === 'fixed') {
      return Math.min(this.net, coupon.value);
    }

    return 0;
  }

  get shippingDiscount(): number {
    if (
      this.appliedCoupon?.type === 'shipping' &&
      this.net >= this.appliedCoupon.minSpend &&
      this.draft.delivery.mode === 'delivery'
    ) {
      return this.baseDeliveryFee;
    }

    return 0;
  }

  // SENIOR / PWD
  get requiresSpecialVerification(): boolean {
    return this.specialDiscount !== 'none';
  }

  // TOTALS
  get maxBlocks(): number {
    return Math.max(
      0,
      Math.min(
        Math.floor(this.balance / CRUMBS_PER_BLOCK),
        Math.floor(this.net / PESOS_PER_BLOCK)
      )
    );
  }

  get crumbDiscount(): number {
    return Math.min(
      this.net,
      this.draft.crumbBlocks * PESOS_PER_BLOCK
    );
  }

  get baseDeliveryFee(): number {
    return this.cart.deliveryFee(
      this.net,
      this.draft.delivery.mode
    );
  }

  get deliveryFee(): number {
    return Math.max(
      0,
      this.baseDeliveryFee - this.shippingDiscount
    );
  }

  get giftFee(): number {
    return this.draft.gift.enabled
      ? GIFT_WRAP_FEE
      : 0;
  }

  get total(): number {
    return Math.max(
      0,
      this.net
        - this.crumbDiscount
        - this.couponDiscount
        + this.deliveryFee
        + this.giftFee
    );
  }

  get crumbsEarned(): number {
    return Math.floor(
      Math.max(
        0,
        this.net
          - this.crumbDiscount
          - this.couponDiscount
      ) / PESOS_PER_CRUMB
    );
  }

  get pesosPerBlock(): number {
    return PESOS_PER_BLOCK;
  }

  get crumbsPerBlock(): number {
    return CRUMBS_PER_BLOCK;
  }

  blocks(delta: number): void {
    this.draft.crumbBlocks = Math.min(
      this.maxBlocks,
      Math.max(0, this.draft.crumbBlocks + delta)
    );
  }

  // TERMS & CONDITIONS
  onTermsModalDismiss(): void {
    this.showTermsModal = false;
  }

  declineTerms(): void {
    this.termsAccepted = false;
    this.termsConfirmedForNextAttempt = false;
    this.showTermsModal = false;
  }

  acceptTermsAndContinue(): void {
    if (!this.termsAccepted) return;

    // Do not place the order here. Let the customer review/finalize checkout.
    this.termsConfirmedForNextAttempt = true;
    this.showTermsModal = false;
  }

  // PLACE ORDER
  async place(): Promise<void> {
    if (!this.termsConfirmedForNextAttempt) {
      this.termsAccepted = false;
      this.showTermsModal = true;
      return;
    }

    // Consume consent for this attempt. The next order needs fresh consent.
    this.termsConfirmedForNextAttempt = false;
    const d = this.draft;

    if (!this.lines.length) return;

    if (!this.cart.readyForCheckout) {
      await this.ui.toast(
        'Some items are unavailable or awaiting prices.',
        'danger',
        2000
      );
      return;
    }

    if (
      d.delivery.mode === 'delivery' &&
      !this.address.trim()
    ) {
      await this.ui.toast(
        'Add a delivery address first.',
        'danger',
        2000
      );
      return;
    }

    if (!this.scheduleValid) {
      await this.ui.toast(
        'Choose a valid date and time at least one hour from now.',
        'danger',
        2000
      );
      return;
    }

    if (
      d.delivery.mode === 'pickup' &&
      this.paymentMethod === 'cod'
    ) {
      await this.ui.toast(
        'Please select Pay at Pickup.',
        'danger',
        2000
      );
      return;
    }

    if (
      d.delivery.mode === 'delivery' &&
      this.paymentMethod === 'pickup'
    ) {
      await this.ui.toast(
        'Pay at Pickup is only available for pickup orders.',
        'danger',
        2000
      );
      return;
    }

    if (d.gift.enabled && !d.gift.message.trim()) {
      await this.ui.toast(
        'Write a short gift message.',
        'danger',
        2000
      );
      return;
    }

    if (this.requiresSpecialVerification) {
      await this.ui.toast(
        'Senior/PWD discounts require verification before checkout.',
        'dark',
        3000
      );
      return;
    }

    if (this.isOnlinePayment) {
      await this.ui.toast(
        `${this.paymentLabel} is not connected to a payment gateway yet.`,
        'dark',
        3000
      );
      return;
    }

    // Coupon previews are not authorized for real redemption.
    // Requires backend validation and separate Order fields.
    if (this.appliedCoupon) {
      await this.ui.toast(
        'Coupon redemption is not active yet. Remove the coupon to place your order.',
        'dark',
        3000
      );
      return;
    }

    const order: Order = {
      id: this.orders.nextId(),
      placedAt: Date.now(),
      lines: JSON.parse(JSON.stringify(this.lines)),
      subtotal: this.net + this.boxSavings,
      boxSavings: this.boxSavings,
      crumbDiscount: this.crumbDiscount,
      deliveryFee: this.deliveryFee,
      giftFee: this.giftFee,
      total: this.total,
      crumbsEarned: this.crumbsEarned,
      crumbsUsed: d.crumbBlocks * CRUMBS_PER_BLOCK,
      gift: d.gift.enabled
        ? { ...d.gift }
        : undefined,
      delivery: { ...d.delivery },
      address:
        d.delivery.mode === 'delivery'
          ? this.address.trim()
          : 'Cruminae shop pickup',
    };

    this.orders.place(order);

    this.loyalty.redeem(
      order.crumbsUsed,
      `Redeemed on ${order.id}`
    );

    this.loyalty.earn(
      order.crumbsEarned,
      `Earned from ${order.id}`
    );

    this.cart.clear();
    this.cart.resetDraft();

    await this.ui.toast(
      `Order ${order.id} placed. +${order.crumbsEarned} crumbs`,
      'success',
      2200
    );

    await this.router.navigateByUrl('/pages/orders');
  }
}
