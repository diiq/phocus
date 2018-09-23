import { addTrigger, removeTrigger } from "./add-trigger";

export function dispatch(elt: HTMLElement) {
  if (elt.dataset.phocusAction) {
    addTrigger(elt);
  }
  const children = elt.querySelectorAll(
    "[data-phocus-action]:not([data-phocus-acion=''])"
  );
  Array.from(children).forEach(e => {
    if (!(e instanceof HTMLElement)) return;
    addTrigger(e);
  });
}

export function undispatch(elt: HTMLElement) {
  if (elt.dataset.phocusAction) {
    removeTrigger(elt);
  }
  const children = elt.querySelectorAll(
    "[data-phocus-action]:not([data-phocus-acion=''])"
  );
  Array.from(children).forEach(e => {
    if (!(e instanceof HTMLElement)) return;
    removeTrigger(e);
  });
}
