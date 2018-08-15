export class ConstrainFocus {
  stack: (() => HTMLElement)[] = []

  start() {
    document.addEventListener('blur', this.handler, true);
  }

  stop() {
    document.removeEventListener('blur', this.handler, true);
  }

  handler = (e: MouseEvent) => {
    if (this.noConstraints()) return;
    const root = this.currentRoot();
    if (!root) return;
    if (!e.relatedTarget) return;
    if (!root.contains(e.relatedTarget as Element)) {
      if (root.contains(e.target as Element)) {
        (e.target as HTMLElement).focus();
      } else {
        (root.querySelector("[tabindex='0']") as HTMLElement).focus();
      }
    }
  }

  focusable(element: HTMLElement) {
    return this.noConstraints() || (this.currentRoot() && this.currentRoot().contains(element));
  }

  currentRoot(): HTMLElement {
    return this.stack[0]();
  }

  pushConstraint(root: () => HTMLElement) {
    this.stack.unshift(root);
  }

  popConstraint() {
    this.stack.shift();
  }

  noConstraints() {
    return this.stack.length == 0;
  }
}

export const ConstrainFocusService = new ConstrainFocus();
