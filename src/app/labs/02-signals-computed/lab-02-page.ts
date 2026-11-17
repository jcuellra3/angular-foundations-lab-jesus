import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";

import { LabHeader } from "@shared/ui/lab-header/lab-header";

interface CartLine {
  readonly id: string;
  readonly name: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

const TAX_RATE = 0.21;

@Component({
  imports: [LabHeader],
  templateUrl: "./lab-02-page.html",
  styleUrl: "./lab-02-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Lab02Page {
  readonly lines = signal<readonly CartLine[]>([
    { id: "keyboard", name: "Teclado mecánico", unitPrice: 89.9, quantity: 1 },
    { id: "mouse", name: "Ratón ergonómico", unitPrice: 39.95, quantity: 2 },
  ]);

  readonly subtotal = computed(() =>
    this.lines().reduce((acc, line) => acc + line.unitPrice * line.quantity, 0),
  );
  readonly tax = computed(() => this.subtotal() * TAX_RATE);
  readonly total = computed(() => this.subtotal() + this.tax());

  changeQuantity(id: string, delta: number): void {
    this.lines.update((currentLines) =>
      currentLines.map((line) =>
        line.id === id
          ? { ...line, quantity: Math.max(0, line.quantity + delta) }
          : line,
      ),
    );
  }
}
