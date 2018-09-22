import { ContextStackEntry } from "action-context/action-context";

export function getContextStack(elt: HTMLElement | null): ContextStackEntry[] {
  if (!elt) return [];
  let stack = getContextStack(elt.parentElement)
  if (elt.dataset.phocusContextName) {
    stack.unshift({
      context: elt.dataset.phocusContextName,
      argument: elt.dataset.phocusContextArgument,
      element: elt
    });
  }
  return stack;
}