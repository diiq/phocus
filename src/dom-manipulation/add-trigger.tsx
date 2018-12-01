import { ActionContextService } from "../action-context/action-context";

function onClick(e: MouseEvent) {
  if (!(e.currentTarget instanceof HTMLElement)) return;
  if (!e.currentTarget.dataset.phocusAction) return;
  if ((e.currentTarget as HTMLButtonElement).disabled) return;
  ActionContextService.setContext(e.currentTarget);
  ActionContextService.triggerAction(e.currentTarget.dataset.phocusAction, e);
}

export const triggerableTags = ["button", "a"];
export function addTrigger(elt: HTMLElement) {
  if (!elt.dataset.phocusAction) return;
  const action = elt.dataset.phocusAction;

  if (
    triggerableTags.indexOf(elt.tagName.toLowerCase()) < 0 &&
    elt.getAttribute("role") !== "button"
  ) {
    console.error(
      `${
        elt.tagName
      } (assigned to trigger ${action}) is not an accessible tag. Use a <button> or an <a>.`
    );
    console.info("Setting role to 'button' to compensate.");
    elt.setAttribute("role", "button");
  }

  const oldContext = ActionContextService.contextStack; // this store and restore thing; do it with an internal stack stack?
  try {
    // Add button labels, including any keyboard shortcuts
    ActionContextService.setContext(elt);
    const actionInContext = ActionContextService.actionForName(action);
    if (!actionInContext) {
      console.error(
        `No action found for name ${action}`,
        ActionContextService.contextStack
      );
      return;
    }
    if (!elt.dataset.phocusDoNotLabel) {
      elt.title = actionInContext.action.label();
      elt.setAttribute("aria-label", actionInContext.action.label());
    }

    // Set text (if elt is empty)
    if (/^\s*$/.test(elt.innerHTML)) {
      elt.innerHTML = actionInContext.action.name;
    } else if (elt.dataset.phocusAutolabel) {
      const label = elt.querySelector(elt.dataset.phocusAutolabel);
      if (label) {
        label.innerHTML = actionInContext.action.name;
      } else {
        console.warn(
          `Asked to autolabel ${
            elt.dataset.phocusAutolabel
          }, but no such element exists inside ${elt}.`
        );
      }
    }

    // Add click handler
    elt.addEventListener("click", onClick);
  } finally {
    // Restore context previously in progress
    ActionContextService.contextStack = oldContext;
  }
}

export function removeTrigger(elt: HTMLElement) {
  elt.removeEventListener("click", onClick);
}
