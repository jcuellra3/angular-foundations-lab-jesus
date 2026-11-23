import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import {
  map,
  of,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from "rxjs";

import { LabHeader } from "@shared/ui/lab-header/lab-header";

interface SuggestionsResponse {
  readonly items: readonly string[];
}

@Component({
  imports: [LabHeader],
  templateUrl: "./lab-12-page.html",
  styleUrl: "./lab-12-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Lab12Page {
  readonly #http = inject(HttpClient);
  readonly query = signal("");
  readonly #queryChanges = toObservable(this.query);

  readonly suggestions = toSignal(
    this.#queryChanges.pipe(
      map((value) => value.trim()),
      //Se espera 250ms tras dejar de escribir.
      debounceTime(250),
      distinctUntilChanged(),
      //Al llegar un nuevo término distinto tras 250 ms sin cambios, switchMap cancela la petición en curso.
      switchMap((term) => {
        if (term.length < 2) {
          return of([] as readonly string[]);
        }
        return this.#http
          .get<SuggestionsResponse>("/api/suggestions", { params: { q: term } })
          .pipe(
            map((response) => response.items),
            catchError(() => of([] as readonly string[])),
          );
      }),
    ),
    { initialValue: [] as readonly string[] },
  );

  onQuery(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.query.set(target.value);
    }
  }
}
