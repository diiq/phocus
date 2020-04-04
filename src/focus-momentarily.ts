let isDOM = (p: any): p is HTMLElement => p instanceof HTMLElement;
let isString = (p: any): p is String => typeof p === 'string' || p instanceof String;

export function focusMomentarily(target: string | HTMLElement) {
  // Many elements you'd choose to focus on for accessibilty reasons
  // aren't inherently focusable -- they're <main> or <h1> tags. So we
  // make the element focusable, and then when focus leaves that element,
  // make it non-focusable again. This is purely an accessibility concern,
  // so don't allow the page to scroll to alight the focus with the top of
  // the screen.
  if (isDOM(target)) {
    return focusElementMomentarily(target)
  } else if (isString(target)) {
    let elt: HTMLElement | null = document.querySelector(target);
    if (!elt) {
      console.warn(
        `Phocus' focusMomentarily targeted a non-existent element ${target}`
      );
      return;
    }

    focusElementMomentarily(elt);
  } else {
    console.warn(
      `Phocus' focusMomentarily targeted a non-element, non-selector: ${target}`
    );
  }
}

function focusElementMomentarily(elt: HTMLElement, scroll: boolean = false) {
  ensureFocusable(elt);
  elt.classList.add('hidden-focus');
  let offset = window.pageYOffset;
  elt.focus();
  if (scroll) {
    setTimeout(() => elt.scrollIntoView(), 100);
  } else {
    window.scrollTo(0, offset);
  }
  elt.addEventListener('blur', restoreFocusability);
}

function ensureFocusable(elt: HTMLElement) {
  // Store the current tabindex so we can restore it later
  if (elt.getAttribute('tabindex')) {
    elt.dataset['phocus-previous-tabindex'] = elt.getAttribute('tabindex') || undefined;
  }
  elt.tabIndex = -1;
}

function restoreFocusability(e: FocusEvent) {
  let elt = e.target as HTMLElement;

  // Restore the previous tabindex if there was one; remove it entirely if
  // there was not.
  const oldTabindex = elt.dataset['phocus-previous-tabindex']
  if (oldTabindex) {
    elt.setAttribute('tabindex', oldTabindex);
    delete elt.dataset['phocus-previous-tabindex'];
  } else {
    elt.removeAttribute('tabindex');
  }
  elt.classList.remove('hidden-focus');

  // Don't continue to call this function every blur.
  elt.removeEventListener('blur', restoreFocusability);
}
