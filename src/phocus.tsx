import { ContextService } from "./context-service";
import { Dispatch } from "./dispatch";
import { DOMTriggersService } from "./dom-triggers-service";
import { ConstraintService } from "./constraints-service";
import { setMoving } from "./mouseover-focusable";
import { focusInContext } from "./focus-in-context";
import { focusMomentarily } from "./focus-momentarily";
import { HotkeyService } from "./hotkey-service";

export class Phocus {
  observer: MutationObserver | undefined;
  contexts: ContextService;
  constraints: ConstraintService;
  triggers: DOMTriggersService;
  dispatch: Dispatch;
  hotkeys: HotkeyService;
  focusInContext = focusInContext;
  focusMomentarily = focusMomentarily

  constructor({contexts: actionContextService, constraints, triggers: domTriggers, dispatch, hotkeys: hotkeyService}: {
    contexts?: ContextService,
    constraints?: ConstraintService,
    triggers?: DOMTriggersService,
    dispatch?: Dispatch,
    hotkeys?: HotkeyService} = {}) {
    this.hotkeys = hotkeyService || new HotkeyService()
    this.contexts = actionContextService || new ContextService(this.hotkeys)
    this.constraints = constraints || new ConstraintService()
    this.triggers = domTriggers || new DOMTriggersService(this.contexts);
    this.dispatch = dispatch || new Dispatch(this.triggers);
  }

  setFocusedContext() {
    let focused = document.activeElement;
    if (!focused) return;
    let focusedElement: HTMLElement | undefined;
    if (!(focused instanceof HTMLElement) && focused.parentElement) {
      focusedElement = focused.parentElement;
    } else {
      focusedElement = focused as HTMLElement;
    }
    if (!focusedElement) return;
    this.contexts.setContext(focusedElement);
  }

  keydown = (e: KeyboardEvent) => {
    this.setFocusedContext();
    this.contexts.handleKeypress(e);
  }

  observe = (mutations: MutationRecord[]) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(n => {
        if (!(n instanceof HTMLElement)) return;
        this.dispatch.dispatch(n);
      });
      if (m.type == "attributes" && m.target instanceof HTMLElement) {
        if (m.target.dataset.phocusAction) {
          this.triggers.addTrigger(m.target);
        } else {
          this.triggers.removeTrigger(m.target);
        }
      }
    });
  }

  start(elt: HTMLElement) {
    this.dispatch.dispatch(elt);
    document.addEventListener("keydown", this.keydown);
    document.addEventListener("mousemove", setMoving);
    this.observer = new MutationObserver(this.observe);
    this.observer.observe(elt, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-phocus-action", "data-phocus-on-mouseover"]
    });
    this.constraints.start();
  }

  stop(elt: HTMLElement) {
    if (!this.observer) { return; }
    this.dispatch.undispatch(elt);
    document.removeEventListener("keydown", this.keydown);
    document.removeEventListener("mousemove", setMoving);
    this.observer.disconnect();
    this.constraints.stop();
  }
}
