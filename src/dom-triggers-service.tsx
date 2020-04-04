import { ContextService } from "context-service";

export class DOMTriggersService {
  constructor(private actionContextService: ContextService) {}
  onClick = (e: MouseEvent) => {
    if (!(e.currentTarget instanceof HTMLElement)) return;
    if (!e.currentTarget.dataset.phocusAction) return;
    if ((e.currentTarget as HTMLButtonElement).disabled) return;
    this.actionContextService.setContext(e.currentTarget);
    this.actionContextService.triggerAction(e.currentTarget.dataset.phocusAction, e);
  }

  triggerableTags = ["button", "a"];
  addTrigger(elt: HTMLElement) {
    if (!elt.dataset.phocusAction) return;
    const action = elt.dataset.phocusAction;

    if (
      this.triggerableTags.indexOf(elt.tagName.toLowerCase()) < 0 &&
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

    const oldContext = this.actionContextService.contextStack; // this store and restore thing; do it with an internal stack stack?
    try {
      // Add button labels, including any keyboard shortcuts
      this.actionContextService.setContext(elt);
      const actionInContext = this.actionContextService.actionForName(action);
      if (!actionInContext) {
        console.error(
          `No action found for name ${action}`,
          this.actionContextService.contextStack
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
      elt.addEventListener("click", this.onClick);
    } finally {
      // Restore context previously in progress
      this.actionContextService.contextStack = oldContext;
    }
  }

  removeTrigger(elt: HTMLElement) {
    elt.removeEventListener("click", this.onClick);
  }
}
