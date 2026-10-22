
import { NgModule } from '@angular/core';
import {
  PreloadAllModules,
  RouterModule,
  Routes
} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },

  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/splash/splash')
        .then(m => m.Splash)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.Login)
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup')
        .then(m => m.Signup)
  },

  {
    path: 'pages/dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module')
        .then(m => m.DashboardPageModule)
  },

  {
    path: 'pages/products',
    loadChildren: () =>
      import('./pages/products/products.module')
        .then(m => m.ProductsPageModule)
  },

  {
    path: 'pages/about',
    loadChildren: () =>
      import('./pages/about/about.module')
        .then(m => m.AboutPageModule)
  },

  {
    path: 'pages/developers',
    loadChildren: () =>
      import('./pages/developers/developers.module')
        .then(m => m.DevelopersPageModule)
  },

  {
    path: 'pages/cart',
    loadChildren: () =>
      import('./pages/cart/cart.module')
        .then(m => m.CartPageModule)
  },

  {
    path: 'pages/checkout',
    loadChildren: () =>
      import('./pages/checkout/checkout.module')
        .then(m => m.CheckoutPageModule)
  },

  {
    path: 'pages/favorites',
    loadChildren: () =>
      import('./pages/favorites/favorites.module')
        .then(m => m.FavoritesPageModule)
  },

  {
    path: 'pages/orders',
    loadChildren: () =>
      import('./pages/orders/orders.module')
        .then(m => m.OrdersPageModule)
  },

  {
    path: 'pages/profile',
    loadChildren: () =>
      import('./pages/profile/profile.module')
        .then(m => m.ProfilePageModule)
  },

  {
    path: 'pages/contact',
    loadChildren: () =>
      import('./pages/contact/contact.module')
        .then(m => m.ContactPageModule)
  },

  {
    path: 'pages/box-builder',
    loadChildren: () =>
      import('./pages/box-builder/box-builder.module')
        .then(m => m.BoxBuilderPageModule)
  },

  {
    path: 'pages/quiz',
    loadChildren: () =>
      import('./pages/quiz/quiz.module')
        .then(m => m.QuizPageModule)
  },

  ...[
    'dashboard',
    'products',
    'about',
    'developers',
    'cart',
    'checkout',
    'favorites',
    'orders',
    'profile',
    'contact',
    'box-builder',
    'quiz'
  ].map(page => ({
    path: page,
    redirectTo: `pages/${page}`,
    pathMatch: 'full' as const
  })),

  {
    path: '**',
    redirectTo: 'pages/dashboard'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      bindToComponentInputs: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
