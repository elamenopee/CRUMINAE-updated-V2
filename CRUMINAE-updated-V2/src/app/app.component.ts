
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CartService } from './core/cart.service';
import { LocalAuthService } from './core/local-auth';

interface MenuPage {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {

  private cart = inject(CartService);

  cartCount$ = this.cart.count$;

  // AUTHENTICATION
  auth = inject(LocalAuthService);

  private authRouter = inject(Router);

  logout(): void {
    this.auth.logout();

    this.authRouter.navigateByUrl('/login', {
      replaceUrl: true
    });
  }

  // MY PROFILE
  profilePage: MenuPage = {
    title: 'Profile',
    url: '/pages/profile',
    icon: 'person-circle-outline'
  };

  // MAIN MENU
  corePages: MenuPage[] = [
    {
      title: 'Dashboard',
      url: '/pages/dashboard',
      icon: 'grid-outline'
    },
    {
      title: 'List of Products',
      url: '/pages/products',
      icon: 'pricetags-outline'
    },
    {
      title: 'About the App',
      url: '/pages/about',
      icon: 'information-circle-outline'
    },
    {
      title: 'Developers',
      url: '/pages/developers',
      icon: 'people-outline'
    }
  ];

  // APP MODULES
  modulePages: MenuPage[] = [
    {
      title: 'Cookie Box Builder',
      url: '/pages/box-builder',
      icon: 'gift-outline'
    },
    {
      title: 'Taste Quiz',
      url: '/pages/quiz',
      icon: 'help-circle-outline'
    },
    {
      title: 'Shopping Cart',
      url: '/pages/cart',
      icon: 'cart-outline'
    },
    {
      title: 'Favorites',
      url: '/pages/favorites',
      icon: 'heart-outline'
    },
    {
      title: 'My Orders',
      url: '/pages/orders',
      icon: 'receipt-outline'
    },
    {
      title: 'Contact Us',
      url: '/pages/contact',
      icon: 'call-outline'
    }
  ];
}
