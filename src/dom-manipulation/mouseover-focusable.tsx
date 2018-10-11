var moving = false;
export function setMoving() {
  moving = true;
  setTimeout(() => moving = false, 250);
}

function mouseoverFocus(e: MouseEvent) {
  if (!moving) return;
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
