function getContextParent(elt: HTMLElement): HTMLElement | null {
  const parent = elt.parentElement
  if (!parent) return null;
  if (parent.dataset.phocusContextName) return parent;
  return getContextParent(parent);
}

// Allows elements with the same phocus-id to appear on the page, but asking to
// focus on one will always result in focusing on the one in the nearest
// ancestor context.
export function focusInContext(phocusId: string, elt?: HTMLElement) {
  const current = elt || (document.activeElement as HTMLElement);
  const find: HTMLElement | null = current.querySelector(
    `[data-phocus-id="${phocusId}"]`
  );
  if (find) {
    find.focus();
  } else {
    const parent = getContextParent(current);
    if (parent) {
      focusInContext(phocusId, parent);
    } else {
      console.error(`No element found to focus with phocus-id ${phocusId}`);
    }
  }
}
