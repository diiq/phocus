// From 'The Rule of Phocus':
// 4. Some states only allow focus among a subset of all focusable elements (modals, menus)
//     4.1. This subset is always contained in exactly one branch of the element tree
//

export class ConstrainFocus {
  stack: (() => HTMLElement | null)[] = [];

  start() {
    document.addEventListener("blur", this.handler as EventListener, true);
  }

  stop() {
    document.removeEventListener("blur", this.handler as EventListener, true);
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
  };

  focusable(element: HTMLElement) {
    const root = this.currentRoot();
    return this.noConstraints() || (root && root.contains(element));
  }

  currentRoot(): HTMLElement | null {
    return this.stack[0] && this.stack[0]();
  }

  pushConstraint(root: () => HTMLElement | null) {
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
