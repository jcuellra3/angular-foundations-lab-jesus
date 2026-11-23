import { HttpErrorResponse, httpResource } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";

import type { ProductsResponse } from "@shared/domain/product.models";
import { LabHeader } from "@shared/ui/lab-header/lab-header";

import { ProductsApi } from "./products-api";

import { firstValueFrom } from "rxjs";

@Component({
  imports: [LabHeader],
  providers: [ProductsApi],
  templateUrl: "./lab-11-page.html",
  styleUrl: "./lab-11-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Lab11Page {
  readonly #api = inject(ProductsApi);
  readonly #refresh = signal(0);

  readonly products = httpResource<ProductsResponse>(() => {
    this.#refresh();
    return "/api/products?limit=6";
  });
  readonly newProductName = signal("");
  readonly busy = signal(false);
  readonly feedback = signal("");
  readonly error = signal("");

  onName(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.newProductName.set(target.value);
    }
  }

  async create(): Promise<void> {
    const name = this.newProductName().trim();
    if (!name || this.busy()) return;

    this.busy.set(true);
    this.feedback.set("");
    this.error.set("");

    try {
      await firstValueFrom(this.#api.create(name));
      this.newProductName.set("");
      this.feedback.set("Producto creado correctamente.");
      this.#refresh.update((n) => n + 1);
    } catch (err) {
      this.error.set(this.describeError(err));
    } finally {
      this.busy.set(false);
    }
  }

  async remove(productId: string): Promise<void> {
    if (this.busy()) return;

    this.busy.set(true);
    this.feedback.set("");
    this.error.set("");

    try {
      await firstValueFrom(this.#api.remove(productId));
      this.feedback.set("Producto eliminado correctamente.");
      this.#refresh.update((n) => n + 1);
    } catch (err) {
      this.error.set(this.describeError(err));
    } finally {
      this.busy.set(false);
    }
  }

  describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? `Error HTTP ${error.status}`;
    }
    return "Se produjo un error inesperado.";
  }
}
