import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { CATEGORIES, DEMO_PRODUCTS } from "@shared/data/catalog.data";
import { LabHeader } from "@shared/ui/lab-header/lab-header";

@Component({
  imports: [LabHeader],
  templateUrl: "./lab-08-page.html",
  styleUrl: "./lab-08-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Lab08Page {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  readonly categories = CATEGORIES;
  readonly search = signal(
    this.#route.snapshot.queryParamMap.get("search") ?? "",
  );
  readonly category = signal(
    this.#route.snapshot.queryParamMap.get("category") ?? "",
  );

  constructor() {
    this.#route.queryParamMap.subscribe((params) => {
      this.search.set(params.get("search") ?? "");
      this.category.set(params.get("category") ?? "");
    });
  }

  readonly visibleProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const cat = this.category();

    return DEMO_PRODUCTS.filter((product) => {
      const matchesSearch = !term || product.name.toLowerCase().includes(term);
      const matchesCategory = !cat || product.categoryId === cat;
      return matchesSearch && matchesCategory;
    });
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

  applyFilters(): void {
    const searchValue = this.search().trim();
    const categoryValue = this.category();

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: {
        search: searchValue ? searchValue : null,
        category: categoryValue ? categoryValue : null,
      },
      queryParamsHandling: "merge",
    });
  }
}
