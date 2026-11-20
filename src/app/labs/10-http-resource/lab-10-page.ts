import { httpResource } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";

import { CATEGORIES } from "@shared/data/catalog.data";
import type { ProductsResponse } from "@shared/domain/product.models";
import { LabHeader } from "@shared/ui/lab-header/lab-header";

@Component({
  imports: [LabHeader],
  templateUrl: "./lab-10-page.html",
  styleUrl: "./lab-10-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Lab10Page {
  readonly categories = CATEGORIES;
  readonly search = signal("");
  readonly category = signal("");

  //Al leer ambos signals, cada cambio actualiza la petición y httpResource cancela la anterior si sigue pendiente.
  readonly productsResource = httpResource<ProductsResponse>(() => {
    const params: Record<string, string> = {};
    const search = this.search().trim();
    const category = this.category().trim();

    if (search) {
      params["search"] = search;
    }

    if (category) {
      params["category"] = category;
    }
    return {
      url: "/api/products",
      params,
    };
  });

  onSearch(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.search.set(target.value);
    }
  }

  onCategory(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.category.set(target.value);
    }
  }
}
