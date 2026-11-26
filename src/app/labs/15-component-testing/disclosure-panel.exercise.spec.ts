import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { DisclosurePanel } from "./disclosure-panel";

//Este host usa el componente como lo haría un padre y recoge su output.
@Component({
  imports: [DisclosurePanel],
  template: `
    <app-disclosure-panel
      title="Ayuda"
      panelId="help-panel"
      (expandedChange)="onExpandedChange($event)"
    >
      <p>Contenido de ayuda</p>
    </app-disclosure-panel>
  `,
})
class TestHost {
  expandedEvents: boolean[] = [];

  onExpandedChange(value: boolean): void {
    this.expandedEvents.push(value);
  }
}

describe("Lab 15 · disclosure component", () => {
  async function setup() {
    //TestBed monta Angular; el fixture permite consultar e interactuar con el DOM.
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    //Espera al primer render antes de buscar los elementos.
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const button = host.querySelector("button") as HTMLButtonElement;

    return { fixture, host, button };
  }

  it("opens the panel through its public UI", async () => {
    const { fixture, host, button } = await setup();

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("help-panel");
    expect(host.querySelector('[data-testid="disclosure-content"]')).toBeNull();

    button.click();
    //Espera a que Angular procese el click y actualice la vista.
    await fixture.whenStable();

    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(
      host.querySelector('[data-testid="disclosure-content"]')?.textContent,
    ).toContain("Contenido de ayuda");
  });

  it("closes the panel and destroys the content on a second click", async () => {
    const { fixture, host, button } = await setup();

    button.click();
    await fixture.whenStable();
    //Al abrirse, @if crea el contenido del panel.
    expect(
      host.querySelector('[data-testid="disclosure-content"]'),
    ).not.toBeNull();

    button.click();
    await fixture.whenStable();

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(host.querySelector('[data-testid="disclosure-content"]')).toBeNull();
  });

  it("renders the button title and projected content inside the linked panel", async () => {
    const { fixture, host, button } = await setup();

    expect(button.textContent?.trim()).toBe("Ayuda");

    button.click();
    await fixture.whenStable();

    const panel = host.querySelector("#help-panel");
    expect(panel).not.toBeNull();
    expect(panel?.id).toBe("help-panel");
    expect(panel?.querySelector("p")?.textContent).toBe("Contenido de ayuda");
  });

  it("emits expandedChange with the new state on open and close", async () => {
    const { fixture, button } = await setup();

    expect(fixture.componentInstance.expandedEvents).toEqual([]);

    button.click();
    await fixture.whenStable();
    //El output debe emitir el nuevo estado en cada cambio.
    expect(fixture.componentInstance.expandedEvents).toEqual([true]);

    button.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.expandedEvents).toEqual([true, false]);
  });
});
