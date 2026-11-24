import { computed, Injectable, signal } from "@angular/core";
import { producerAccessed } from "@angular/core/primitives/signals";

import { DEMO_PRODUCTS } from "@shared/data/catalog.data";

@Injectable()
export class ProductsStore {
  readonly #query = signal("");
  readonly #favoriteIds = signal<ReadonlySet<string>>(new Set());

  readonly query = this.#query.asReadonly();
  readonly favorites = this.#favoriteIds.asReadonly();
  readonly favoriteCount = computed(() => this.#favoriteIds().size);
  //Se filtra el catálogo cada vez que cambia la búsqueda.
  readonly visibleProducts = computed(() => {
    const term = this.#query().trim().toLocaleLowerCase();
    if (!term) {
      return DEMO_PRODUCTS;
    }
    return DEMO_PRODUCTS.filter((product) =>
      product.name.toLocaleLowerCase().includes(term),
    );
  });

  //Se actualiza la signal privada de búsquda.
  setQuery(query: string): void {
    this.#query.set(query);
  }

  isFavorite(productId: string): boolean {
    return this.#favoriteIds().has(productId);
  }

  //Se crea nueva instancia de Set para mantener inmutabilidad.
  toggleFavorite(productId: string): void {
    this.#favoriteIds.update((current) => {
      const updatedFavorites = new Set(current);
      if (updatedFavorites.has(productId)) {
        updatedFavorites.delete(productId);
      } else {
        updatedFavorites.add(productId);
      }
      return updatedFavorites;
    });
  }
}
