import * as React from "react";
import {
  ActionContextService,
  ContextStackEntry,
  ActionInContext
} from "../action-context/action-context";
import { ConstrainFocusService } from "../constrain-focus/constrain-focus";
import { func } from "prop-types";

export interface FocusRootProps {
  contextComponent?: any
}

// WARNING: The root context is ALWAYS in scope, and is NOT
// blocked by opaque contexts! Replace it with help, etc.
ActionContextService.addContext("phocus-root", {
  name: "Root",
  documentation: "",
  actions: {}
});

export class FocusRoot extends React.Component<FocusRootProps, {}> {
  static childContextTypes: {
    setActionContext: React.Requireable<(...args: any[]) => any>;
    actionInContext: React.Requireable<(...args: any[]) => any>;
  } = {
    setActionContext: func,
    actionInContext: func
  };

  state = {
    showHelp: false,
    contextStack: [] as ContextStackEntry[]
  };

  getChildContext() {
    return {
      setActionContext: () => this.setActionContext(),
      actionInContext: (
        action: string,
        context?: string
      ): ActionInContext | undefined => {
        if (ActionContextService.hasAction("phocus-root", action)) {
          return ActionContextService.actionInContext(
            "phocus-root",
            action,
            this.props.contextComponent || this
          );
        } else {
          console.warn("Action called but not found:", action);
        }
      }
    };
  }

  setActionContext() {
    ActionContextService.pushNewContext("phocus-root", this.props.contextComponent || this);
    ActionContextService.enterNewContext();
  }

  handler(e: KeyboardEvent) {
    ActionContextService.handleKeypress(e);
  }

  componentWillMount() {
    window.removeEventListener("keydown", this.handler); // Mostly for HMR.
    window.addEventListener("keydown", this.handler);
    ConstrainFocusService.start();
  }

  componentWillUnount() {
    window.removeEventListener("keydown", this.handler);
    ConstrainFocusService.stop();
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}
