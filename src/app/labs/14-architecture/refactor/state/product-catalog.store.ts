import { computed, Injectable, inject, signal } from "@angular/core";

import type { Product } from "@shared/domain/product.models";

import { ProductRepository } from "../data-access/product.repository";

@Injectable({ providedIn: "root" })
export class ProductCatalogStore {
  readonly #repository = inject(ProductRepository);

  readonly #products = signal<readonly Product[]>([]);
  readonly #message = signal("Pulsa el botón para cargar el catálogo.");

  //Solo permite leer el mensaje: su cambio sigue controlado por el store.
  readonly message = this.#message.asReadonly();

  //computed recalcula la lista ordenada cuando cambia #products.
  readonly sortedProducts = computed(() =>
    [...this.#products()].sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
  );

  async load(): Promise<void> {
    this.#message.set("Cargando...");
    const items = await this.#repository.getProducts();
    this.#products.set(items);
    this.#repository.saveProducts(this.sortedProducts());
    this.#message.set(`${items.length} productos cargados y persistidos.`);
  }

  selectProduct(productId: string): void {
    this.#message.set(`Producto seleccionado: ${productId}`);
  }
}
