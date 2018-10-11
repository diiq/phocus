// From 'The Rule of Phocus':
// 4. Some states only allow focus among a subset of all focusable elements (modals, menus)
//     4.1. This subset is always contained in exactly one branch of the element tree
//

interface StackElement {
  constraint: () => HTMLElement | null
  previousFocus: Element | null
}

export class ConstrainFocus {
  stack: StackElement[] = [];

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
      this.refocus(root, e.target as Element)
    }
  };

  refocus(root: HTMLElement, target: Element) {
    if (root.contains(target)) {
      (target as HTMLElement).focus();
    } else {
      const focusable = root.querySelector("button, input, textarea, a, [tabindex='0']");
      if (focusable) {
        (focusable as HTMLElement).focus();
      } else {
        root.focus();
      }
    }
  }

  focusable(element: HTMLElement) {
    const root = this.currentRoot();
    return this.noConstraints() || (root && root.contains(element));
  }

  currentRoot(): HTMLElement | null {
    return this.stack[0] && this.stack[0].constraint();
  }

  pushConstraint(root: () => HTMLElement | null) {
    this.stack.unshift({
      constraint: root,
      previousFocus: document.activeElement
    });
    const rootE = this.currentRoot();
    if (!rootE) return;
    this.refocus(rootE, document.activeElement);
  }

  popConstraint() {
    const pop = this.stack.shift();
    if (!pop || !pop.previousFocus || !(pop.previousFocus instanceof HTMLElement)) return;
    pop.previousFocus.focus();
  }

  noConstraints() {
    return this.stack.length == 0;
  }
}

export const ConstrainFocusService = new ConstrainFocus();
