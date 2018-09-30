import { addTrigger, removeTrigger } from "./add-trigger";
import { makeMouseoverFocusable, removeMouseoverFocusable } from "./mouseover-focusable";

export function dispatch(elt: HTMLElement) {
  if (elt.dataset.phocusAction) {
    addTrigger(elt);
  }
  if (elt.dataset.phocusOnMouseover) {
    makeMouseoverFocusable(elt);
  }
  var children = elt.querySelectorAll(
    "[data-phocus-action]:not([data-phocus-action=''])"
  );
  Array.from(children).forEach(e => {
    if (!(e instanceof HTMLElement)) return;
    addTrigger(e);
  });

  children = elt.querySelectorAll(
    "[data-phocus-on-mouseover]:not([data-phocus-on-mouseover=''])"
  );
  Array.from(children).forEach(e => {
    if (!(e instanceof HTMLElement)) return;
    makeMouseoverFocusable(e);
  });
}

export function undispatch(elt: HTMLElement) {
  if (elt.dataset.phocusAction) {
    removeTrigger(elt);
  }
  if (elt.dataset.phocusOnMouseover) {
    removeMouseoverFocusable(elt);
  }

  var children = elt.querySelectorAll(
    "[data-phocus-action]:not([data-phocus-action=''])"
  );
  Array.from(children).forEach(e => {
    if (!(e instanceof HTMLElement)) return;
    removeTrigger(e);
  });

  children = elt.querySelectorAll(
    "[data-phocus-on-mouseover]:not([data-phocus-on-mouseover=''])"
  );
  Array.from(children).forEach(e => {
    if (!(e instanceof HTMLElement)) return;
    removeMouseoverFocusable(e);
  });
}
