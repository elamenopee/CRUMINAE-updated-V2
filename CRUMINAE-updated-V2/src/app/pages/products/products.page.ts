
import { Component, inject } from '@angular/core';
import { Cookie } from '../../core/models';
import { ProductService } from '../../core/product.service';

@Component({
  selector: 'app-products',
  templateUrl: 'products.page.html',
  styleUrls: ['products.page.scss'],
  standalone: false,
})
export class ProductsPage {

  private readonly products = inject(ProductService);

  query = '';
  sort = 'all';

  get categories(): string[] {
    return this.products.categories;
  }

  // CUSTOM FILTER BOTTOM SHEET
  filterOpen = false;
  pendingSort = 'all';

  get selectedFilterLabel(): string {
    if (this.sort.startsWith('category:')) {
      return this.sort.slice('category:'.length);
    }

    switch (this.sort) {
      case 'priceAsc':
        return 'Price: low to high';

      case 'priceDesc':
        return 'Price: high to low';

      case 'fresh':
        return 'Freshest first';

      case 'name':
        return 'Name: A–Z';

      default:
        return 'All products';
    }
  }

  openFilter(): void {
    this.pendingSort = this.sort;
    this.filterOpen = true;
  }

  closeFilter(): void {
    this.filterOpen = false;
  }

  applyFilter(): void {
    this.sort = this.pendingSort;
    this.filterOpen = false;
  }

  // LIVE PRODUCT LIST FROM PRODUCT SERVICE
  get list(): Cookie[] {
    const search = this.query.trim().toLowerCase();

    const selectedCategory = this.sort.startsWith('category:')
      ? this.sort.slice('category:'.length)
      : '';

    const items = this.products.cookies.filter(cookie => {
      const matchesCategory =
        !selectedCategory ||
        cookie.category === selectedCategory;

      const matchesSearch =
        !search ||
        [
          cookie.name,
          cookie.description,
          cookie.category
        ].some(value =>
          value.toLowerCase().includes(search)
        );

      return matchesCategory && matchesSearch;
    });

    switch (this.sort) {

      case 'priceAsc':
        return items.sort((a, b) =>
          this.comparePrices(a, b, 1)
        );

      case 'priceDesc':
        return items.sort((a, b) =>
          this.comparePrices(a, b, -1)
        );

      case 'fresh':
        return items.sort((a, b) =>
          this.products.freshness(a).minutes -
          this.products.freshness(b).minutes
        );

      case 'name':
        return items.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      default:
        return items.sort((a, b) =>
          this.categories.indexOf(a.category) -
          this.categories.indexOf(b.category) ||
          a.name.localeCompare(b.name)
        );
    }
  }

  private comparePrices(
    a: Cookie,
    b: Cookie,
    direction: number
  ): number {

    if (a.price === null) {
      return b.price === null
        ? a.name.localeCompare(b.name)
        : 1;
    }

    if (b.price === null) {
      return -1;
    }

    return (a.price - b.price) * direction;
  }

  clear(): void {
    this.query = '';
    this.sort = 'all';
    this.pendingSort = 'all';
    this.filterOpen = false;
  }
}
