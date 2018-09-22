import * as React from "react";
import {
  ActionContextService
} from "../action-context/action-context";
import { func } from "prop-types";
import { ConstrainFocusService } from "../constrain-focus/constrain-focus";
import { findDOMNode } from "react-dom";

export interface FocusContextProps {
  context?: string;
  contextComponent?: any;
  constrainFocus?: boolean;
}

export class PhocusContext<P, S> extends React.Component<FocusContextProps & P, S> {
  contextName: string | undefined;

  static childContextTypes: {
    setActionContext: React.Requireable<(...args: any[]) => any>;
    actionInContext: React.Requireable<
      (action: string, context?: string) => any
    >;
  } = {
    setActionContext: func,
    actionInContext: func
  };

  static contextTypes: {
    setActionContext: React.Requireable<() => void>;
    actionInContext: React.Requireable<
      (action: string, context?: string) => any
    >;
  } = {
    setActionContext: func,
    actionInContext: func
  };

  ref = React.createRef<any>();

  componentWillMount() {
    if (this.props.constrainFocus) {
      ConstrainFocusService.pushConstraint(() => findDOMNode(this) as any);
    }
  }

  componentWillReceiveProps(props: FocusContextProps) {
    if (!this.props.constrainFocus && props.constrainFocus) {
      ConstrainFocusService.pushConstraint(() => findDOMNode(this) as any);
    } else if (this.props.constrainFocus && !props.constrainFocus) {
      ConstrainFocusService.popConstraint();
    }
  }

  componentWillUnmount() {
    if (this.props.constrainFocus) ConstrainFocusService.popConstraint();
  }

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

  recurseActionContext() {
    if (this.isContext(this.props.context) && this.props.contextComponent) {
      ActionContextService.pushNewContext(
        this.props.context,
        this.props.contextComponent
      );
    }
    if (this.contextName && this.isContext(this.contextName)) {
      ActionContextService.pushNewContext(this.contextName, this.ref.current);
    }
    this.ref.current && this.ref.current.duringRecurse && this.ref.current.duringRecurse();
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
    } else if (contextName && contextName === this.contextName) {
      return ActionContextService.actionInContext(contextName, action, this.ref.current);

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
        this.props.contextComponent || this.ref.current
      );

      // I can't help you -- I don't have that action in this context. Try next door.
    } else {
      return this.context.actionInContext(action, contextName);
    }
  }
}

export function makeFocusContext<P, S = {}>(
  Comp: React.ComponentClass<P, S>,
  contextName?: string
) {
  return class PhocusContextWrapper extends PhocusContext<P, S> {
    contextName = contextName;

    render() {
      return <Comp ref={this.ref} {...this.props} />;
    }
  };
}
