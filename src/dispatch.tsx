import { DOMTriggersService } from "./dom-triggers-service";
import { makeMouseoverFocusable, removeMouseoverFocusable } from "./mouseover-focusable";

export class Dispatch {
  constructor(private domTriggers: DOMTriggersService) {}
  dispatch(elt: HTMLElement) {
    if (elt.dataset.phocusAction) {
      this.domTriggers.addTrigger(elt);
    }
    if (elt.dataset.phocusOnMouseover) {
      makeMouseoverFocusable(elt);
    }
    var children = elt.querySelectorAll(
      "[data-phocus-action]:not([data-phocus-action=''])"
    );
    Array.from(children).forEach(e => {
      if (!(e instanceof HTMLElement)) return;
      this.domTriggers.addTrigger(e);
    });

    children = elt.querySelectorAll(
      "[data-phocus-on-mouseover]:not([data-phocus-on-mouseover=''])"
    );
    Array.from(children).forEach(e => {
      if (!(e instanceof HTMLElement)) return;
      makeMouseoverFocusable(e);
    });
  }

  undispatch(elt: HTMLElement) {
    if (elt.dataset.phocusAction) {
      this.domTriggers.removeTrigger(elt);
    }
    if (elt.dataset.phocusOnMouseover) {
      removeMouseoverFocusable(elt);
    }

    var children = elt.querySelectorAll(
      "[data-phocus-action]:not([data-phocus-action=''])"
    );
    Array.from(children).forEach(e => {
      if (!(e instanceof HTMLElement)) return;
      this.domTriggers.removeTrigger(e);
    });

    children = elt.querySelectorAll(
      "[data-phocus-on-mouseover]:not([data-phocus-on-mouseover=''])"
    );
    Array.from(children).forEach(e => {
      if (!(e instanceof HTMLElement)) return;
      removeMouseoverFocusable(e);
    });
  }
}
