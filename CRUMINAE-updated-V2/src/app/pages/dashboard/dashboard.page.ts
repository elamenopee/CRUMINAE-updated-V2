
import {
  Component,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';

import { Router } from '@angular/router';

import { Cookie } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { LoyaltyService } from '../../core/loyalty.service';
import { ProfileService } from '../../core/profile.service';
import { OrderService } from '../../core/order.service';
import { CartService } from '../../core/cart.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {

  products = inject(ProductService);
  loyalty = inject(LoyaltyService);
  profile = inject(ProfileService);

  private orders = inject(OrderService);
  private cart = inject(CartService);
  private router = inject(Router);
  private ui = inject(UiService);

  state$ = this.loyalty.state$;

  // HERO SLIDESHOW

  heroSlides = [
    {
      image: 'assets/images/cruminae-slide-1.png',
      eyebrow: 'FRESHLY BAKED, MADE WITH LOVE',
      title: 'A little sweetness in every bite.',
      subtitle: 'Your next favorite cookie is waiting.',
      button: 'Explore cookies',
      link: '/pages/products'
    },
    {
      image: 'assets/images/cruminae-slide-2.png',
      eyebrow: 'THE CRUMINAE COLLECTION',
      title: 'Baked fresh, just for you.',
      subtitle: 'Discover cookies made for every craving.',
      button: 'Shop the collection',
      link: '/pages/products'
    },
    {
      image: 'assets/images/cruminae-slide-3.png',
      eyebrow: 'SWEET MOMENTS, BEAUTIFULLY BOXED',
      title: 'Share a box of happiness.',
      subtitle: 'A thoughtful treat for someone special.',
      button: 'Build a box',
      link: '/pages/box-builder'
    }
  ];

  activeHeroSlide = 0;

  private heroTimer?: ReturnType<typeof setInterval>;
  private touchStartX = 0;

  ngOnInit(): void {
    this.startHeroSlideshow();
  }

  ngOnDestroy(): void {
    this.stopHeroSlideshow();
  }

  private startHeroSlideshow(): void {
    this.stopHeroSlideshow();

    this.heroTimer = setInterval(() => {
      this.activeHeroSlide =
        (this.activeHeroSlide + 1) % this.heroSlides.length;
    }, 4000);
  }

  private stopHeroSlideshow(): void {
    if (this.heroTimer !== undefined) {
      clearInterval(this.heroTimer);
      this.heroTimer = undefined;
    }
  }

  goToHeroSlide(index: number): void {
    this.activeHeroSlide = index;
    this.startHeroSlideshow();
  }

  onHeroTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onHeroTouchEnd(event: TouchEvent): void {
    const distance =
      event.changedTouches[0].screenX - this.touchStartX;

    if (Math.abs(distance) < 45) {
      return;
    }

    const direction = distance < 0 ? 1 : -1;

    const next =
      (this.activeHeroSlide + direction + this.heroSlides.length)
      % this.heroSlides.length;

    this.goToHeroSlide(next);
  }

  // EXISTING DASHBOARD FUNCTIONS

  get greeting(): string {
    const h = new Date().getHours();

    return h < 12
      ? 'Good morning'
      : h < 18
        ? 'Good afternoon'
        : 'Good evening';
  }

  get firstName(): string {
    return (
      this.profile.profile.name.trim().split(' ')[0] ||
      'cookie lover'
    );
  }

  get freshBatch(): Cookie[] {
    return [...this.products.cookies]
      .sort(
        (a, b) =>
          this.products.freshness(a).minutes -
          this.products.freshness(b).minutes
      )
      .slice(0, 6);
  }

  get usual(): Cookie | undefined {
    const top = this.orders.cravings()[0];

    return top
      ? this.products.byId(top.cookieId)
      : undefined;
  }

  get cookieOfTheDay(): Cookie {
    return this.products.cookieOfTheDay();
  }

  reorderUsual(c: Cookie): void {
    if (!this.cart.addCookie(c.id)) {
      return;
    }

    this.ui.toast(`${c.name} added to cart`);
  }

  startGift(): void {
    this.cart.startGift();
    this.router.navigateByUrl('/pages/box-builder');
  }
}
