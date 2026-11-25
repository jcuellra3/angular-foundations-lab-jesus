import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { ProductCatalogStore } from "./state/product-catalog.store";
import { ProductList } from "./ui/product-list";

@Component({
  selector: "app-product-catalog-page",
  imports: [ProductList],
  template: `
    <div class="catalog">
      <button class="button" type="button" (click)="load()">
        Cargar catálogo
      </button>
      <p>{{ store.message() }}</p>
      <app-product-list
        [products]="store.sortedProducts()"
        (selectProduct)="onSelectProduct($event)"
      />
    </div>
  `,
  styles: `
    .catalog {
      display: grid;
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCatalogPage {
  readonly store = inject(ProductCatalogStore);

  load(): void {
    //La página inicia acciones del store, pero no conoce HTTP ni localStorage.
    void this.store.load();
  }

  onSelectProduct(productId: string): void {
    this.store.selectProduct(productId);
  }
}
