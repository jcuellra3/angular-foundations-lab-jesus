import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { startWith } from "rxjs";
import { CATEGORIES } from "@shared/data/catalog.data";
import { ProductDraft, ProductKind } from "@shared/domain/product.models";
import {
  EMPTY_PRODUCT_DRAFT,
  isValidSubcategory,
  normalizeProductDraft,
  subcategoriesFor,
  validateProductRules,
} from "../product-form.domain";

function productCrossValidator(
  control: AbstractControl,
): ValidationErrors | null {
  //Reutiliza las reglas del dominio que dependen de varios campos.
  const value = control.getRawValue() as ProductDraft;
  const domainErrors = validateProductRules(value);

  if (domainErrors.size === 0) {
    return null;
  }

  const errors: ValidationErrors = {};
  domainErrors.forEach((err) => {
    errors[err] = true;
  });
  return errors;
}

@Component({
  imports: [ReactiveFormsModule],
  template: `
    <section class="form-layout">
      <div class="card product-form">
        <span class="variant-badge">Reactive Forms</span>
        <h2>Alta de producto</h2>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="form-grid"
          novalidate
        >
          <label class="field--wide">
            Nombre
            <input id="reactive-name" type="text" formControlName="name" />
            @if (showErrors() && form.controls.name.invalid) {
              <small
                >El nombre es obligatorio y debe tener entre 3 y 80
                caracteres.</small
              >
            }
          </label>

          <label>
            Categoría
            <select id="reactive-category" formControlName="categoryId">
              <option value="">Selecciona categoría</option>
              @for (cat of categories; track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
            @if (showErrors() && form.controls.categoryId.invalid) {
              <small>La categoría es obligatoria.</small>
            }
          </label>

          <label>
            Subcategoría
            <select id="reactive-subcategory" formControlName="subcategoryId">
              <option value="">Selecciona subcategoría</option>
              @for (sub of availableSubcategories(); track sub.id) {
                <option [value]="sub.id">{{ sub.name }}</option>
              }
            </select>
            @if (
              showErrors() &&
              (form.controls.subcategoryId.invalid ||
                form.hasError("invalidSubcategory"))
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
                id="reactive-kind-physical"
                type="radio"
                value="physical"
                formControlName="kind"
              />
              Físico
            </label>
            <label>
              <input
                id="reactive-kind-digital"
                type="radio"
                value="digital"
                formControlName="kind"
              />
              Digital
            </label>
          </fieldset>

          <label>
            Precio base
            <input
              id="reactive-base-price"
              type="number"
              step="0.01"
              formControlName="basePrice"
            />
            @if (showErrors() && form.controls.basePrice.invalid) {
              <small>El precio base debe ser mayor que 0.</small>
            }
          </label>

          <label>
            Precio promocional
            <input
              id="reactive-sale-price"
              type="number"
              step="0.01"
              formControlName="salePrice"
            />
            @if (
              showErrors() &&
              (form.controls.salePrice.invalid ||
                form.hasError("invalidSalePrice"))
            ) {
              <small
                >El precio promocional debe ser 0 o inferior al precio
                base.</small
              >
            }
          </label>

          <label>
            Stock
            <input id="reactive-stock" type="number" formControlName="stock" />
            @if (
              showErrors() &&
              (form.controls.stock.invalid ||
                form.hasError("physicalStockRequired"))
            ) {
              <small>Un producto físico exige stock mayor que 0.</small>
            }
          </label>

          <label class="field--wide">
            Descripción
            <textarea
              id="reactive-description"
              rows="3"
              formControlName="description"
            ></textarea>
            @if (showErrors() && form.controls.description.invalid) {
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
export default class ReactiveProductFormPage {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly categories = CATEGORIES;
  protected readonly submitted = signal(false);
  protected readonly submittedPayload = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      name: [
        EMPTY_PRODUCT_DRAFT.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(80),
        ],
      ],
      description: [
        EMPTY_PRODUCT_DRAFT.description,
        [Validators.maxLength(240)],
      ],
      categoryId: [EMPTY_PRODUCT_DRAFT.categoryId, [Validators.required]],
      subcategoryId: [EMPTY_PRODUCT_DRAFT.subcategoryId, [Validators.required]],
      kind: [EMPTY_PRODUCT_DRAFT.kind as ProductKind],
      basePrice: [
        EMPTY_PRODUCT_DRAFT.basePrice,
        [Validators.required, Validators.min(0.01)],
      ],
      salePrice: [EMPTY_PRODUCT_DRAFT.salePrice, [Validators.min(0)]],
      stock: [EMPTY_PRODUCT_DRAFT.stock, [Validators.min(0)]],
    },
    { validators: [productCrossValidator] },
  );

  //Se dapta valueChanges a un signal para derivar las subcategorías visibles.
  private readonly categoryValue = toSignal(
    this.form.controls.categoryId.valueChanges.pipe(
      startWith(this.form.controls.categoryId.value),
    ),
    { initialValue: this.form.controls.categoryId.value },
  );

  protected readonly availableSubcategories = computed(() =>
    subcategoriesFor(this.categoryValue()),
  );
  protected readonly showErrors = computed(
    () => this.submitted() || this.form.touched,
  );

  constructor() {
    //Al cambiar de categoría, descarta una subcategoría que ya no pertenezca a ella.
    this.form.controls.categoryId.valueChanges.subscribe((categoryId) => {
      const currentSub = this.form.controls.subcategoryId.value;
      if (currentSub && !isValidSubcategory(categoryId, currentSub)) {
        this.form.controls.subcategoryId.setValue("");
      }
    });

    //Los productos digitales no mantienen stock.
    this.form.controls.kind.valueChanges.subscribe((kind) => {
      if (kind === "digital") {
        this.form.controls.stock.setValue(0);
      }
    });
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    //Solo se genera el payload si todos los controles y las reglas cruzadas son válidos.
    if (this.form.invalid) {
      this.submittedPayload.set(null);
      return;
    }

    const normalized = normalizeProductDraft(this.form.getRawValue());
    this.submittedPayload.set(JSON.stringify(normalized, null, 2));
  }
}
