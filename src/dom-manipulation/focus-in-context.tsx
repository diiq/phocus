function getContextParent(elt: HTMLElement): HTMLElement | null {
  const parent = elt.parentElement;
  if (parent) {
    if (parent.dataset.phocusContextName) {
      return parent;
    }
    return getContextParent(parent);
  }
  return null;
}

// Allows elements with the same phocus-id to appear on the page, but asking to
// focus on one will always result in focusing on the one in the nearest
// ancestor context.
export function focusInContext(phocusId: string, elt?: HTMLElement) {
  const current = elt || (document.activeElement as HTMLElement);
  const parent = getContextParent(current);
  if (!parent) {
    console.error(`No element found to focus with phocus-id ${phocusId}`);
    return;
  }
  const find: HTMLElement | null = parent.querySelector(
    `[data-phocus-id="${phocusId}"]`
  );
  if (find) {
    find.focus();
  } else {
    focusInContext(phocusId, parent);
  }
}
