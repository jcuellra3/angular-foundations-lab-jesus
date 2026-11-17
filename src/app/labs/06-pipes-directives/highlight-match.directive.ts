import { computed, Directive, input } from "@angular/core";

@Directive({
  selector: "[appHighlightMatch]",
  host: {
    "[class.search-match]": "matches()",
  },
})
export class HighlightMatchDirective {
  readonly query = input("", { alias: "appHighlightMatch" });
  readonly text = input.required<string>({ alias: "appHighlightText" });

  readonly matches = computed(() => {
    const normalizedQuery = this.query().trim().toLowerCase();
    if (!normalizedQuery) {
      return false;
    }

    const normalizedText = this.text().trim().toLowerCase();
    return normalizedText.includes(normalizedQuery);
  });
}
