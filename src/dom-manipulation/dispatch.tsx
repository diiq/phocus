import { addTrigger } from "./add-trigger";

export function dispatch(elt: HTMLElement) {
  if (elt.dataset.phocusAction) {
    addTrigger(elt);
  }
  const children = elt.querySelectorAll(
    "[data-phocus-action]:not([data-phocus-acion=''])"
  );
  if (!children.length) {
    console.info("No active phocus-triggers found.");
  }
  children.forEach(e => {
    if (!(e instanceof HTMLElement)) return;
    addTrigger(e);
  });
}
