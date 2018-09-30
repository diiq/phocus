function mouseoverFocus(e: MouseEvent) {
  (e.target as HTMLElement).focus();
}

export function makeMouseoverFocusable(elt: HTMLElement) {
  if (elt.getAttribute("tabindex") == undefined) {
    elt.tabIndex = 0;
  }
  elt.addEventListener("mouseenter", mouseoverFocus);
}

export function removeMouseoverFocusable(elt: HTMLElement) {
  elt.removeEventListener("mouseenter", mouseoverFocus);
}
