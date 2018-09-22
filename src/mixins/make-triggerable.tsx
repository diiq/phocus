import * as React from "react";
import {
  ActionContextService,
  Action,
  ActionEvent
} from "../action-context/action-context";
import { makeFocusable, FocusProps } from "./make-focusable";
import { FocusContextProps } from "./make-focus-context";
import { findDOMNode } from "react-dom";

export type _ = FocusContextProps | FocusProps
ActionContextService.addContext("triggerable", {
  hidden: true,
  actions: {
    trigger: new Action({
      name: "Trigger",
      shortDocumentation: "Perform the action, like a click",
      searchTerms: [],
      actOn: (c, e) => {
        c.trigger(e)
      },
      defaultKeys: ["Enter"],
      hidden: true
    })
  }
});

export interface TriggerProps {
  disabled?: boolean;
  hasPopup?: boolean;
}

export function makeTriggerable<P, S = {}>(
  Comp: React.ComponentClass<P, S>
) {
  return makeFocusable(
    class PhocusTriggerable extends React.Component<TriggerProps & P, {}> {
      setContext = () => {};

      ref = React.createRef<any>();
      newFocus = false;
      eventFocusTarget: EventTarget | null = null;
      removeFocusEvent: (() => void) | null = null;

      enabled() {
        return !this.props.disabled;
      }

      trigger(e: ActionEvent) {
        if (this.enabled()) this.ref.current.trigger(e);
      }

      onClick = (e: Event) => {
        if (this.enabled()) {
          this.ref.current.trigger(e as MouseEvent);
          e.preventDefault();
        }
        e.stopPropagation();
      };

      componentDidMount() {
        const dom = findDOMNode(this) as HTMLElement;
        dom.addEventListener("click", this.onClick);
      }

      render() {
        return <Comp ref={this.ref} {...this.props} />;
      }
    }
  , "triggerable");
}
