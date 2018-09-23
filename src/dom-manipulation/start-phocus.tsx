import { ActionContextService } from "../action-context/action-context";
import { dispatch, undispatch } from "./dispatch";
import { addTrigger, removeTrigger } from "./add-trigger";
import { ConstrainFocusService } from "constrain-focus/constrain-focus";

function setFocusedContext() {
  let focused = document.activeElement;
  let focusedElement: HTMLElement | undefined;
  if (!(focused instanceof HTMLElement) && focused.parentElement) {
    focusedElement = focused.parentElement;
  } else {
    focusedElement = focused as HTMLElement;
  }
  if (!focusedElement) return;
  if (focusedElement == document.body) return;
  ActionContextService.setContext(focusedElement);
}

function keydown(e: KeyboardEvent) {
  setFocusedContext();
  ActionContextService.handleKeypress(e);
}

function observe(mutations: MutationRecord[]) {
  mutations.forEach(m => {
    m.addedNodes.forEach(n => {
      if (!(n instanceof HTMLElement)) return;
      dispatch(n);
    });
    if (m.type == "attributes" && m.target instanceof HTMLElement) {
      if (m.target.dataset.phocusAction) {
        addTrigger(m.target);
      } else {
        removeTrigger(m.target);
      }
    }
  });
}

var observer: MutationObserver;
export function startPhocus(elt: HTMLElement) {
  dispatch(elt);
  document.addEventListener("keydown", keydown);
  observer = new MutationObserver(observe);
  observer.observe(elt, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-phocus-action"]
  });
  ConstrainFocusService.start();
  console.debug("Phocus: Watching for changes.");
}

export function stopPhocus(elt: HTMLElement) {
  undispatch(elt);
  document.removeEventListener("keydown", keydown);
  observer.disconnect();
  ConstrainFocusService.stop();
  console.debug("Phocus: Watching stopped.");
}
