import { ActionContextService } from "action-context/action-context";

function onClick(e: MouseEvent) {
  if (!(e.target instanceof HTMLElement)) return;
  if (!e.target.dataset.phocusAction) return;
  ActionContextService.setContext(e.target);
  ActionContextService.triggerAction(e.target.dataset.phocusAction);
}

export function addTrigger(elt: HTMLElement, action: string) {
  const oldContext = ActionContextService.contextStack; // this store and restore thing; do it with an internal stack stack?
  try {
    ActionContextService.setContext(elt);
    const actionInContext = ActionContextService.actionForName(action);
    if (!actionInContext) return;

    elt.title = actionInContext.action.label();
    elt.addEventListener("click", onClick);
  } finally {
    ActionContextService.contextStack = oldContext;
  }
}

export function removeTrigger(elt: HTMLElement, action: string) {
  elt.removeEventListener("click", onClick);
}
