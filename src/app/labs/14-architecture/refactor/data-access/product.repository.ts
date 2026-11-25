import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

import type { Product, ProductsResponse } from "@shared/domain/product.models";

@Injectable({ providedIn: "root" })
export class ProductRepository {
  //Encapsula el contrato remoto: el resto no conoce la URL ni el tipo ProductsResponse.
  readonly #http = inject(HttpClient);

  async getProducts(): Promise<readonly Product[]> {
    const response = await firstValueFrom(
      this.#http.get<ProductsResponse>("/api/products?limit=4"),
    );
    return response.items;
  }

  saveProducts(products: readonly Product[]): void {
    //localStorage es persistencia y se mantiene fuera del store y de la plantilla.
    globalThis.localStorage?.setItem(
      "refactor-products",
      JSON.stringify(products),
    );
  }
}
