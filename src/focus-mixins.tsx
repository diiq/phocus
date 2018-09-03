import * as React from "react";
import { ActionContextService, ActionEvent } from "index";
import { func } from "prop-types";
import { ConstrainFocusService } from "constrain-focus/constrain-focus";
import { findDOMNode } from "react-dom";

export interface NestableFocusProps {
  context?: string;
  contextComponent?: any;
  trigger?: (e: ActionEvent) => void;
}

export class NestableFocus<
  P extends NestableFocusProps,
  S
> extends React.Component<P, S> {
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

export function makeNestableFocusable<P, S>(
  component: React.ComponentClass<P, S>
): React.ComponentClass<P & NestableFocusProps, S> {
  return Object.assign({}, NestableFocus.prototype, component.prototype);
}

export interface FocusProps {
  focused?: boolean;
  stealFocus?: () => void;
  autofocus?: boolean;
}

export class Focus<P extends FocusProps, S> extends React.Component<P, S> {
  newFocus: boolean = false;

  setContext() {
    ActionContextService.newContext();
    ActionContextService.pushNewContext("link", this);
    this.context.setActionContext();
  }

  componentDidMount() {
    if (this.props.focused || this.props.autofocus) {
      const dom = findDOMNode(this)
      if (!dom) return;
      (dom as any).focus();
    }
  }

  componentWillReceiveProps(props: FocusProps) {
    if (!this.props.focused && props.focused) {
      this.newFocus = true;
    }
  }

  componentDidUpdate() {
    if (this.newFocus) {
      this.newFocus = false;
      const dom = findDOMNode(this);
      if (!dom) return;
      if (ConstrainFocusService.focusable(dom as HTMLElement)) {
        (dom as any).focus();
        this.focus();
      }
    }
  }

  focus = () => {
    if (this.props.stealFocus && !this.props.focused) {
      this.props.stealFocus();
    } else {
      this.setContext();
    }
  };
}

export function makeFocusable<P, S>(
  component: React.ComponentClass<P, S>
): React.ComponentClass<P & FocusProps, S> {
  return Object.assign({}, Focus.prototype, component.prototype);
}