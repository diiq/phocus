var moving = false;
var timeout: number | null = null;
export function setMoving() {
  moving = true;

  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }

  timeout = window.setTimeout(() => {
    moving = false;
    timeout = null;
  }, 250);
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
