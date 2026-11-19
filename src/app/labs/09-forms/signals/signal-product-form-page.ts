import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
  signal,
} from "@angular/core";
import {
  FormField,
  form,
  maxLength,
  min,
  minLength,
  required,
} from "@angular/forms/signals";
import { CATEGORIES } from "@shared/data/catalog.data";
import { ProductDraft } from "@shared/domain/product.models";
import {
  EMPTY_PRODUCT_DRAFT,
  isValidSubcategory,
  normalizeProductDraft,
  subcategoriesFor,
  validateProductRules,
} from "../product-form.domain";

@Component({
  imports: [FormField],
  template: `
    <section class="form-layout">
      <div class="card product-form">
        <span class="variant-badge">Signal Forms</span>
        <h2>Alta de producto</h2>

        <form (submit)="onSubmit($event)" class="form-grid" novalidate>
          <label class="field--wide">
            Nombre
            <input
              id="signal-name"
              type="text"
              [formField]="productForm.name"
            />
            @if (showErrors() && productForm.name().invalid()) {
              <small
                >El nombre es obligatorio y debe tener entre 3 y 80
                caracteres.</small
              >
            }
          </label>

          <label>
            Categoría
            <select
              id="signal-category"
              [formField]="productForm.categoryId"
              (change)="onCategoryChange($event)"
            >
              <option value="">Selecciona categoría</option>
              @for (cat of categories; track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
            @if (showErrors() && productForm.categoryId().invalid()) {
              <small>La categoría es obligatoria.</small>
            }
          </label>

          <label>
            Subcategoría
            <select
              id="signal-subcategory"
              [formField]="productForm.subcategoryId"
              (change)="onSubcategoryChange($event)"
            >
              <option value="">Selecciona subcategoría</option>
              @for (sub of availableSubcategories(); track sub.id) {
                <option [value]="sub.id">{{ sub.name }}</option>
              }
            </select>
            @if (
              showErrors() &&
              (productForm.subcategoryId().invalid() ||
                domainErrors().has("invalidSubcategory"))
            ) {
              <small
                >Selecciona una subcategoría válida para la categoría
                elegida.</small
              >
            }
          </label>

          <fieldset class="field--wide">
            <legend>Tipo de producto</legend>
            <label>
              <input
                id="signal-kind-physical"
                type="radio"
                value="physical"
                [formField]="productForm.kind"
                (change)="onKindChange()"
              />
              Físico
            </label>
            <label>
              <input
                id="signal-kind-digital"
                type="radio"
                value="digital"
                [formField]="productForm.kind"
                (change)="onKindChange()"
              />
              Digital
            </label>
          </fieldset>

          <label>
            Precio base
            <input
              id="signal-base-price"
              type="number"
              step="0.01"
              [formField]="productForm.basePrice"
            />
            @if (showErrors() && productForm.basePrice().invalid()) {
              <small>El precio base debe ser mayor que 0.</small>
            }
          </label>

          <label>
            Precio promocional
            <input
              id="signal-sale-price"
              type="number"
              [formField]="productForm.salePrice"
            />
            @if (
              showErrors() &&
              (productForm.salePrice().invalid() ||
                domainErrors().has("invalidSalePrice"))
            ) {
              <small
                >El precio promocional debe ser 0 o inferior al precio
                base.</small
              >
            }
          </label>

          <label>
            Stock
            <input
              id="signal-stock"
              type="number"
              [formField]="productForm.stock"
            />
            @if (
              showErrors() &&
              (productForm.stock().invalid() ||
                domainErrors().has("physicalStockRequired"))
            ) {
              <small>Un producto físico exige stock mayor que 0.</small>
            }
          </label>

          <label class="field--wide">
            Descripción
            <textarea
              id="signal-description"
              rows="3"
              [formField]="productForm.description"
            ></textarea>
            @if (showErrors() && productForm.description().invalid()) {
              <small>La descripción admite un máximo de 240 caracteres.</small>
            }
          </label>

          <div class="field--wide">
            <button type="submit">Guardar producto</button>
          </div>
        </form>
      </div>

      @if (submittedPayload(); as payload) {
        <aside class="card payload" data-testid="submitted-payload">
          <h3>Payload enviado</h3>
          <pre>{{ payload }}</pre>
        </aside>
      }
    </section>
  `,
  styleUrl: "../product-form.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignalProductFormPage {
  protected readonly categories = CATEGORIES;
  protected readonly submitted = signal(false);
  protected readonly submittedPayload = signal<string | null>(null);

  protected readonly draft = signal<ProductDraft>({ ...EMPTY_PRODUCT_DRAFT });

  //Se declaran las validaciones propias de cada campo en el esquema de Signal Forms.
  protected readonly productForm = form(this.draft, (path) => {
    required(path.name);
    minLength(path.name, 3);
    maxLength(path.name, 80);
    required(path.categoryId);
    required(path.subcategoryId);
    required(path.basePrice);
    min(path.basePrice, 0.01);
    min(path.salePrice, 0);
    min(path.stock, 0);
    maxLength(path.description, 240);
  });

  protected readonly domainErrors = computed(() =>
    validateProductRules(this.draft()),
  );
  protected readonly availableSubcategories = computed(() =>
    subcategoriesFor(this.draft().categoryId),
  );
  protected readonly showErrors = linkedSignal(
    () => this.submitted() || this.productForm().touched(),
  );

  //Se mantiene la subcategoría solo si sigue siendo válida para la categoría seleccionada.
  protected onCategoryChange(event: Event): void {
    const categoryId = (event.target as HTMLSelectElement).value;
    this.draft.update((prev) => ({
      ...prev,
      categoryId,
      subcategoryId: isValidSubcategory(categoryId, prev.subcategoryId)
        ? prev.subcategoryId
        : "",
    }));
  }

  protected onSubcategoryChange(event: Event): void {
    const subcategoryId = (event.target as HTMLSelectElement).value;
    this.draft.update((prev) => ({ ...prev, subcategoryId }));
  }

  //Normalizar el stock al seleccionar un producto digital.
  protected onKindChange(): void {
    if (this.draft().kind === "digital") {
      this.draft.update((prev) => ({ ...prev, stock: 0 }));
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);

    const current = this.draft();
    //Combina las restricciones de campos con las reglas que dependen de varios campos.
    const hasInvalidFields =
      current.name.trim().length < 3 ||
      current.name.trim().length > 80 ||
      !current.categoryId ||
      !current.subcategoryId ||
      current.basePrice <= 0 ||
      current.salePrice < 0 ||
      current.stock < 0 ||
      current.description.length > 240;

    if (hasInvalidFields || this.domainErrors().size > 0) {
      this.submittedPayload.set(null);
      return;
    }

    //Se limpian los datos antes de mostrarlos como payload enviado.
    const normalized = normalizeProductDraft(current);
    this.submittedPayload.set(JSON.stringify(normalized, null, 2));
  }
}
