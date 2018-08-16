import * as React from "react";
import { ActionContextService, ActionEvent } from "./";
import { func } from "prop-types";

export interface FocusProps {
  context?: string;
  contextComponent?: any;
  trigger?: (e: ActionEvent) => void;
}

export class Focus<P extends FocusProps, S> extends React.Component<P, S> {
  static childContextTypes: {
    setActionContext: React.Requireable<(...args: any[]) => any>;
    actionInContext: React.Requireable<(...args: any[]) => any>;
  } = {
    setActionContext: func,
    actionInContext: func
  };

  static contextTypes: {
    setActionContext: React.Requireable<(...args: any[]) => any>;
    actionInContext: React.Requireable<(...args: any[]) => any>;
  } = {
    setActionContext: func,
    actionInContext: func
  };

  getChildContext() {
    return {
      setActionContext: () => this.recurseActionContext(),
      actionInContext: (action: string, context?: string) => {
        return this.actionInContext(action, context);
      }
    };
  }

  setContext() {
    ActionContextService.newContext();
    this.recurseActionContext();
  }

  duringRecurse() {
    // This method is a placeholder. Replace it in chilluns when you need to
    // take additional steps during context recursion.
  }

  recurseActionContext() {
    if (this.isContext(this.props.context) && this.props.contextComponent) {
      ActionContextService.pushNewContext(
        this.props.context,
        this.props.contextComponent
      );
    }
    this.duringRecurse();
    this.context.setActionContext();
  }

  isContext(n: string | undefined): n is string {
    return !!n;
  }

  actionInContext(action: string, contextName?: string) {
    // "This is the context you're looking for"
    if (contextName && contextName === this.props.context) {
      return ActionContextService.actionInContext(
        contextName,
        action,
        this.props.contextComponent
      );

      // You're looking for a specific context, but this ain't it. Move along.
    } else if (contextName) {
      return this.context.actionInContext(action, contextName);

      // You don't care what context; this one'll do
    } else if (
      this.isContext(this.props.context) &&
      ActionContextService.hasAction(this.props.context, action)
    ) {
      return ActionContextService.actionInContext(
        this.props.context,
        action,
        this.props.contextComponent
      );

      // I can't help you -- I don't have that action in this context. Try next door.
    } else {
      return this.context.actionInContext(action, contextName);
    }
  }
}
