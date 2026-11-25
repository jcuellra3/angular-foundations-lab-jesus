import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";

import type { Product } from "@shared/domain/product.models";

@Component({
  selector: "app-product-list",
  template: `
    <ul>
      @for (product of products(); track product.id) {
        <li (click)="selectProduct.emit(product.id)">{{ product.name }}</li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList {
  //Esta lista solo muestra datos recibidos y comunica acciones; no carga ni guarda productos.
  readonly products = input.required<readonly Product[]>();
  readonly selectProduct = output<string>();
}
