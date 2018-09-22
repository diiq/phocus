export function makeFocusable(elt: HTMLElement) {
  if (elt.getAttribute("tabindex") == undefined) {
    elt.tabIndex = 0;
  }
}