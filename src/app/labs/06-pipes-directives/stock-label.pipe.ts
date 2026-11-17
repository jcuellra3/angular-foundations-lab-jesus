import { Pipe, type PipeTransform } from "@angular/core";

@Pipe({ name: "stockLabel" })
export class StockLabelPipe implements PipeTransform {
  transform(stock: number): string {
    if (stock <= 0) {
      return "Agotado";
    }
    if (stock <= 5) {
      return "Últimas unidades";
    }
    return "Disponible";
  }
}
